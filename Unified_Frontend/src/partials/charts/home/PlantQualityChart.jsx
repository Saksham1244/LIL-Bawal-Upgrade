import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";

const PlantQualityChart = () => {
  const okTotalData = useSelector((state) => state.plant.okTotalData);
  // console.log("OK vs Total DATA FROM REDUX STORE: ", okTotalData);

  const chartData = useMemo(() => {
    const ok = okTotalData[0]?.TotalGoodQty || 0;
    const total = okTotalData[0]?.TotalActualQty || 0;

    return {
      labels: ["OK Qty", "Total Actual Qty"],
      datasets: [
        {
          label: "Quality",
          data: [ok, total],
          backgroundColor: ["rgba(107,123,217,1)", "rgba(183,188,213,1)"], // Green + Blue
          // backgroundColor: ["#6ff542", "#f5ec42"], 
          // hoverBackgroundColor: ["green", "yellow"],
        },
      ],
    };
  }, [okTotalData]);

  const options = {
    indexAxis: "y", // horizontal bars
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-52 flex justify-center items-center">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default PlantQualityChart;
