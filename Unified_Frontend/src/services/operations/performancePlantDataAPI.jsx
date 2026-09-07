import { apiConnector } from "../apiConnecter";
import { endpoints } from "../apis";
import { toast } from "react-hot-toast";

import { 
  setOEEData, 
  setPlantData, 
  setPlanActualData 
} from "../../slices/plantSlice";

import { 
  setTotalDowntimeData, 
  setGoodRejectedData,
  setOEETrendData,
  setAvailabilityTrendData,
  setPerformanceTrendData,
  setQualityTrendData
} from "../../slices/performanceSlice";

export function fetchPerformancePlantData({ mode = "Shift", startDate, endDate } = {}) {
  return async (dispatch) => {
    try {
      // 🔹 Build query
      let query = `Mode=${mode}`;
      if (mode === "Date" && startDate && endDate) {
        query += `&StartDate=${startDate}&EndDate=${endDate}`;
      }

      // 1️⃣ Plant OEE
      const oeeResponse = await apiConnector("GET", `${endpoints.PLANT_OEE_API}?${query}`);
      dispatch(setOEEData(oeeResponse.data.data || []));

      // 2️⃣ Machinewise Data
      const machineResponse = await apiConnector("GET", `${endpoints.PLANT_DATA_API}?${query}`);
      dispatch(setPlantData(machineResponse.data.data || []));

      // 3️⃣ Plan vs Actual
      const planActualResponse = await apiConnector("GET", `${endpoints.PLANT_PLAN_ACTUAL_API}?${query}`);
      dispatch(setPlanActualData(planActualResponse.data.data || []));

      // 4️⃣ Total vs Downtime
      const totalDowntimeResponse = await apiConnector("GET", `${endpoints.TOTAL_DOWNTIME_API}?${query}`);
      dispatch(setTotalDowntimeData(totalDowntimeResponse.data.data || []));

      // 5️⃣ Good vs Rejected
      const goodRejectedResponse = await apiConnector("GET", `${endpoints.GOOD_REJECTED_API}?${query}`);
      dispatch(setGoodRejectedData(goodRejectedResponse.data.data || []));

      // 6️⃣ OEE Trend
      const oeeTrendResponse = await apiConnector("GET", `${endpoints.PLANT_OEE_TREND_API}?${query}`);
      dispatch(setOEETrendData(oeeTrendResponse.data.data || []));

      // 7️⃣ Availability Trend
      const availabilityTrendResponse = await apiConnector("GET", `${endpoints.PLANT_AVAILABILITY_TREND_API}?${query}`);
      dispatch(setAvailabilityTrendData(availabilityTrendResponse.data.data || []));

      // 8️⃣ Performance Trend
      const performanceTrendResponse = await apiConnector("GET", `${endpoints.PLANT_PERFORMANCE_TREND_API}?${query}`);
      dispatch(setPerformanceTrendData(performanceTrendResponse.data.data || []));

      // 9️⃣ Quality Trend
      const qualityTrendResponse = await apiConnector("GET", `${endpoints.PLANT_QUALITY_TREND_API}?${query}`);
      dispatch(setQualityTrendData(qualityTrendResponse.data.data || []));

    } catch (error) {
      console.error("PERFORMANCE PLANT DATA API ERROR...", error);
      toast.error("Failed to fetch performance plant data");
      throw error;
    }
  };
}

