// src/slices/machineSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  machineOEE: [],
  machineTimes: [],
  subLossNames: [],
  lossNames: [],
  fourMLossData: [],
    expectedVsActual: { labels: [], expected: [], actual: [] },

 qualityTrend: { labels: [], totalQty: [], rejectedQty: [], rejectionRate: [] },
  rejectionReasons: { labels: [], counts: [] }, // 👈 new
 // 🔹 New states for Cumulative Trend Charts
  cumulativeTrendDuration: [],
  cumulativeTrendOccurrence: [],
};

const machineSlice = createSlice({
  name: "machine",
  initialState,
  reducers: {
    setMachineOEEData: (state, action) => {
      state.machineOEE = action.payload;
    },
    setMachineTimesData: (state, action) => {
      state.machineTimes = action.payload;
    },
    setSubLossNamesData: (state, action) => {
      state.subLossNames = action.payload;
    },
    setLossNamesData: (state, action) => {
      state.lossNames = action.payload;
    },
    setFourMLossData: (state, action) => {
      state.fourMLossData = action.payload;
    },

    // 🔹 New reducers for Cumulative Trend data
    setCumulativeTrendDuration: (state, action) => {
      state.cumulativeTrendDuration = action.payload;
    },
    setCumulativeTrendOccurrence: (state, action) => {
      state.cumulativeTrendOccurrence = action.payload;
    },
    clearCumulativeTrendData: (state) => {
      state.cumulativeTrendDuration = [];
      state.cumulativeTrendOccurrence = [];
    },
    setExpectedVsActual: (state, action) => {
      state.expectedVsActual = action.payload;
    },
    clearExpectedVsActual: (state) => {
      state.expectedVsActual = { labels: [], expected: [], actual: [] };
    },

 setQualityTrend: (state, action) => {
      state.qualityTrend = action.payload;
    },
    clearQualityTrend: (state) => {
      state.qualityTrend = { labels: [], totalQty: [], rejectedQty: [], rejectionRate: [] };
    },
    setRejectionReasons: (state, action) => {
  state.rejectionReasons = action.payload;
},
clearRejectionReasons: (state) => {
  state.rejectionReasons = { labels: [], counts: [] };
},

  },
});

export const {
  setMachineOEEData,
  setMachineTimesData,
  setLossNamesData,
  setSubLossNamesData,
  setFourMLossData,

  // 🔹 Export new actions
  setCumulativeTrendDuration,
  setCumulativeTrendOccurrence,
  clearCumulativeTrendData,
   // NEW actions
  setExpectedVsActual,
  clearExpectedVsActual,
    setQualityTrend,
  clearQualityTrend,
  setRejectionReasons,
  clearRejectionReasons,
} = machineSlice.actions;

export default machineSlice.reducer;
