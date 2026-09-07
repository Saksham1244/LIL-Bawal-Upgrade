import React, { useState, useEffect } from "react";
import DashboardLayout from "../../partials/dashboardLayout/DashboardLayout";
import AllAlarmsDurationChart from "../../partials/charts/machineAlarms/AllAlarmsDurationChart";
import AllAlarmsOccurrenceChart from "../../partials/charts/machineAlarms/AllAlarmsOccurrenceChart";
import TopFiveAlarmsDurationChart from "../../partials/charts/alarms/TopFiveAlarmsDurationChart";
import TopFiveAlarmsOccurrenceChart from "../../partials/charts/alarms/TopFiveAlarmsOccurrenceChart";
import MachineAlarmCard from "../../partials/MachineAlarmCard";
import { useSelector } from "react-redux";
import axios from "axios";
import { MdNotificationsActive, MdPrecisionManufacturing } from "react-icons/md";

const Alarms = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState("DAY");
  const filters = useSelector((state) => state.filters || {});

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/MachineParameter/GetShibauraMachine`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setMachines(
          res.data.data.map((m) => ({
            id: m.EquipmentID,
            name: m.EquipmentName,
          }))
        );
        setSelectedMachine(res.data.data[0]?.EquipmentID || "");
      }
    } catch (err) {
      console.error("Error fetching machines:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Top Header & Period Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-[#222630]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <MdNotificationsActive className="text-rose-500" size={22} />
              <span>Plant & Machine Alarms</span>
            </h1>
            
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Filter Period:</span>
            <div className="bg-gray-100 dark:bg-[#1a1d24] p-1 rounded-lg flex items-center border border-gray-200 dark:border-[#262a34]">
              {["DAY", "WEEK", "MONTH", "SHIFT"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMode(m)}
                  className={
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all " +
                    (selectedMode === m
                      ? "bg-white dark:bg-[#282d38] text-gray-900 dark:text-white shadow-xs font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white")
                  }
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 1: Top Plant Alarms */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide uppercase text-gray-700 dark:text-gray-300">
              Top Plant Alarms ({selectedMode})
            </h2>
            <span className="text-xs text-gray-400">Aggregated across all connected lines</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopFiveAlarmsDurationChart
              mode={selectedMode}
              startDate={filters.startDate}
              endDate={filters.endDate}
            />
            <TopFiveAlarmsOccurrenceChart
              mode={selectedMode}
              startDate={filters.startDate}
              endDate={filters.endDate}
            />
          </div>
        </div>

        {/* Section 2: Machine Selection & Machine-Specific Alarms */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-[#222630]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide uppercase text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <MdPrecisionManufacturing className="text-indigo-400" size={18} />
              <span>Select Machine for Detailed Alarm Analysis</span>
            </h2>
            <span className="text-xs text-gray-400">Click a machine to inspect its individual alarms</span>
          </div>

          {loading ? (
            <div className="text-center py-6 text-xs text-gray-400">Loading machines...</div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {machines.map((machine) => {
                const isSelected = selectedMachine === machine.id;
                return (
                  <button
                    key={machine.id}
                    type="button"
                    onClick={() => setSelectedMachine(machine.id)}
                    className={
                      "px-3.5 py-2 rounded-lg text-xs font-medium transition-all shadow-xs " +
                      (isSelected
                        ? "bg-rose-600 text-white font-bold ring-2 ring-rose-500/50"
                        : "bg-white dark:bg-[#181b21] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#282d38] hover:border-rose-400/50 hover:text-rose-400")
                    }
                  >
                    {machine.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Machine Specific Charts */}
          {selectedMachine && (
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Detailed Alarms for Selected Machine ({selectedMode})
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AllAlarmsDurationChart
                  selectedMachine={selectedMachine}
                  mode={selectedMode}
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                />
                <AllAlarmsOccurrenceChart
                  selectedMachine={selectedMachine}
                  mode={selectedMode}
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Alarms;
