const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const endpoints = {
  // AUTH ENDPOINTS
  FETCH_USERNAME_API: BASE_URL + "/login/username",
  LOGIN_API: BASE_URL + "/login/Userlogin",

  // Home ENDPOINTS
  PLANT_OEE_API: BASE_URL + "/Home/plantOEE",
  PLANT_PLAN_ACTUAL_API: BASE_URL + "/Home/GetPlanActualQty",
  PLANT_OK_TOTAL_API: BASE_URL + "/Home/GetOKTotalQty",
  PLANT_TIMES_API: BASE_URL + "/Home/plantDowntimeBreakdownDetails",

  // Performance ENDPOINTS
  PLANT_DATA_API: BASE_URL + "/PerformanceHome/machinewise",
  PLANT_OEE_TREND_API: BASE_URL + "/PerformanceHome/GetOEETrend",
  PLANT_AVAILABILITY_TREND_API: BASE_URL + "/PerformanceHome/GetAvailabilityTrend",
  PLANT_PERFORMANCE_TREND_API: BASE_URL + "/PerformanceHome/GetPerformanceTrend",
  PLANT_QUALITY_TREND_API: BASE_URL + "/PerformanceHome/GetQualityTrend",
  TOTAL_DOWNTIME_API: BASE_URL + "/PerformanceHome/GetTotalandDownTime",
  GOOD_REJECTED_API: BASE_URL + "/PerformanceHome/GetGoodRejectedQty",

  // Machine Performance ENDPOINTS
  MACHINE_PERFORMANCE_API: BASE_URL + "/PerfMachine/machineoee",
  MACHINE_TIMES_API: BASE_URL + "/PerfMachine/machineTimes",
  MACHINE_LOSSNAME_API: BASE_URL + "/PerfMachine/lossname",
  MACHINE_SUBLOSS_API: BASE_URL + "/PerfMachine/Sublossname",

  // 4M analysis
  FOURM_SHIFT_LOSS_API: BASE_URL + "/PerfMachine/AlllossForShift4M",
  FOURM_LOSS_FILTER_API: BASE_URL + "/PerfMachine/lossesForDayWeekMonthDates4M",

  // TPM
  TPM_SHIFT_LOSS_API: BASE_URL + "/PerfMachine/AlllossForShiftTPM",
  TPM_LOSS_FILTER_API: BASE_URL + "/PerfMachine/lossesForDayWeekMonthDatesTPM",

  // Cumulative Trend APIs
  SHIFT_CUMULATIVE_TREND_API: BASE_URL + "/PerfMachine/GetShiftCumulativeTrendDurationOccurrence",
  MODE_CUMULATIVE_TREND_API: BASE_URL + "/PerfMachine/GetCumulativeTrendDurationOccurrenceByMode",

  // Hourly Trends
  HOURLY_EXP_ACTUAL_TREND_API: BASE_URL + "/PerfMachine/GetHourlyExpActualQtyTrend",
  REJECTED_TREND_API: BASE_URL + "/PerfMachine/GetHourlyTotalRejectedQtyTrend",
  REJECTION_REASON_API: BASE_URL + "/PerfMachine/GetReworkQtyandReasonChart",
};