import React, { useMemo } from "react";
import DowntimeBarChartForOccurrence from "./charts/machinePerformance/DowntimeBarChartForOccurrence";
import { useSelector } from "react-redux";

export default function DowntimeDurationCard({ selected, setSelected, dropdownData }) {
    const {occurrenceData} = useSelector((state) => state.machineDowntime);
    // console.log("Occurrence Data in DowntimeOccurrenceCard:", occurrenceData);


  const { chartLabels, chartDatasets } = useMemo(() => {
  if (!occurrenceData || occurrenceData.length === 0) {
    return { chartLabels: [], chartDatasets: [] };
  }

  // Check if shift-based data exists
  const isShiftData = occurrenceData[0]?.PeriodLabel !== undefined;

  if (isShiftData) {
    // --- SHIFT VIEW ---
    const labels = [...new Set(occurrenceData.map(d => d.PeriodLabel))];

    const grouped = {};
    occurrenceData.forEach(d => {
      const shift = d.PeriodLabel;
      const loss = d.LossName || "Unknown";

      if (!grouped[loss]) grouped[loss] = new Array(labels.length).fill(0);

      const idx = labels.indexOf(shift);
      grouped[loss][idx] += d?.Occurrences || 0; // ✅ use Occurrences here
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
    const hours = occurrenceData.flatMap(d => [
      new Date(d.HourStart).getUTCHours(),
      new Date(d.HourEnd).getUTCHours(),
    ]);

    const startHour = Math.min(...hours);
    const endHour = Math.max(...hours);

    const labels = [];
    for (let h = startHour; h < endHour; h++) labels.push(`${h}-${h + 1}`);

    const grouped = {};
    occurrenceData.forEach(d => {
      const start = new Date(d.HourStart).getUTCHours();
      const idx = start - startHour;
      const loss = d.LossName || "Unknown";

      if (!grouped[loss]) grouped[loss] = new Array(labels.length).fill(0);
      grouped[loss][idx] = d?.Occurrences || 0; // ✅ use Occurrences here
    });

    const datasets = Object.keys(grouped).map(loss => ({
      label: loss,
      data: grouped[loss],
      backgroundColor: getColor(loss),
      stack: "Stack 0",
    }));

    return { chartLabels: labels, chartDatasets: datasets };
  }
}, [occurrenceData]);



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
        <h3 className="font-semibold">Total Downtime by Occurrence</h3>
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
      <DowntimeBarChartForOccurrence labels={chartLabels} datasets={chartDatasets} />
    </div>
  );
}
