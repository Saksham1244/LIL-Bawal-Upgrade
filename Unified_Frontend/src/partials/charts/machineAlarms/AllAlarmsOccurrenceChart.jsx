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

const AllAlarmsOccurrenceChart = ({ selectedMachine, mode, startDate, endDate }) => {
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

      // ✅ include custom date range if mode = DATE
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
        const occurrences = data.map((item) => item.AlarmOccurrences);

        setChartData({
          labels,
          datasets: [
            {
              label: "Alarm Occurrences",
              data: occurrences,
              backgroundColor: "#E54B4B",
            },
          ],
        });
      } else {
        setChartData({ labels: [], datasets: [] });
      }
    } catch (err) {
      console.error("Error fetching alarm occurrences:", err);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: `Alarm Occurrences (${selectedMachine})`,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label;
            const count = context.parsed.y;
            return [`${label}`, `Occurrences: ${count}`];
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

export default AllAlarmsOccurrenceChart;
