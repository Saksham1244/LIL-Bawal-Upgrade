import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const MachineOEEChart = () => {
  // ✅ Get machineOEE from Redux
  const machineOEE = useSelector((state) => state.machine.machineOEE);

  // ✅ Get OEEPercent safely
  const oeeValue = machineOEE && machineOEE.length > 0 ? machineOEE[0].OEEPercent : 0;

  // ✅ Determine color based on OEE value
  const getOEEColor = (value) => {
    if (value < 75) return "rgba(220, 38, 38, 1)"; // red
    if (value < 90) return "rgba(234, 179, 8, 1)"; // yellow
    return "#6ff542"; // green
  };

  const oeeColor = getOEEColor(oeeValue);

  // ✅ Chart data
  const chartData = useMemo(() => ({
    labels: ["OEE"],
    datasets: [
      {
        label: "OEE",
        data: [oeeValue, 100 - oeeValue],
        backgroundColor: [oeeColor , "rgba(183,188,213,1)"],
        borderWidth: 0,
      },
    ],
  }), [oeeValue]);

  // ✅ Center text plugin to show OEE % inside chart
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { ctx, width, height } = chart;
      ctx.save();
      const fontSize = (height / 120).toFixed(2);
      ctx.font = `${fontSize}em sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#111827";

      const text = ``; // OEE percent text
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2;

      ctx.fillText(text, textX, textY);
      ctx.restore();
    },
  };

  // ✅ Chart options with tooltip only for OEE slice
  const options = useMemo(() => ({
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
            return null;
          },
          labelColor: function (context) {
            if (context.dataIndex !== 0) {
              return { borderColor: "transparent", backgroundColor: "transparent" };
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
  }), [oeeValue]);

  return (
    <div className="w-full h-48 flex justify-center items-center relative">
      <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
};

export default MachineOEEChart;



