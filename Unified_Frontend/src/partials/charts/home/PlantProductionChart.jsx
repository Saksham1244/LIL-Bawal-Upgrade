import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PlantProductionChart = () => {
  const planActualData = useSelector((state) => state.plant.planActualData);
  // console.log("Plan vs Actual DATA FROM REDUX STORE: ", planActualData);

  const chartData = useMemo(() => {
    const plan = planActualData[0]?.TotalExpectedQty || 0;
    const actual = planActualData[0]?.TotalActualQty || 0;

    return {
      labels: ["Plan vs Actual"],
      datasets: [
        {
          label: "Expected",
          data: [plan],
          backgroundColor: "#6b7bd9", // moody-blue: #6b7bd9;
          // backgroundColor: "#f5ec42", 
          // hoverBackgroundColor: "yellow",
        },
        {
          label: "Actual",
          data: [actual],
          backgroundColor: "#061887", // catalina-blue: #061887;
          // backgroundColor: "#6ff542", 
          // hoverBackgroundColor: "green",
        },
      ],
    };
  }, [planActualData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      }
    },
  };

  return (
    <div className="w-full h-52 flex justify-center items-center">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default PlantProductionChart;