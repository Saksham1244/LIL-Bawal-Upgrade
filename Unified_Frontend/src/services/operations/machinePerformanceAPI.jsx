// src/services/operations/machinePerformanceAPI.js
import { apiConnector } from "../apiConnecter";
import { endpoints } from "../apis";
import { toast } from "react-hot-toast";
import {
  setMachineOEEData,
  setMachineTimesData,
  setLossNamesData,
  setSubLossNamesData,
  setFourMLossData,
  // NEW: cumulative trend reducers (make sure they exist in machineSlice)
  setCumulativeTrendDuration,
  setCumulativeTrendOccurrence,
  clearCumulativeTrendData,
} from "../../slices/machineSlice";
// import the new action at file top
import { setExpectedVsActual, clearExpectedVsActual } from "../../slices/machineSlice";
import { setQualityTrend, clearQualityTrend } from "../../slices/machineSlice";
import { setRejectionReasons, clearRejectionReasons } from "../../slices/machineSlice";

export function machinePerformanceAPI({
  mode = "Shift",
  equipmentName,
  equipmentKey,
  startDate,
  endDate,
} = {}) {
  return async (dispatch) => {
    try {
      if (!equipmentName) {
        throw new Error("EquipmentName (machine) is required");
      }

      // Build query params dynamically
      let query = `mode=${mode}&EquipmentName=${encodeURIComponent(equipmentName)}`;
      if (mode === "DATE" && startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }

      // 1) Machine OEE
      const machineUrl = `${endpoints.MACHINE_PERFORMANCE_API}?${query}`;
      const response = await apiConnector("GET", machineUrl);
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Machine OEE API Error: ${response.status}`);
      }
      const machineData = response.data?.data || [];
      dispatch(setMachineOEEData(machineData));

      // 2) Machine Times
      const timesUrl = `${endpoints.MACHINE_TIMES_API}?${query}`;
      const timesResponse = await apiConnector("GET", timesUrl);
      if (timesResponse.status < 200 || timesResponse.status >= 300) {
        throw new Error(`Machine Times API Error: ${timesResponse.status}`);
      }
      const machineTimesData = timesResponse.data?.data || [];
      dispatch(setMachineTimesData(machineTimesData));

      // 3) Loss Names
      const lossUrl = `${endpoints.MACHINE_LOSSNAME_API}`;
      const lossResponse = await apiConnector("GET", lossUrl);
      if (lossResponse.status < 200 || lossResponse.status >= 300) {
        throw new Error(`Machine Loss Names API Error: ${lossResponse.status}`);
      }
      const lossNamesData = lossResponse.data?.data || [];
      dispatch(setLossNamesData(lossNamesData));

      // 3.1) SubLoss Names (fetch all once and store in redux)
      let subLossNamesData = [];
      try {
        const subLossUrl = `${endpoints.MACHINE_SUBLOSS_API}`; // call without LossID to get all
        const subLossResponse = await apiConnector("GET", subLossUrl);
        if (subLossResponse.status >= 200 && subLossResponse.status < 300) {
          subLossNamesData = subLossResponse.data?.data || [];
          dispatch(setSubLossNamesData(subLossNamesData));
        } else {
          console.warn("Machine SubLoss Names API returned non-2xx:", subLossResponse.status);
        }
      } catch (subErr) {
        console.error("Error fetching SubLoss names:", subErr);
      }

      // 4) 4M Loss Data (Shift / day / week / month / date range) + TPM (added)
      if (equipmentKey) {
        let fourMUrl = "";
        const modeParam = mode.toLowerCase();
        if (modeParam === "shift") {
          fourMUrl = `${endpoints.FOURM_SHIFT_LOSS_API}?EquipmentKey=${equipmentKey}`;
        } else if (modeParam === "date" || modeParam === "dates") {
          fourMUrl = `${endpoints.FOURM_LOSS_FILTER_API}?EquipmentKey=${equipmentKey}&Mode=${mode}&startDate=${startDate}&endDate=${endDate}`;
        } else {
          fourMUrl = `${endpoints.FOURM_LOSS_FILTER_API}?EquipmentKey=${equipmentKey}&Mode=${mode}`;
        }

        const fourMResponse = await apiConnector("GET", fourMUrl);
        if (fourMResponse.status < 200 || fourMResponse.status >= 300) {
          throw new Error(`4M Loss API Error: ${fourMResponse.status}`);
        }
        const fourMLossData = fourMResponse.data?.data || [];

        // TPM
        let tpmData = [];
        try {
          let tpmUrl = "";
          if (modeParam === "shift") {
            tpmUrl = `${endpoints.TPM_SHIFT_LOSS_API}?EquipmentKey=${equipmentKey}`;
          } else if (modeParam === "date" || modeParam === "dates") {
            tpmUrl = `${endpoints.TPM_LOSS_FILTER_API}?EquipmentKey=${equipmentKey}&Mode=${mode}&StartDate=${startDate}&EndDate=${endDate}`;
          } else {
            tpmUrl = `${endpoints.TPM_LOSS_FILTER_API}?EquipmentKey=${equipmentKey}&Mode=${mode}`;
          }

          const tpmResponse = await apiConnector("GET", tpmUrl);
          if (tpmResponse.status >= 200 && tpmResponse.status < 300) {
            tpmData = tpmResponse.data?.data || [];
          } else {
            console.warn("TPM Loss API returned non-2xx:", tpmResponse.status);
          }
        } catch (tpmErr) {
          console.error("TPM Loss API error:", tpmErr);
        }

        const combined =
          (Array.isArray(fourMLossData) && fourMLossData.length > 0) || (Array.isArray(tpmData) && tpmData.length > 0)
            ? { FourM: fourMLossData, TPM: tpmData }
            : fourMLossData;

        dispatch(setFourMLossData(combined));
      }

      // -----------------------------
      // 5) CUMULATIVE TREND (Duration & Occurrence)
      // -----------------------------
      // Clear previous trend data first
      if (typeof clearCumulativeTrendData === "function") {
        dispatch(clearCumulativeTrendData());
      }

      try {
        // if mode is shift -> call shift stored-proc route (hourly)
        const normalizedMode = (mode || "shift").toLowerCase();
        let trendResponse = null;
        if (normalizedMode === "shift") {
          // GET /PerfMachine/GetShiftCumulativeTrendDurationOccurrence?equipmentKey=...&lossId=...&subLossId=...
          const params = new URLSearchParams();
          params.set("equipmentKey", equipmentKey || "");
          // don't pass LossID/SubLossID here — we'll leave them optional in this call (frontend chooses later)
          // If you want to include default filters, pass them similarly: params.set('lossId', someValue)
          const shiftUrl = `${endpoints.SHIFT_CUMULATIVE_TREND_API}?${params.toString()}`;
          trendResponse = await apiConnector("GET", shiftUrl);
        } else {
          // MODE (day/week/month/date) -> call Mode API
          const params = new URLSearchParams();
          params.set("EquipmentKey", equipmentKey || "");
          params.set("Mode", normalizedMode);
          if (normalizedMode === "date" || normalizedMode === "custom") {
            if (startDate) params.set("StartDate", startDate);
            if (endDate) params.set("EndDate", endDate);
          }
          // Loss/SubLoss left to filters on front-end; we fetch overall trend here
          const modeUrl = `${endpoints.MODE_CUMULATIVE_TREND_API}?${params.toString()}`;
          trendResponse = await apiConnector("GET", modeUrl);
        }

        if (trendResponse && trendResponse.status >= 200 && trendResponse.status < 300) {
          const raw = trendResponse.data?.data || [];

          let durationData = [];
          let occurrenceData = [];

          if ((mode || "shift").toLowerCase() === "shift") {
            // expected: HourNo, HourSlot, Duration_Minutes, Occurrences
            durationData = (raw || []).map((r) => ({
              label: r.HourSlot ?? `H${r.HourNo}`,
              value: Number(r.Duration_Minutes ?? r.Duration_Min ?? 0),
            }));
            occurrenceData = (raw || []).map((r) => ({
              label: r.HourSlot ?? `H${r.HourNo}`,
              value: Number(r.Occurrences ?? 0),
            }));
          } else {
            // expected: PeriodKey, PeriodLabel, MinutesLost, Occurrences
            durationData = (raw || []).map((r) => ({
              label: r.PeriodLabel ?? `P${r.PeriodKey}`,
              value: Number(r.MinutesLost ?? r.MinutesLost ?? 0),
            }));
            occurrenceData = (raw || []).map((r) => ({
              label: r.PeriodLabel ?? `P${r.PeriodKey}`,
              value: Number(r.Occurrences ?? 0),
            }));
          }

          dispatch(setCumulativeTrendDuration(durationData));
          dispatch(setCumulativeTrendOccurrence(occurrenceData));
        } else {
          // if trend API non-2xx, just log and continue
          console.warn("Trend API non-2xx or empty", trendResponse?.status);
        }
      } catch (trendErr) {
        console.error("Error fetching cumulative trend data:", trendErr);
      }

            // -----------------------------
      // Expected vs Actual: call hourly/aggregate trend API
      // -----------------------------
      try {
        // normalizedMode mapping: frontend uses filters.period (shift/day/month/week/date)
        const normalizedMode = (mode || "shift").toLowerCase(); // machinePerformanceAPI receives mode param
        // build query params
        const params = new URLSearchParams();
       // params.set("Mode", normalizedMode); // sp expects e.g. SHIFT, DAY, WEEK, MONTH, DATE (case-insensitive)
       params.set("Mode", normalizedMode.toUpperCase());

        if (equipmentKey) {
          // NOTE: stored proc param name is EquipmentID in SP; earlier code used EquipmentID or EquipmentKey - match backend
          params.set("EquipmentID", equipmentKey);
        }
        // if mode is date, include start & end
        if (normalizedMode === "date" && startDate && endDate) {
          params.set("StartDate", startDate);
          params.set("EndDate", endDate);
        }

        const url = `${endpoints.HOURLY_EXP_ACTUAL_TREND_API}?${params.toString()}`;
        const trendResp = await apiConnector("GET", url);

        if (trendResp && trendResp.status >= 200 && trendResp.status < 300) {
          const raw = trendResp.data?.data || [];

          // raw expected columns depend on mode:
          // SHIFT -> HourStart, HourEnd, ExpectedQuantity, ActualQuantity
          // Others -> TrendGroup, ExpectedQuantity, ActualQuantity
          let labels = [];
          let expected = [];
          let actual = [];

          if (normalizedMode === "shift") {
            labels = raw.map(r => `${r.HourStart} - ${r.HourEnd}`);
            expected = raw.map(r => Number(r.ExpectedQuantity ?? 0));
            actual = raw.map(r => Number(r.ActualQuantity ?? 0));
          } else {
            // DAY / WEEK / MONTH / DATE group by TrendGroup
            labels = raw.map(r => r.TrendGroup ?? r.PeriodLabel ?? "");
            expected = raw.map(r => Number(r.ExpectedQuantity ?? 0));
            actual = raw.map(r => Number(r.ActualQuantity ?? 0));
          }

          // if empty, set default single 'No data' row so chart doesn't crash
          if (labels.length === 0) {
            labels = ["No data"];
            expected = [0];
            actual = [0];
          }

          const payload = { labels, expected, actual };
          dispatch(setExpectedVsActual(payload));
        } else {
          // non-2xx -> clear
          dispatch(clearExpectedVsActual());
        }
      } catch (err) {
        console.error("Error fetching Expected vs Actual trend:", err);
        dispatch(clearExpectedVsActual());
      }
//rejected and good part

try {
  const normalizedMode = (mode || "shift").toLowerCase();
  const params = new URLSearchParams();
  params.set("Mode", normalizedMode.toUpperCase());
  if (equipmentKey) params.set("EquipmentID", equipmentKey);
  if (normalizedMode === "date" && startDate && endDate) {
    params.set("StartDate", startDate);
    params.set("EndDate", endDate);
  }

  const url = `${endpoints.REJECTED_TREND_API}?${params.toString()}`;
  const res = await apiConnector("GET", url);

  if (res && res.status >= 200 && res.status < 300) {
    const raw = res.data?.data || [];
    let labels = [];
    let totalQty = [];
    let rejectedQty = [];
    let rejectionRate = [];

    if (normalizedMode === "shift") {
      labels = raw.map(r => `${r.HourStart} - ${r.HourEnd}`);
      totalQty = raw.map(r => Number(r.TotalQuantity ?? 0));
      rejectedQty = raw.map(r => Number(r.RejectedCount ?? 0));
      rejectionRate = raw.map(r => {
        const total = Number(r.TotalQuantity ?? 0);
        const rej = Number(r.RejectedCount ?? 0);
        return total > 0 ? ((rej / total) * 100).toFixed(2) : 0;
      });
    } else {
      labels = raw.map(r => r.TrendGroup ?? r.PeriodLabel ?? "");
      totalQty = raw.map(r => Number(r.TotalQuantity ?? 0));
      rejectedQty = raw.map(r => Number(r.RejectedCount ?? 0));
      rejectionRate = raw.map(r => {
        const total = Number(r.TotalQuantity ?? 0);
        const rej = Number(r.RejectedCount ?? 0);
        return total > 0 ? ((rej / total) * 100).toFixed(2) : 0;
      });
    }

    if (labels.length === 0) {
      labels = ["No data"];
      totalQty = [0];
      rejectedQty = [0];
      rejectionRate = [0];
    }

    dispatch(setQualityTrend({ labels, totalQty, rejectedQty, rejectionRate }));
  } else {
    dispatch(clearQualityTrend());
  }
} catch (err) {
  console.error("Error fetching quality trend:", err);
  dispatch(clearQualityTrend());
}
try {
  const normalizedMode = (mode || "shift").toLowerCase();
  const params = new URLSearchParams();
  params.set("Mode", normalizedMode.toUpperCase());
  if (equipmentKey) params.set("EquipmentID", equipmentKey);
  if (normalizedMode === "date" && startDate && endDate) {
    params.set("StartDate", startDate);
    params.set("EndDate", endDate);
  }

  const url = `${endpoints.REJECTION_REASON_API}?${params.toString()}`;
  const res = await apiConnector("GET", url);

  if (res && res.status >= 200 && res.status < 300) {
    const raw = res.data?.data || [];

    const labels = raw.map(r => r.Reason ?? "Unknown");
    const counts = raw.map(r => Number(r.RejectedQty ?? 0));

    if (labels.length === 0) {
      labels.push("No Data");
      counts.push(0);
    }
console.log("Setting rejection reasons:", labels, counts);

    dispatch(setRejectionReasons({ labels, counts }));
  } else {
    dispatch(clearRejectionReasons());
  }
} catch (err) {
  console.error("Error fetching rejection reasons:", err);
  dispatch(clearRejectionReasons());
}

      // return useful info if caller needs it
      return { machineData, machineTimesData, lossNamesData, subLossNamesData };
    } catch (error) {
      console.error("MACHINE PERFORMANCE API ERROR", error);
      toast.error("Failed to fetch machine performance data");
      throw error;
    }
  };
}
