import { getBackendBaseUrl } from "../utils/apiConfig";

export const endpoints = {
  // AUTH ENDPOINTS
  get FETCH_USERNAME_API() { return getBackendBaseUrl() + "/login/username"; },
  get LOGIN_API() { return getBackendBaseUrl() + "/login/Userlogin"; },

  // Home ENDPOINTS
  get PLANT_OEE_API() { return getBackendBaseUrl() + "/Home/plantOEE"; },
  get PLANT_PLAN_ACTUAL_API() { return getBackendBaseUrl() + "/Home/GetPlanActualQty"; },
  get PLANT_OK_TOTAL_API() { return getBackendBaseUrl() + "/Home/GetOKTotalQty"; },
  get PLANT_TIMES_API() { return getBackendBaseUrl() + "/Home/plantDowntimeBreakdownDetails"; },

  // Performance ENDPOINTS
  get PLANT_DATA_API() { return getBackendBaseUrl() + "/PerformanceHome/machinewise"; },
  get PLANT_OEE_TREND_API() { return getBackendBaseUrl() + "/PerformanceHome/GetOEETrend"; },
  get PLANT_AVAILABILITY_TREND_API() { return getBackendBaseUrl() + "/PerformanceHome/GetAvailabilityTrend"; },
  get PLANT_PERFORMANCE_TREND_API() { return getBackendBaseUrl() + "/PerformanceHome/GetPerformanceTrend"; },
  get PLANT_QUALITY_TREND_API() { return getBackendBaseUrl() + "/PerformanceHome/GetQualityTrend"; },
  get TOTAL_DOWNTIME_API() { return getBackendBaseUrl() + "/PerformanceHome/GetTotalandDownTime"; },
  get GOOD_REJECTED_API() { return getBackendBaseUrl() + "/PerformanceHome/GetGoodRejectedQty"; },

  // Machine Performance ENDPOINTS
  get MACHINE_PERFORMANCE_API() { return getBackendBaseUrl() + "/PerfMachine/machineoee"; },
  get MACHINE_TIMES_API() { return getBackendBaseUrl() + "/PerfMachine/machineTimes"; },
  get MACHINE_LOSSNAME_API() { return getBackendBaseUrl() + "/PerfMachine/lossname"; },
  get MACHINE_SUBLOSS_API() { return getBackendBaseUrl() + "/PerfMachine/Sublossname"; },

  // 4M analysis
  get FOURM_SHIFT_LOSS_API() { return getBackendBaseUrl() + "/PerfMachine/AlllossForShift4M"; },
  get FOURM_LOSS_FILTER_API() { return getBackendBaseUrl() + "/PerfMachine/lossesForDayWeekMonthDates4M"; },

  // TPM
  get TPM_SHIFT_LOSS_API() { return getBackendBaseUrl() + "/PerfMachine/AlllossForShiftTPM"; },
  get TPM_LOSS_FILTER_API() { return getBackendBaseUrl() + "/PerfMachine/lossesForDayWeekMonthDatesTPM"; },

  // Cumulative Trend APIs
  get SHIFT_CUMULATIVE_TREND_API() { return getBackendBaseUrl() + "/PerfMachine/GetShiftCumulativeTrendDurationOccurrence"; },
  get MODE_CUMULATIVE_TREND_API() { return getBackendBaseUrl() + "/PerfMachine/GetCumulativeTrendDurationOccurrenceByMode"; },

  // Hourly Trends
  get HOURLY_EXP_ACTUAL_TREND_API() { return getBackendBaseUrl() + "/PerfMachine/GetHourlyExpActualQtyTrend"; },
  get REJECTED_TREND_API() { return getBackendBaseUrl() + "/PerfMachine/GetHourlyTotalRejectedQtyTrend"; },
  get REJECTION_REASON_API() { return getBackendBaseUrl() + "/PerfMachine/GetReworkQtyandReasonChart"; },
};