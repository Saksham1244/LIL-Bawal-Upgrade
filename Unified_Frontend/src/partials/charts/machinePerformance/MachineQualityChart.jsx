import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const MachineQualityChart = () => {
  const machineOEE = useSelector((state) => state.machine.machineOEE);
  const value = machineOEE?.[0]?.QualityPercent || 0;

  // ✅ Determine color based on OEE value
  const getQualityColor = (value) => {
    if (value < 75) return "rgba(220, 38, 38, 1)"; // red
    if (value < 90) return "rgba(234, 179, 8, 1)"; // yellow
    return "#6ff542"; // green
  };

  const qualityColor = getQualityColor(value);

  const chartData = useMemo(() => ({
    labels: ["Quality"],
    datasets: [
      {
        label: "Quality",
        data: [value, 100 - value],
        backgroundColor: [qualityColor , "rgba(183,188,213,1)"], // orange
        borderWidth: 0,
      },
    ],
  }), [value]);

  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { ctx, width, height } = chart;
      ctx.save();
      const fontSize = (height / 120).toFixed(2);
      ctx.font = `${fontSize}em sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#111827";

      const text = ``;
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2;

      ctx.fillText(text, textX, textY);
      ctx.restore();
    },
  };

  const options = useMemo(() => ({
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx) => ctx.dataIndex === 0 ? `Quality: ${ctx.raw}%` : null,
        },
      },
    },
    maintainAspectRatio: false,
  }), [value]);

  return (
    <div className="w-full h-48 flex justify-center items-center relative">
      <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
};

export default MachineQualityChart;
