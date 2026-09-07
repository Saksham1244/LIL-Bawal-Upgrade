import { apiConnector } from "../apiConnecter";
import { endpoints } from "../apis";
import { toast } from "react-hot-toast";
import { 
  setPlantData, 
  setOEEData, 
  setOKTotalData, 
  setPlanActualData,
  setPlantTimesData,    // 🔹 Import new action
} from "../../slices/plantSlice";

export function fetchPlantData({ mode = "Shift", startDate, endDate } = {}) { 
  return async (dispatch) => {
    try {
      // Build query params dynamically
      let query = `mode=${mode}`;
      if (mode === "DATE" && startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }

      // 1️⃣ Plant OEE
      const oeeUrl = `${endpoints.PLANT_OEE_API}?${query}`;
      const oeeResponse = await apiConnector("GET", oeeUrl);
      if (oeeResponse.status >= 300) throw new Error(`OEE API Error: ${oeeResponse.status}`);
      dispatch(setOEEData(oeeResponse.data.data || []));

      // 2️⃣ Plan vs Actual
      const planActualUrl = `${endpoints.PLANT_PLAN_ACTUAL_API}?${query}`;
      const planActualResponse = await apiConnector("GET", planActualUrl);
      if (planActualResponse.status >= 300) throw new Error(`PlanActual API Error: ${planActualResponse.status}`);
      dispatch(setPlanActualData(planActualResponse.data.data || []));

      // 3️⃣ OK vs Total
      const okTotalUrl = `${endpoints.PLANT_OK_TOTAL_API}?${query}`;
      const okTotalResponse = await apiConnector("GET", okTotalUrl);
      if (okTotalResponse.status >= 300) throw new Error(`OKTotal API Error: ${okTotalResponse.status}`);
      dispatch(setOKTotalData(okTotalResponse.data.data || []));

      // 4️⃣ Plant machine Data
      const url = `${endpoints.PLANT_DATA_API}?${query}`;
      const response = await apiConnector("GET", url);
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`API Error: ${response.status}`);
      }
      const plantArray = response.data.data || [];
      dispatch(setPlantData(plantArray));

      // 5️⃣ Plant Times API
      const plantTimesUrl = `${endpoints.PLANT_TIMES_API}?${query}`;
      const plantTimesResponse = await apiConnector("GET", plantTimesUrl);
      if (plantTimesResponse.status >= 300) throw new Error(`PlantTimes API Error: ${plantTimesResponse.status}`);
      dispatch(setPlantTimesData(plantTimesResponse.data.data || []));

      return plantArray;
    } catch (error) {
      console.log("PLANT DATA API ERROR............", error);
      toast.error("Failed to fetch plant data");
      throw error;
    }
  };
}


