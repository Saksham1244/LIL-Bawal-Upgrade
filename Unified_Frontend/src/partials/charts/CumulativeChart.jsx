// src/partials/charts/CumulativeChart.jsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Props:
 *  - title: string
 *  - color: hex/string
 *  - loading: boolean
 *  - durationData: [{ label, value }]
 *  - bottomPadding: number (extra space under chart for x-axis labels) - default 40
 *  - containerStyle: object - extra style for outer container (e.g. marginTop)
 */
export default function CumulativeChart({
  title,
  color = "#1E40AF",
  loading = false,
  durationData = [],
  bottomPadding = 40,
  containerStyle = {},
}) {
  // Loading placeholder
  if (loading) {
    return (
      <div
        className="h-64 mt-4 border rounded-md p-2 shadow-sm bg-white dark:bg-gray-800"
        style={containerStyle}
      >
        <h3 className="font-semibold text-center mb-2">{title}</h3>
        <div className="h-full flex items-center justify-center text-sm text-gray-600">
          Loading...
        </div>
      </div>
    );
  }

  const labels = durationData && durationData.length ? durationData.map((d) => d.label) : ["No data"];
  const values = durationData && durationData.length ? durationData.map((d) => d.value) : [0];

  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 8,
        right: 12,
        left: 12,
        bottom: bottomPadding, // reserve space for x-axis labels
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false,
          callback: function (value) {
            // shorten long labels slightly if needed
            const label = this.getLabelForValue(value);
            if (typeof label === "string" && label.length > 18) {
              return label.slice(0, 16) + "...";
            }
            return label;
          },
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  return (
    <div
      className="h-64 mt-4 border rounded-md p-2 shadow-sm bg-white dark:bg-gray-800"
      style={{
        // ensure no visible overflow from the canvas labels
        overflow: "hidden",
        ...containerStyle,
      }}
    >
      <h3 className="font-semibold text-center mb-2">{title}</h3>
      <Line data={data} options={options} />
    </div>
  );
}
