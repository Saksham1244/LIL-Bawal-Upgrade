import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import filtersReducer from "../slices/filtersSlice";
import plantReducer from "../slices/plantSlice";
import machineReducer from "../slices/machineSlice";
import performanceReducer from "../slices/performanceSlice";
import machineDowntimeReducer from "../slices/machineDowntimeSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  filters: filtersReducer,
  plant: plantReducer,
  machine: machineReducer,
  performance: performanceReducer,
  machineDowntime: machineDowntimeReducer,
});

export const store = configureStore({ reducer: rootReducer });
