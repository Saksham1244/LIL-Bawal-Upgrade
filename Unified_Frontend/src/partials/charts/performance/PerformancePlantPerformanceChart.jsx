import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useSelector } from "react-redux";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PerformancePlantPerformanceChart = () => {
  const planActualData = useSelector((state) => state.plant.planActualData);
  // console.log("Plant Data from Redux Store:", planActualData);

  const chartData = useMemo(() => {
    if (!planActualData || planActualData.length === 0) {
      return { labels: [], datasets: [] };
    }

    const { TotalExpectedQty, TotalActualQty } = planActualData[0];

    return {
      labels: ["Plant Performance"], // ✅ single label
      datasets: [
        {
          label: "Expected",
          data: [TotalExpectedQty],
          backgroundColor: "#6b7bd9",
        },
        {
          label: "Actual",
          data: [TotalActualQty],
          backgroundColor: "#061887",
        },
      ],
    };
  }, [planActualData]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true },
    },
    scales: {
      x: { stacked: false },
      y: { beginAtZero: true },
    },
  };

    return (
      <div className="w-full h-52 flex justify-center items-center">
        <Bar data={chartData} options={options} />
      </div>
    );
};

export default PerformancePlantPerformanceChart;

