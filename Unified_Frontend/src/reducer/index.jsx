import { combineReducers } from "@reduxjs/toolkit"
import filtersReducer from "../slices/filtersSlice"
import plantReducer from "../slices/plantSlice"
import machineReducer from "../slices/machineSlice"
import performanceReducer from "../slices/performanceSlice"
import machineDowntimeReducer from "../slices/machineDowntimeSlice"

const rootReducer = combineReducers({
     filters: filtersReducer,
     plant: plantReducer,
     machine: machineReducer,
     performance: performanceReducer,
     machineDowntime: machineDowntimeReducer,
})

export default rootReducer