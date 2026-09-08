import { getBackendBaseUrl } from "../../../utils/apiConfig";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../partials/DashboardLayout.jsx";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import axios from "axios";

// normalize BASE (remove trailing slash)
const BASE = getBackendBaseUrl();

export default function SparePartUI() {
  const navigate = useNavigate();

  // -------------------------
  // UI STATE
  // -------------------------
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  const [category, setCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);

  // Chart Data
  const [spareConsumptionChart, setSpareConsumptionChart] = useState([]);
  const [top50Chart, setTop50Chart] = useState([]);

  // Loading & Errors
  const [loadingApi, setLoadingApi] = useState(false);
  const [loadingTop50, setLoadingTop50] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [top50Error, setTop50Error] = useState(null);

  // -------------------------
  // FETCH CATEGORY NAMES
  // -------------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${BASE}/MouldMaintenanceHistorySparePart/SparePartCategoryName`
        );
        setCategoryList(res.data?.data ?? []);
      } catch (err) {
        console.error("Category fetch error:", err);
      }
    };
    fetchCategories();
  }, []);

  // -------------------------
  // API: SPARE CONSUMPTION (LINE)
  // -------------------------
  const fetchSpareConsumption = async (startDate, endDate, SparePartCategory) => {
    setLoadingApi(true);
    setApiError(null);
    setSpareConsumptionChart([]);

    try {
      const res = await axios.get(
        `${BASE}/MouldMaintenanceHistorySparePart/DashboardSpareConsumptionByCategory`,
        {
          params: {
            startDate,
            endDate,
            SparePartCategory, // ✅ NAME
          },
        }
      );

      const rows = res.data?.data ?? [];

      if (!rows.length) {
        setApiError("No data found for selected filters");
        return;
      }

      const parsed = rows
        .map((r) => ({
          label: r.Date || r.Month,
          value: Number(r.TotalConsumption) || 0,
        }))
        .sort((a, b) => new Date(a.label) - new Date(b.label));

      setSpareConsumptionChart(parsed);
    } catch (err) {
      console.error("Spare consumption API error:", err);
      setApiError("Failed to load spare consumption data");
    } finally {
      setLoadingApi(false);
    }
  };

  // -------------------------
  // API: TOP 50 SPARES
  // -------------------------
  const fetchTop50SpareConsumption = async (
    startDate,
    endDate,
    SparePartCategory
  ) => {
    setLoadingTop50(true);
    setTop50Error(null);
    setTop50Chart([]);

    try {
      const res = await axios.get(
        `${BASE}/MouldMaintenanceHistorySparePart/DashboardTop50SpareConsumption`,
        {
          params: {
            startDate,
            endDate,
            SparePartCategory, // ✅ NAME
          },
        }
      );

      const rows = res.data?.data ?? [];

      if (!rows.length) {
        setTop50Error("No top spare data found");
        return;
      }

      const agg = {};
      rows.forEach((r) => {
        const name = r.SparePartName || "Unknown";
        const qty = Number(r.TotalConsumption) || 0;
        agg[name] = (agg[name] || 0) + qty;
      });

      const finalData = Object.entries(agg)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50);

      setTop50Chart(finalData);
    } catch (err) {
      console.error("Top50 API error:", err);
      setTop50Error("Failed to load top spare consumption");
    } finally {
      setLoadingTop50(false);
    }
  };

  // -------------------------
  // CATEGORY CHANGE
  // -------------------------
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    setSpareConsumptionChart([]);
    setTop50Chart([]);
    setApiError(null);
    setTop50Error(null);

    if (value && rangeStart && rangeEnd) {
      fetchSpareConsumption(rangeStart, rangeEnd, value);
      fetchTop50SpareConsumption(rangeStart, rangeEnd, value);
    }
  };

  // -------------------------
  // APPLY FILTER
  // -------------------------
  const applyFilter = async () => {
    if (!rangeStart || !rangeEnd) {
      alert("Select start and end date");
      return;
    }
    if (!category) {
      alert("Select spare part category");
      return;
    }

    await fetchSpareConsumption(rangeStart, rangeEnd, category);
    await fetchTop50SpareConsumption(rangeStart, rangeEnd, category);
  };

  const lineChartData = spareConsumptionChart.map((d) => ({
    name: d.label,
    value: d.value,
  }));

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* TOP NAV */}
        <div className="flex gap-3 mb-6">
          {["PM", "HC", "Breakdown", "Spare Part"].map((b, i) => (
            <button
              key={i}
              className={`px-6 py-2 rounded-lg font-semibold text-white ${
                b === "Spare Part" ? "bg-red-600" : "bg-blue-600"
              }`}
              onClick={() =>
                navigate(
                  b === "PM"
                    ? "/MouldMaintenanceHistory"
                    : b === "HC"
                    ? "/HCHistory"
                    : b === "Breakdown"
                    ? "/MouldBreakdownHistory"
                    : "/SparePartHistory"
                )
              }
            >
              {b}
            </button>
          ))}
        </div>

        {/* FILTERS */}
        <div className="flex gap-4 mb-6">
          <input
            type="date"
            value={rangeStart}
            onChange={(e) => setRangeStart(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <input
            type="date"
            value={rangeEnd}
            onChange={(e) => setRangeEnd(e.target.value)}
            className="border px-3 py-2 rounded"
          />

          <select
            value={category}
            onChange={handleCategoryChange}
            className="border px-4 py-2 rounded"
          >
            <option value="">Select Category</option>
            {categoryList.map((c) => (
              <option
                key={c.SparePartCategory}
                value={c.SparePartCategory}
              >
                {c.SparePartCategory}
              </option>
            ))}
          </select>

          <button
            onClick={applyFilter}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Apply
          </button>
        </div>

        {/* LINE CHART */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="text-center font-semibold mb-2">
            Spare Part Consumption
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey="value" stroke="#1E3A8A" dot />
            </LineChart>
          </ResponsiveContainer>
          {apiError && (
            <p className="text-center text-red-600 mt-2">{apiError}</p>
          )}
        </div>

        {/* TOP 50 BAR */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-center font-semibold mb-2">
            Top 50 Spare Parts
          </h3>
          <ResponsiveContainer width="100%" height={1200}>
            <BarChart data={top50Chart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={200} />
              <Tooltip />
              <Bar dataKey="value" fill="#1E3A8A" />
            </BarChart>
          </ResponsiveContainer>
          {top50Error && (
            <p className="text-center text-red-600 mt-2">{top50Error}</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
