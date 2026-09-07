import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PlantDowntimeChart = () => {
  const filters = useSelector((state) => state.filters);
  const { period, startDate, endDate } = filters;

  const chartData = useMemo(() => {
    const hasDateRange = startDate && endDate;

    switch (period) {
      case "Shift":
        return {
          labels: hasDateRange ? ["Selected Shift"] : ["Breakdown", "Idle", "NPD"],
          datasets: [
            {
              label: "Downtime",
              data: hasDateRange ? [10, 5, 2] : [12, 19, 7],
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
          ],
        };
      case "Day":
        return {
          labels: hasDateRange ? ["Selected Days"] : ["Breakdown", "Idle", "NPD"],
          datasets: [
            {
              label: "Downtime",
              data: hasDateRange ? [8, 6, 4] : [15, 12, 5],
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
          ],
        };
      case "Week":
        return {
          labels: hasDateRange ? ["Selected Week"] : ["Breakdown", "Idle", "NPD"],
          datasets: [
            {
              label: "Downtime",
              data: hasDateRange ? [20, 10, 5] : [25, 18, 7],
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
          ],
        };
      case "Month":
        return {
          labels: hasDateRange ? ["Selected Month"] : ["Breakdown", "Idle", "NPD"],
          datasets: [
            {
              label: "Downtime",
              data: hasDateRange ? [80, 50, 20] : [90, 70, 30],
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
          ],
        };
      default:
        return { labels: [], datasets: [] };
    }
  }, [period, startDate, endDate]);

  return (
    <div className="w-full h-52 flex justify-center items-center">
      <Pie data={chartData} />
    </div>
  );
};

export default PlantDowntimeChart;


