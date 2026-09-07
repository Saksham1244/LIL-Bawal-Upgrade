import { createSlice } from "@reduxjs/toolkit";

const performanceSlice = createSlice({
  name: "performance",
  initialState: {
    totalDowntimeData: [],   // From GetTotalandDownTime API
    goodRejectedData: [],    // From GetGoodRejectedQty API

    //trend states
    oeeTrendData: [],          // From GetOEETrend
    availabilityTrendData: [], // From GetAvailabilityTrend
    performanceTrendData: [],  // From GetPerformanceTrend
    qualityTrendData: [],      // From GetQualityTrend
  },
  reducers: {
    setTotalDowntimeData: (state, action) => {
      state.totalDowntimeData = action.payload;
    },
    setGoodRejectedData: (state, action) => {
      state.goodRejectedData = action.payload;
    },
    setOEETrendData: (state, action) => {
      state.oeeTrendData = action.payload;
    },
    setAvailabilityTrendData: (state, action) => {
      state.availabilityTrendData = action.payload;
    },
    setPerformanceTrendData: (state, action) => {
      state.performanceTrendData = action.payload;
    },
    setQualityTrendData: (state, action) => {
      state.qualityTrendData = action.payload;
    },
  },
});

export const { setTotalDowntimeData, setGoodRejectedData,setOEETrendData,
  setAvailabilityTrendData,
  setPerformanceTrendData,
  setQualityTrendData } = performanceSlice.actions;
export default performanceSlice.reducer;
