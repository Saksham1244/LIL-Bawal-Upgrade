import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PlantPerformanceChart = () => {
  const oeeData = useSelector((state) => state.plant.oeeData);
  const oeeValue = oeeData[0]?.OEE || 0; // Get OEE from API

  // ✅ Determine color based on OEE value
  const getOEEColor = (value) => {
    if (value < 75) return "rgba(220, 38, 38, 1)"; // red
    if (value < 90) return "rgba(234, 179, 8, 1)"; // yellow
    return "#6ff542"; // green
  };

  const oeeColor = getOEEColor(oeeValue);

  // ✅ Chart data
  const chartData = useMemo(
    () => ({
      labels: ["OEE"],
      datasets: [
        {
          label: "OEE",
          data: [oeeValue, 100 - oeeValue],
          backgroundColor: [oeeColor, "rgba(229, 231, 235, 1)"], // dynamic OEE color + gray background
          borderWidth: 0,
        },
      ],
    }),
    [oeeValue, oeeColor]
  );

  // ✅ Chart options
  const options = useMemo(
    () => ({
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (context) {
              if (context.dataIndex === 0) {
                return `OEE: ${context.raw}%`;
              }
              return "";
            },
            labelColor: function (context) {
              if (context.dataIndex !== 0) {
                return {
                  borderColor: "transparent",
                  backgroundColor: "transparent",
                };
              }
              return {
                borderColor: context.dataset.backgroundColor[0],
                backgroundColor: context.dataset.backgroundColor[0],
              };
            },
          },
        },
      },
      maintainAspectRatio: false,
    }),
    []
  );

  return (
    <div className="w-full h-48 flex justify-center items-center relative">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default PlantPerformanceChart;
