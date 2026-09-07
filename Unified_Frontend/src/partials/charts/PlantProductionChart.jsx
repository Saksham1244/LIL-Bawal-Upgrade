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
  const filters = useSelector((state) => state.filters);
  const { period, startDate, endDate } = filters;

  const chartData = useMemo(() => {
    // Check if a date range is selected
    const hasDateRange = startDate && endDate;

    switch (period) {
      case "Shift":
        return {
          labels: hasDateRange ? ["Selected Shift"] : ["Shift A", "Shift B", "Shift C"],
          datasets: [
            {
              label: "Plan",
              data: hasDateRange ? [50] : [40, 55, 70],
              backgroundColor: "#36A2EB",
            },
            {
              label: "Actual",
              data: hasDateRange ? [45] : [35, 50, 65],
              backgroundColor: "#FF6384",
            },
          ],
        };
      case "Day":
        return {
          labels: hasDateRange ? ["Selected Days"] : ["Mon", "Tue", "Wed", "Thu"],
          datasets: [
            {
              label: "Plan",
              data: hasDateRange ? [30] : [20, 30, 40, 50],
              backgroundColor: "#36A2EB",
            },
            {
              label: "Actual",
              data: hasDateRange ? [28] : [18, 35, 38, 48],
              backgroundColor: "#FF6384",
            },
          ],
        };
      case "Week":
        return {
          labels: hasDateRange ? ["Selected Week"] : ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Plan",
              data: hasDateRange ? [120] : [100, 150, 120, 130],
              backgroundColor: "#36A2EB",
            },
            {
              label: "Actual",
              data: hasDateRange ? [110] : [90, 140, 110, 125],
              backgroundColor: "#FF6384",
            },
          ],
        };
      case "Month":
        return {
          labels: hasDateRange ? ["Selected Month"] : ["Jan", "Feb", "Mar", "Apr"],
          datasets: [
            {
              label: "Plan",
              data: hasDateRange ? [450] : [300, 400, 500, 600],
              backgroundColor: "#36A2EB",
            },
            {
              label: "Actual",
              data: hasDateRange ? [420] : [280, 420, 480, 580],
              backgroundColor: "#FF6384",
            },
          ],
        };
      default:
        return { labels: [], datasets: [] };
    }
  }, [period, startDate, endDate]); // 🔹 Add startDate & endDate here

  return(
    <div className="w-full h-52 flex justify-center items-center">
      <Bar data={chartData} />
    </div>
  );
};

export default PlantProductionChart;



// import React, { useMemo } from "react";
// import { Bar } from "react-chartjs-2";
// import { useSelector } from "react-redux";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const PlantProductionChart = () => {
//   const filters = useSelector((state) => state.filters);

//   // 🔹 useMemo ensures new object is returned when filters change
//   const chartData = useMemo(() => {
//     switch (filters.period) {
//       case "Shift":
//         return {
//           labels: ["Shift A", "Shift B", "Shift C"],
//           datasets: [
//             { label: "Plan", data: [40, 55, 70], backgroundColor: "#36A2EB" },
//             { label: "Actual", data: [35, 50, 65], backgroundColor: "#FF6384" },
//           ],
//         };
//       case "Day":
//         return {
//           labels: ["Mon", "Tue", "Wed", "Thu"],
//           datasets: [
//             { label: "Plan", data: [20, 30, 40, 50], backgroundColor: "#36A2EB" },
//             { label: "Actual", data: [18, 35, 38, 48], backgroundColor: "#FF6384" },
//           ],
//         };
//       case "Week":
//         return {
//           labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
//           datasets: [
//             { label: "Plan", data: [100, 150, 120, 130], backgroundColor: "#36A2EB" },
//             { label: "Actual", data: [90, 140, 110, 125], backgroundColor: "#FF6384" },
//           ],
//         };
//       case "Month":
//         return {
//           labels: ["Jan", "Feb", "Mar", "Apr"],
//           datasets: [
//             { label: "Plan", data: [300, 400, 500, 600], backgroundColor: "#36A2EB" },
//             { label: "Actual", data: [280, 420, 480, 580], backgroundColor: "#FF6384" },
//           ],
//         };
//       default:
//         return { labels: [], datasets: [] };
//     }
//   }, [filters]); // 🔹 dependency on filters ensures re-compute

//   return <Bar data={chartData} />;
// };

// export default PlantProductionChart;





// import React from "react";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// // Register required components for Bar chart
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const PlantProductionChart = () => {
//   const data = {
//     labels: ["Jan", "Feb", "Mar", "Apr"],
//     datasets: [
//       {
//         label: "Plan",
//         data: [30, 50, 70, 90],
//         backgroundColor: "#36A2EB",
//       },
//       {
//         label: "Actual",
//         data: [25, 60, 65, 80],
//         backgroundColor: "#FF6384",
//       },
//     ],
//   };

//   return <Bar data={data} />;
// };

// export default PlantProductionChart;

// import React from "react";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const PlantProductionChart = ({ chartData }) => {
//   return <Bar data={chartData} />;
// };

// export default PlantProductionChart;


