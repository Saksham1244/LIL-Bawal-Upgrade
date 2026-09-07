import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PlantPerformanceChart = () => {
  const filters = useSelector((state) => state.filters);
  const { period, startDate, endDate } = filters;

  const chartData = useMemo(() => {
    const hasDateRange = startDate && endDate;

    let oee = 78;
    if (period === "Shift") oee = hasDateRange ? 70 : 75;
    if (period === "Day") oee = hasDateRange ? 72 : 78;
    if (period === "Week") oee = hasDateRange ? 80 : 76;
    if (period === "Month") oee = hasDateRange ? 85 : 78;

    return {
      labels: ["OEE"],
      datasets: [
        {
          label: "OEE",
          data: [oee, 100 - oee],
          backgroundColor: ["rgba(34,197,94,0.7)", "rgba(229,231,235,0.7)"],
        },
      ],
    };
  }, [period, startDate, endDate]);

  const options = {
    cutout: "70%",
    plugins: { legend: { display: false } },
    maintainAspectRatio: false, // allows responsive sizing
  };

  return (
    <div className="w-full h-52 flex justify-center items-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default PlantPerformanceChart;
