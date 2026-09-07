import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";

const PlantQualityChart = () => {
  const filters = useSelector((state) => state.filters);
  const { period, startDate, endDate } = filters;

  const chartData = useMemo(() => {
    const hasDateRange = startDate && endDate;

    let ok = 850, rejection = 50;

    if (period === "Shift") { ok = hasDateRange ? 400 : 850; rejection = hasDateRange ? 30 : 50; }
    if (period === "Day") { ok = hasDateRange ? 600 : 900; rejection = hasDateRange ? 40 : 70; }
    if (period === "Week") { ok = hasDateRange ? 2000 : 2200; rejection = hasDateRange ? 100 : 200; }
    if (period === "Month") { ok = hasDateRange ? 8000 : 8500; rejection = hasDateRange ? 400 : 500; }

    return {
      labels: ["Ok", "Rejection"],
      datasets: [
        {
          label: "Quality",
          data: [ok, rejection],
          backgroundColor: ["rgba(34,197,94,0.7)", "rgba(239,68,68,0.7)"],
        },
      ],
    };
  }, [period, startDate, endDate]);

  const options = {
    indexAxis: "y",
    plugins: { legend: { display: false } },
  };

  return (
    <div className="w-full h-52 flex justify-center items-center">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default PlantQualityChart;
