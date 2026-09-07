import React, { useEffect, useState } from "react";
import axios from "axios";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AllAlarmsDurationChart = ({ selectedMachine, mode, startDate, endDate }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedMachine) fetchData();
  }, [selectedMachine, mode, startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { Mode: mode, EquipmentID: selectedMachine };

      // ✅ Send date range for custom mode
if (mode === "CUSTOM" && startDate && endDate) {
  params.StartDate = startDate;
  params.EndDate = endDate;
}

      const res = await axios.get(`${BASE_URL}/MachineAlarm/AlarmDurationOccurrence`, { params });

      if (res.data.success && res.data.data.length > 0) {
        const data = res.data.data;

        const labels = data.map(
          (item) => `Alarm #${item.Alarm_Number} (${item.PeriodLabel})`
        );
        const duration = data.map((item) => item.AlarmDurationMinutes);

        setChartData({
          labels,
          datasets: [
            {
              label: "Alarm Duration (min)",
              data: duration,
              backgroundColor: "#4B7BE5",
            },
          ],
        });
      } else {
        setChartData({ labels: [], datasets: [] });
      }
    } catch (err) {
      console.error("Error fetching alarm duration:", err);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: `Alarm Duration (${selectedMachine})`,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label;
            const duration = context.parsed.y;
            return [`${label}`, `Duration: ${duration} min`];
          },
        },
      },
    },
    scales: { y: { beginAtZero: true } },
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (!chartData) return <div className="text-center p-4">No data available</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default AllAlarmsDurationChart;
