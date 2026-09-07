import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFilters } from "../slices/filtersSlice";
import Datepicker from "../components/Datepicker";

export default function DashboardFilters() {
  const filters = useSelector((state) => state.filters);
  const dispatch = useDispatch();

  const [localFilters, setLocalFilters] = useState(filters);

  // Keep localFilters in sync with Redux
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleDateChange = (range) => {
  setLocalFilters((prev) => {
    const updated = { ...prev, startDate: range[0], endDate: range[1] };
    dispatch(setFilters(updated)); // update Redux immediately
      return updated;
    });
  };


  // Immediately update chart when period changes
  const handlePeriodChange = (period) => {
    setLocalFilters((prev) => {
      const updated = { ...prev, period };
      dispatch(setFilters(updated)); // Dispatch updated state
      return updated;
    });
  };

  // Apply only date range when clicking View
  const applyDateFilters = () => {
    dispatch(setFilters(localFilters));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
        {/* Period Buttons */}
        <div className="flex gap-2">
          {["Shift", "Day", "Week", "Month"].map((p) => (
            <button
              key={p}
              className={`px-4 py-2 text-sm cursor-pointer rounded-md ${
                localFilters.period === p
                  ? "bg-[#051787] text-white"
                  : "bg-[#3c51d2] text-white hover:bg-[#344290]"
              }`}
              onClick={() => handlePeriodChange(p)}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <Datepicker
            selectsRange
            startDate={localFilters.startDate}
            endDate={localFilters.endDate}
            onChange={handleDateChange}
            placeholderText="Start Date - End Date"
            className="px-3 py-2 rounded-md text-sm"
          />
          <button
            onClick={applyDateFilters}
            className="px-4 py-2 bg-[#3c51d2] cursor-pointer text-white rounded-md hover:bg-[#344290]"
          >
            View
          </button>
        </div>
      </div>

      {/* Running Shift Info */}
      {localFilters.period === "Shift" && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm w-fit">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Running Shift:{" "}
            <span className="font-bold text-green-600">
              {filters.runningShift}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}