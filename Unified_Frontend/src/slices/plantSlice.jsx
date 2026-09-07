import { createSlice } from "@reduxjs/toolkit";

const plantSlice = createSlice({
  name: "plant",
  initialState: {
    plantData: [],
    oeeData: [],
    planActualData: [],
    okTotalData: [],
    plantTimesData: [],   
  },
  reducers: {
    setPlantData: (state, action) => {
      state.plantData = action.payload;
    },
    setOEEData: (state, action) => {
      state.oeeData = action.payload;
    },
    setPlanActualData: (state, action) => {
      state.planActualData = action.payload;
    },
    setOKTotalData: (state, action) => {
      state.okTotalData = action.payload;
    },
    setPlantTimesData: (state, action) => {   // 🔹 New reducer
      state.plantTimesData = action.payload;
    },
  },
});

export const { 
  setPlantData, 
  setOEEData, 
  setPlanActualData, 
  setOKTotalData,
  setPlantTimesData,     
} = plantSlice.actions;

export default plantSlice.reducer;
