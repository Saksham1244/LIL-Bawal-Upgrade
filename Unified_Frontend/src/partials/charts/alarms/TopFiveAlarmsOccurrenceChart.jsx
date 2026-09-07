import React, { useEffect, useState } from "react";
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
import axios from "axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopFiveAlarmsOccurrenceChart = ({ mode = "DAY", startDate, endDate }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const [chartData, setChartData] = useState({ labels: [], data: [] });
  const [loading, setLoading] = useState(false);

  const fetchTopOccurrenceAlarms = async () => {
    setLoading(true);
    try {
      const payload = { Mode: mode || "DAY" };
      if ((mode === "CUSTOM" || mode === "DATE") && startDate && endDate) {
        payload.StartDate = startDate;
        payload.EndDate = endDate;
      }

      const res = await axios.post(
        `${BASE_URL}/MachineAlarm/PlantWise_AlarmDurationOccurrence`,
        payload
      );

      let list = [];
      if (Array.isArray(res.data?.data)) {
        if (res.data.data.length > 1 && Array.isArray(res.data.data[1])) {
          list = res.data.data[1];
        } else if (Array.isArray(res.data.data[0])) {
          list = res.data.data[0];
        } else {
          list = res.data.data;
        }
      }

      if (list && list.length > 0) {
        setChartData({
          labels: list.map((item) =>
            item.Alarm_Status
              ? `#${item.Alarm_Number} - ${item.Alarm_Status.slice(0, 24)}`
              : `Alarm #${item.Alarm_Number}`
          ),
          data: list.map((item) => Number(item.AlarmOccurrences) || 0),
        });
      } else {
        setChartData({ labels: [], data: [] });
      }
    } catch (err) {
      console.error("Error fetching occurrence chart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopOccurrenceAlarms();
  }, [mode, startDate, endDate]);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Occurrences",
        data: chartData.data,
        backgroundColor: "#eab308",
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Top 5 Alarms by Occurrence (${mode})`,
        color: "#94a3b8",
        font: { size: 13, weight: "bold" },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-[#181b21] border border-gray-200 dark:border-[#262a34] rounded-xl shadow-xs p-4 w-full h-80 flex flex-col justify-between">
      {loading ? (
        <div className="flex items-center justify-center h-full text-xs text-gray-400">
          Loading occurrence alarms...
        </div>
      ) : chartData.data.length > 0 ? (
        <div className="w-full h-full">
          <Bar data={data} options={options} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-xs text-gray-400 gap-1">
          <span>No alarm occurrence records found for {mode}.</span>
          <span className="text-[11px] text-gray-500">Switch to DAY or WEEK to view historical alarms.</span>
        </div>
      )}
    </div>
  );
};

export default TopFiveAlarmsOccurrenceChart;
