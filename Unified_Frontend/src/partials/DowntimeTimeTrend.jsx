// src/partials/DowntimeTimeTrend.jsx
import React, { useEffect, useState, useMemo } from "react";
import CumulativeChart from "./charts/CumulativeChart";
import { useSelector } from "react-redux";
import { apiConnector } from "../services/apiConnecter"; // adjust path if needed
import { endpoints } from "../services/apis"; // adjust path if needed

export default function DowntimeTimeTrend({ equipmentKey }) {
  const [lossId, setLossId] = useState("All"); // LossID values (string or number)
  const [subLossId, setSubLossId] = useState("All");

  const lossNames = useSelector((state) => state.machine.lossNames || []);
  const filters = useSelector((state) => state.filters || {}); // uses your global filters (period/startDate/endDate)

  const [subOptions, setSubOptions] = useState([]);
  const [loadingSub, setLoadingSub] = useState(false);
  const [subError, setSubError] = useState(null);

  const [loadingTrend, setLoadingTrend] = useState(false);
  const [trendError, setTrendError] = useState(null);

  // Chart data (arrays of { label, value })
  const [durationData, setDurationData] = useState([]);
  const [occurrenceData, setOccurrenceData] = useState([]);

  // helpers
  const getLossId = (l) => l.LossID ?? l.ID ?? l.id ?? null;
  const getLossLabel = (l) => l.LossName ?? l.LossDesc ?? l.Name ?? String(getLossId(l));

  const getSubId = (s) => s.SubLossID ?? s.SublossID ?? s.ID ?? s.id ?? null;
  const getSubLabel = (s) => s.SubLossName ?? s.SublossName ?? s.SubLossDesc ?? s.Name ?? String(getSubId(s));

  // build mode from filters.period (mapping to what backend expects)
  // your code earlier used filters.period — normalize same way
  const mode = useMemo(() => {
    const p = (filters.period || "shift").toLowerCase();
    if (p === "custom") return "date";
    return p; // shift | day | week | month | date
  }, [filters.period]);

  // When lossId changes, fetch subloss list
  useEffect(() => {
    setSubOptions([]);
    setSubLossId("All");
    setSubError(null);

    if (!lossId || lossId === "All") return;

    let cancelled = false;
    const fetchSubLosses = async () => {
      try {
        setLoadingSub(true);
        const url = `${endpoints.MACHINE_SUBLOSS_API}?LossID=${encodeURIComponent(lossId)}`;
        const res = await apiConnector("GET", url);
        if (cancelled) return;
        if (res?.status >= 200 && res?.status < 300) {
          setSubOptions(res.data?.data || []);
        } else {
          setSubError("Failed to load sub-losses");
          setSubOptions([]);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching sublosses:", err);
        setSubError("Failed to load sub-losses");
        setSubOptions([]);
      } finally {
        if (!cancelled) setLoadingSub(false);
      }
    };

    fetchSubLosses();
    return () => (cancelled = true);
  }, [lossId]);

  // Build query params & fetch cumulative trend depending on mode
  useEffect(() => {
    // require equipmentKey else we cannot call APIs (SP expects EquipmentID/Key)
    if (!equipmentKey) {
      setTrendError("No equipment selected.");
      setDurationData([]);
      setOccurrenceData([]);
      return;
    }

    // We'll fetch whenever mode, lossId, subLossId or date filters change
    let cancelled = false;

    const fetchTrend = async () => {
      setTrendError(null);
      setLoadingTrend(true);
      setDurationData([]);
      setOccurrenceData([]);

      try {
        // Use SHIFT endpoint for mode === 'shift'
        if (mode === "shift") {
          // SHIFT_CUMULATIVE_TREND_API expects EquipmentID/EquipmentKey & may accept LossID/SubLossID
          const params = new URLSearchParams();
          params.set("EquipmentID", equipmentKey);
          // include LossID/SubLossID only if not "All"
          if (lossId && lossId !== "All") params.set("LossID", lossId);
          if (subLossId && subLossId !== "All") params.set("SubLossID", subLossId);

          const url = `${endpoints.SHIFT_CUMULATIVE_TREND_API}?${params.toString()}`;
          const res = await apiConnector("GET", url);
          if (cancelled) return;

          const rows = res?.data?.data ?? res?.data ?? [];
          // parse HourSlot / Duration_Minutes / Occurrences
          const dur = (Array.isArray(rows) ? rows : []).map((r) => ({
            label: r.HourSlot ?? `H${r.HourNo ?? ""}`,
            value: Number(r.Duration_Minutes ?? r.Minutes ?? r.Duration ?? 0),
          }));
          const occ = (Array.isArray(rows) ? rows : []).map((r) => ({
            label: r.HourSlot ?? `H${r.HourNo ?? ""}`,
            value: Number(r.Occurrences ?? r.Count ?? 0),
          }));
          setDurationData(dur);
          setOccurrenceData(occ);
        } else {
          // Mode is day|week|month|date -> call MODE_CUMULATIVE_TREND_API
          const params = new URLSearchParams();
          params.set("EquipmentID", equipmentKey);
          params.set("Mode", mode); // backend accepts day/week/month/date (case-insensitive)
          // when mode === date, also pass start & end from filters
          if (mode === "date") {
            if (filters.startDate) params.set("StartDate", filters.startDate);
            if (filters.endDate) params.set("EndDate", filters.endDate);
          }
          if (lossId && lossId !== "All") params.set("LossID", lossId);
          if (subLossId && subLossId !== "All") params.set("SubLossID", subLossId);

          const url = `${endpoints.MODE_CUMULATIVE_TREND_API}?${params.toString()}`;
          const res = await apiConnector("GET", url);
          if (cancelled) return;

          const rows = res?.data?.data ?? res?.data ?? [];
          // expected PeriodLabel, MinutesLost, Occurrences or Date/Month
          const dur = (Array.isArray(rows) ? rows : []).map((r) => {
            const label = r.PeriodLabel ?? r.PeriodKey ?? r.Date ?? r.Month ?? r.TxnDate ?? "Unknown";
            return { label: String(label), value: Number(r.MinutesLost ?? r.TotalConsumption ?? r.Duration_Minutes ?? r.Duration ?? 0) };
          });
          const occ = (Array.isArray(rows) ? rows : []).map((r) => {
            const label = r.PeriodLabel ?? r.PeriodKey ?? r.Date ?? r.Month ?? r.TxnDate ?? "Unknown";
            return { label: String(label), value: Number(r.Occurrences ?? r.Count ?? r.TotalOccurrences ?? 0) };
          });

          // sort: try to sort by label if it's a yyyy-MM or yyyy/MM or ISO date
          const normalizeSort = (a, b) => {
            const A = a.label, B = b.label;
            if (/^\d{4}-\d{2}$/.test(A) && /^\d{4}-\d{2}$/.test(B)) return A.localeCompare(B);
            if (/^\d{4}\/\d{2}$/.test(A) && /^\d{4}\/\d{2}$/.test(B)) return A.localeCompare(B);
            const da = new Date(A), db = new Date(B);
            if (!isNaN(da.getTime()) && !isNaN(db.getTime())) return da - db;
            return String(A).localeCompare(String(B));
          };

          dur.sort(normalizeSort);
          occ.sort(normalizeSort);

          setDurationData(dur);
          setOccurrenceData(occ);
        }
      } catch (err) {
        console.error("Error fetching cumulative trend:", err);
        if (!cancelled) setTrendError("Failed to load trend data");
      } finally {
        if (!cancelled) setLoadingTrend(false);
      }
    };

    fetchTrend();
    return () => (cancelled = true);
    // dependencies: mode, lossId, subLossId, equipmentKey, filter dates
  }, [mode, lossId, subLossId, equipmentKey, filters.startDate, filters.endDate]);

  // Loss options (All + redux list)
  const lossOptions = [
    <option key="all" value="All">All</option>,
    ...lossNames.map((l) => {
      const id = getLossId(l);
      return (
        <option key={id ?? Math.random()} value={id}>
          {getLossLabel(l)}
        </option>
      );
    }),
  ];

  const subOptionsRendered = [
    <option key="all" value="All">All</option>,
    ...(subOptions || []).map((s) => {
      const id = getSubId(s);
      return (
        <option key={id ?? Math.random()} value={id}>
          {getSubLabel(s)}
        </option>
      );
    }),
  ];

  return (
    <>
      <h2 className="bg-[#3c51d2] p-3 rounded-lg text-white text-center shadow-sm font-bold text-lg mb-4">
        Downtime Time Trend
      </h2>

      <div className="bg-white rounded-md shadow p-3 mt-4 dark:bg-gray-800 gap-4">
        <div className="flex justify-center gap-4 my-3">
          <div>
            <label className="mr-2 font-medium">Loss Code</label>
            <select
              value={lossId}
              onChange={(e) => setLossId(e.target.value)}
              className="border rounded px-8 py-1"
            >
              {lossOptions}
            </select>
          </div>

          <div>
            <label className="mr-2 font-medium">Sub Loss Code</label>
            <select
              value={subLossId}
              onChange={(e) => setSubLossId(e.target.value)}
              className="border rounded px-8 py-1"
              disabled={lossId === "All" || loadingSub}
            >
              {loadingSub ? <option>Loading...</option> : subOptionsRendered}
            </select>
            {subError && <div className="text-red-500 text-sm mt-1">{subError}</div>}
          </div>
        </div>

        {trendError && <div className="text-red-600 text-sm text-center mb-4">{trendError}</div>}

        {/* Duration chart */}
        <CumulativeChart
          title="Cumulative Trend by Duration"
          color="#9b59b6"
          loading={loadingTrend}
          durationData={durationData}
          occurrenceData={[]}
        />

        {/* Occurrence chart */}
        <CumulativeChart
          title="Cumulative Trend by Occurrence"
          color="#3498db"
          loading={loadingTrend}
          durationData={occurrenceData} // pass occurrence as durationData here (chart renders single series)
          occurrenceData={[]}
        />
      </div>
    </>
  );
}
