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

const PerformancePlantQualityChart = () => {
  const goodRejectedData = useSelector(
    (state) => state.performance.goodRejectedData
  );
//   console.log("Good vs Rejected Data from Redux Store:", goodRejectedData);

  const chartData = useMemo(() => {
    if (!goodRejectedData || goodRejectedData.length === 0) {
      return { labels: [], datasets: [] };
    }

    const { TotalGoodQty, TotalRejectedCount } = goodRejectedData[0];

    return {
      labels: ["Good Parts", "Bad Parts"],
      datasets: [
        {
          label: "Good Parts",
          data: [TotalGoodQty, TotalRejectedCount],
          backgroundColor: ["#061887", "#ebedf5"], // Good = blue, Rejected = gray
        },
      ],
    };
  }, [goodRejectedData]);

  

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

    return (
      <div className="w-full h-52 flex justify-center items-center">
        <Bar data={chartData} options={options} />
      </div>
    );
};

export default PerformancePlantQualityChart;

