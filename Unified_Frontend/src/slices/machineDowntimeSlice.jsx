import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  durationData: [],   // stores MinutesLost per hour
  occurrenceData: [], // stores Occurrences per hour
  loading: false,
  error: null,
};

const machineDowntimeSlice = createSlice({
  name: "machineDowntime",
  initialState,
  reducers: {
    setDowntimeDuration: (state, action) => {
      state.durationData = action.payload;
    },
    setDowntimeOccurrences: (state, action) => {
      state.occurrenceData = action.payload;
    },
    setDowntimeLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDowntimeError: (state, action) => {
      state.error = action.payload;
    },
    resetDowntime: (state) => {
      state.durationData = [];
      state.occurrenceData = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setDowntimeDuration,
  setDowntimeOccurrences,
  setDowntimeLoading,
  setDowntimeError,
  resetDowntime,
} = machineDowntimeSlice.actions;

export default machineDowntimeSlice.reducer;
