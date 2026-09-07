import React, { useMemo } from "react";
import DowntimeBarChartForDuration from "./charts/machinePerformance/DowntimeBarChartForDuration";
import { useSelector } from "react-redux";

export default function DowntimeDurationCard({ selected, setSelected, dropdownData }) {
  const { durationData } = useSelector((state) => state.machineDowntime);

  // console.log("Duration Data in DowntimeDurationCard:", durationData);

  // Process data for chart
  const { chartLabels, chartDatasets } = useMemo(() => {
  if (!durationData || durationData.length === 0) {
    return { chartLabels: [], chartDatasets: [] };
  }

  // ✅ Check if we have PeriodLabel in data
  const isShiftData = durationData[0]?.PeriodLabel !== undefined;

  if (isShiftData) {
    // --- SHIFT VIEW ---
    const labels = [...new Set(durationData.map(d => d.PeriodLabel))];

    const grouped = {};
    durationData.forEach(d => {
      const shift = d.PeriodLabel;
      const loss = d.LossName || "Unknown";

      if (!grouped[loss]) grouped[loss] = new Array(labels.length).fill(0);

      const idx = labels.indexOf(shift);
      grouped[loss][idx] += d.MinutesLost || 0;
    });

    const datasets = Object.keys(grouped).map(loss => ({
      label: loss,
      data: grouped[loss],
      backgroundColor: getColor(loss),
      stack: "Stack 0",
    }));

    return { chartLabels: labels, chartDatasets: datasets };
  } else {
    // --- HOURLY VIEW ---
    const hours = durationData.flatMap(d => [
      new Date(d.HourStart).getUTCHours(),
      new Date(d.HourEnd).getUTCHours(),
    ]);

    const startHour = Math.min(...hours);
    const endHour = Math.max(...hours);

    const labels = [];
    for (let h = startHour; h < endHour; h++) labels.push(`${h}-${h + 1}`);

    const grouped = {};
    durationData.forEach(d => {
      const start = new Date(d.HourStart).getUTCHours();
      const idx = start - startHour;
      const loss = d.LossName || "Unknown";

      if (!grouped[loss]) grouped[loss] = new Array(labels.length).fill(0);
      grouped[loss][idx] = d.MinutesLost || 0;
    });

    const datasets = Object.keys(grouped).map(loss => ({
      label: loss,
      data: grouped[loss],
      backgroundColor: getColor(loss),
      stack: "Stack 0",
    }));

    return { chartLabels: labels, chartDatasets: datasets };
  }
}, [durationData]);


  // Utility: assign fixed colors
  function getColor(loss) {
    const colors = {
      Machine: "rgba(255, 99, 132, 0.6)",
      Material: "rgba(54, 162, 235, 0.6)",
      Unknown: "rgba(201, 203, 207, 0.6)",
    };
    return colors[loss] || "rgba(75, 192, 192, 0.6)";
  }

  return (
    <div className="border rounded-lg shadow-sm p-3 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Total Downtime by Duration</h3>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border px-2 py-1 rounded bg-blue-100"
        >
          <option value="All">All</option>
          {dropdownData.map((item, idx) => (
            <option key={idx} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {/* Chart */}
      <DowntimeBarChartForDuration labels={chartLabels} datasets={chartDatasets} />
    </div>
  );
}
