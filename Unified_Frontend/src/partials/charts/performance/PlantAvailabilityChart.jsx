import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const PlantAvailability = () => {
  const totalDowntimeData = useSelector(
    (state) => state.performance.totalDowntimeData
  );
  // console.log("Total Downtime Data from Redux Store:", totalDowntimeData);

  const chartData = useMemo(() => {
    if (!totalDowntimeData || totalDowntimeData.length === 0) {
      return { labels: [], datasets: [] };
    }

    const { TotalTime, TotalDownTime } = totalDowntimeData[0];
    const RunningTime = TotalTime - TotalDownTime;

    return {
      labels: [""], // ✅ must have at least one label
      datasets: [
        {
          label: "Running Time",
          data: [RunningTime],
          backgroundColor: "#061887",
        },
        {
          label: "Downtime",
          data: [TotalDownTime],
          backgroundColor: "#6b7bd9",
        },
      ],
    };
  }, [totalDowntimeData]);

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  };

    return (
      <div className="w-full h-52 flex justify-center items-center">
        <Bar data={chartData} options={options} />
      </div>
    );
};

export default PlantAvailability;
