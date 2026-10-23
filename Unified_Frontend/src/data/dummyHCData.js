/**
 * Standalone Dummy Data for Health Check (HC) Module
 * 
 * Purpose:
 * When live customer data is absent (empty array returned or server error),
 * this isolated dataset serves as an automatic, non-clashing fallback.
 * Live API calls remain active; if real customer data arrives, it seamlessly overrides this fallback.
 * 
 * References:
 * - Modeled after industrial Injection Mould PM & HC Maintenance specifications
 * - Follows schema from PMCheckPointReport and HCStatus
 */

export const dummyHCMouldList = [
  { MouldID: 1, MouldName: "YCA H/L Lens M2" },
  { MouldID: 2, MouldName: "YED NB LENS" },
  { MouldID: 3, MouldName: "YSD SIDE TURN INNER LENS-3rd" },
  { MouldID: 4, MouldName: "YCA H/L REF. RHD-3rd" },
  { MouldID: 5, MouldName: "Y0M H/L REF. RHD" },
  { MouldID: 6, MouldName: "YHB RPG EXTENSION-M2" },
  { MouldID: 7, MouldName: "YHB/YHC 25MC TL LENS" },
  { MouldID: 8, MouldName: "YED NB H/L EXTENSION" },
  { MouldID: 9, MouldName: "YHC RCL INNER LENS -2" },
  { MouldID: 10, MouldName: "YCA HL FTS REFLECTOR M2" },
  { MouldID: 11, MouldName: "YSD HMSL LENS-2nd" },
  { MouldID: 12, MouldName: "31XA HMSL HOUSING" },
  { MouldID: 13, MouldName: "YED NB H/L SUN SHADE" },
  { MouldID: 14, MouldName: "Y17 BACKUP HOUSING" },
  { MouldID: 15, MouldName: "Y17 LV REFLECTOR" },
  { MouldID: 16, MouldName: "YHB RCL EXTENSION-M3" },
  { MouldID: 17, MouldName: "Y0M H/L LENS" }
];

// 1. Overall Health Check Status (for HCStatus -> Alerts & Overview)
export const dummyHCStatusOverview = [
  {
    MouldID: 1,
    MouldName: "YCA H/L Lens M2",
    MouldHCStatus: 3, // Overdue
    NextHCDueDate: "2026-09-18T00:00:00.000Z",
    HealthCheckDue: 24800,
  },
  {
    MouldID: 2,
    MouldName: "YED NB LENS",
    MouldHCStatus: 3, // Overdue
    NextHCDueDate: "2026-09-19T00:00:00.000Z",
    HealthCheckDue: 21500,
  },
  {
    MouldID: 3,
    MouldName: "YSD SIDE TURN INNER LENS-3rd",
    MouldHCStatus: 2, // Due Soon
    NextHCDueDate: "2026-09-25T00:00:00.000Z",
    HealthCheckDue: 23200,
  },
  {
    MouldID: 4,
    MouldName: "YCA H/L REF. RHD-3rd",
    MouldHCStatus: 2, // Due Soon
    NextHCDueDate: "2026-09-27T00:00:00.000Z",
    HealthCheckDue: 24900,
  },
  {
    MouldID: 5,
    MouldName: "Y0M H/L REF. RHD",
    MouldHCStatus: 1, // Normal
    NextHCDueDate: "2026-10-04T00:00:00.000Z",
    HealthCheckDue: 38200,
  },
  {
    MouldID: 6,
    MouldName: "YHB RPG EXTENSION-M2",
    MouldHCStatus: 3, // Overdue
    NextHCDueDate: "2026-09-15T00:00:00.000Z",
    HealthCheckDue: 18400,
  },
  {
    MouldID: 7,
    MouldName: "YHB/YHC 25MC TL LENS",
    MouldHCStatus: 1, // Normal
    NextHCDueDate: "2026-10-12T00:00:00.000Z",
    HealthCheckDue: 45000,
  },
  {
    MouldID: 8,
    MouldName: "YED NB H/L EXTENSION",
    MouldHCStatus: 2, // Due Soon
    NextHCDueDate: "2026-09-29T00:00:00.000Z",
    HealthCheckDue: 22100,
  },
  {
    MouldID: 9,
    MouldName: "YHC RCL INNER LENS -2",
    MouldHCStatus: 1, // Normal
    NextHCDueDate: "2026-10-18T00:00:00.000Z",
    HealthCheckDue: 41000,
  },
  {
    MouldID: 10,
    MouldName: "YCA HL FTS REFLECTOR M2",
    MouldHCStatus: 1, // Normal
    NextHCDueDate: "2026-10-22T00:00:00.000Z",
    HealthCheckDue: 49500,
  },
  {
    MouldID: 11,
    MouldName: "YSD HMSL LENS-2nd",
    MouldHCStatus: 7, // Completed
    NextHCDueDate: "2026-11-05T00:00:00.000Z",
    HealthCheckDue: 50000,
  },
  {
    MouldID: 12,
    MouldName: "31XA HMSL HOUSING",
    MouldHCStatus: 1, // Normal
    NextHCDueDate: "2026-10-28T00:00:00.000Z",
    HealthCheckDue: 36000,
  },
  {
    MouldID: 13,
    MouldName: "YED NB H/L SUN SHADE",
    MouldHCStatus: 1, // Normal
    NextHCDueDate: "2026-11-10T00:00:00.000Z",
    HealthCheckDue: 48000,
  },
  {
    MouldID: 14,
    MouldName: "Y17 BACKUP HOUSING",
    MouldHCStatus: 2, // Due Soon
    NextHCDueDate: "2026-09-28T00:00:00.000Z",
    HealthCheckDue: 23500,
  },
  {
    MouldID: 15,
    MouldName: "Y17 LV REFLECTOR",
    MouldHCStatus: 1, // Normal
    NextHCDueDate: "2026-11-14T00:00:00.000Z",
    HealthCheckDue: 42000,
  },
  {
    MouldID: 16,
    MouldName: "YHB RCL EXTENSION-M3",
    MouldHCStatus: 1, // Normal
    NextHCDueDate: "2026-11-20T00:00:00.000Z",
    HealthCheckDue: 39000,
  },
  {
    MouldID: 17,
    MouldName: "Y0M H/L LENS",
    MouldHCStatus: 1, // Normal
    NextHCDueDate: "2026-11-28T00:00:00.000Z",
    HealthCheckDue: 47000,
  }
];

// 2. Week-Wise HC Plan (powers the Week-Wise Plan Histogram on HCStatus)
export const dummyHCWeekWisePlan = [
  { WeekName: "Wk 38", HCPlanCount: 4 },
  { WeekName: "Wk 39", HCPlanCount: 6 },
  { WeekName: "Wk 40", HCPlanCount: 3 },
  { WeekName: "Wk 41", HCPlanCount: 5 },
  { WeekName: "Wk 42", HCPlanCount: 7 },
  { WeekName: "Wk 43", HCPlanCount: 4 },
  { WeekName: "Wk 44", HCPlanCount: 5 },
  { WeekName: "Wk 45", HCPlanCount: 3 },
];

// 3. Mould-Wise HC Plan (Moulds currently scheduled in maintenance plan)
export const dummyHCMouldWisePlan = [
  { MouldID: 1, MouldName: "YCA H/L Lens M2", PlanDate: "2026-09-24T00:00:00.000Z" },
  { MouldID: 2, MouldName: "YED NB LENS", PlanDate: "2026-09-25T00:00:00.000Z" },
  { MouldID: 3, MouldName: "YSD SIDE TURN INNER LENS-3rd", PlanDate: "2026-09-26T00:00:00.000Z" },
  { MouldID: 6, MouldName: "YHB RPG EXTENSION-M2", PlanDate: "2026-09-28T00:00:00.000Z" },
  { MouldID: 8, MouldName: "YED NB H/L EXTENSION", PlanDate: "2026-09-30T00:00:00.000Z" },
  { MouldID: 4, MouldName: "YCA H/L REF. RHD-3rd", PlanDate: "2026-10-02T00:00:00.000Z" },
  { MouldID: 14, MouldName: "Y17 BACKUP HOUSING", PlanDate: "2026-10-05T00:00:00.000Z" },
  { MouldID: 5, MouldName: "Y0M H/L REF. RHD", PlanDate: "2026-10-09T00:00:00.000Z" },
];

// 4. Next HC Due by Date
export const dummyHCNextDueByDate = [
  { MouldID: 6, MouldName: "YHB RPG EXTENSION-M2", NextHCDueDate: "2026-09-15T00:00:00.000Z" },
  { MouldID: 1, MouldName: "YCA H/L Lens M2", NextHCDueDate: "2026-09-18T00:00:00.000Z" },
  { MouldID: 2, MouldName: "YED NB LENS", NextHCDueDate: "2026-09-19T00:00:00.000Z" },
  { MouldID: 3, MouldName: "YSD SIDE TURN INNER LENS-3rd", NextHCDueDate: "2026-09-25T00:00:00.000Z" },
  { MouldID: 4, MouldName: "YCA H/L REF. RHD-3rd", NextHCDueDate: "2026-09-27T00:00:00.000Z" },
  { MouldID: 14, MouldName: "Y17 BACKUP HOUSING", NextHCDueDate: "2026-09-28T00:00:00.000Z" },
  { MouldID: 8, MouldName: "YED NB H/L EXTENSION", NextHCDueDate: "2026-09-29T00:00:00.000Z" },
  { MouldID: 5, MouldName: "Y0M H/L REF. RHD", NextHCDueDate: "2026-10-04T00:00:00.000Z" },
  { MouldID: 7, MouldName: "YHB/YHC 25MC TL LENS", NextHCDueDate: "2026-10-12T00:00:00.000Z" },
  { MouldID: 9, MouldName: "YHC RCL INNER LENS -2", NextHCDueDate: "2026-10-18T00:00:00.000Z" },
];

// 5. Next HC Due by Shot Count (Shots remaining till HC threshold)
export const dummyHCNextDueByShot = [
  { MouldID: 6, MouldName: "YHB RPG EXTENSION-M2", HealthCheckDue: 18400 },
  { MouldID: 2, MouldName: "YED NB LENS", HealthCheckDue: 21500 },
  { MouldID: 8, MouldName: "YED NB H/L EXTENSION", HealthCheckDue: 22100 },
  { MouldID: 3, MouldName: "YSD SIDE TURN INNER LENS-3rd", HealthCheckDue: 23200 },
  { MouldID: 14, MouldName: "Y17 BACKUP HOUSING", HealthCheckDue: 23500 },
  { MouldID: 1, MouldName: "YCA H/L Lens M2", HealthCheckDue: 24800 },
  { MouldID: 4, MouldName: "YCA H/L REF. RHD-3rd", HealthCheckDue: 24900 },
  { MouldID: 12, MouldName: "31XA HMSL HOUSING", HealthCheckDue: 36000 },
  { MouldID: 5, MouldName: "Y0M H/L REF. RHD", HealthCheckDue: 38200 },
  { MouldID: 16, MouldName: "YHB RCL EXTENSION-M3", HealthCheckDue: 39000 },
];

// 6. Next 6 Months HC Plan (powers the Secondary Forecast Histogram)
export const dummyHCNext6MonthsPlan = [
  { Month: "2026-10", MouldsDueForHC: 6 },
  { Month: "2026-11", MouldsDueForHC: 5 },
  { Month: "2026-12", MouldsDueForHC: 4 },
  { Month: "2027-01", MouldsDueForHC: 7 },
  { Month: "2027-02", MouldsDueForHC: 5 },
  { Month: "2027-03", MouldsDueForHC: 3 },
];

// 7. HC Instances per Mould (for dropdown in HCCheckpointReport and HCCheckpointImages)
export const dummyHCInstances = {
  default: [
    {
      Instance: 1,
      CheckListID: 1,
      MouldID: "1",
      MouldName: "YCA H/L Lens M2",
      CheckListName: "Health Check (HC) 50K Check List",
      MaterialName: "PC Clear (Makrolon 2805)",
      AtMouldLife: "125,400 shots",
      PartName: "Headlamp Lens RH",
      UserName: "Rajesh Kumar (Maint. Engineer)"
    },
    {
      Instance: 2,
      CheckListID: 1,
      MouldID: "1",
      MouldName: "YCA H/L Lens M2",
      CheckListName: "Health Check (HC) 100K Check List",
      MaterialName: "PC Clear (Makrolon 2805)",
      AtMouldLife: "175,200 shots",
      PartName: "Headlamp Lens RH",
      UserName: "Vikas Sharma (Mould Specialist)"
    },
    {
      Instance: 3,
      CheckListID: 1,
      MouldID: "1",
      MouldName: "YCA H/L Lens M2",
      CheckListName: "Periodic Preventive Health Check",
      MaterialName: "PC Clear (Makrolon 2805)",
      AtMouldLife: "225,800 shots",
      PartName: "Headlamp Lens RH",
      UserName: "Rajesh Kumar (Maint. Engineer)"
    }
  ]
};

// Generates instance list for any mould ID dynamically
export const getDummyHCInstances = (mouldID, mouldName = "") => {
  const name = mouldName || dummyHCMouldList.find(m => String(m.MouldID) === String(mouldID))?.MouldName || "YCA H/L Lens M2";
  return [
    {
      Instance: 1,
      CheckListID: 1,
      MouldID: String(mouldID || 1),
      MouldName: name,
      CheckListName: "Health Check (HC) 50K Inspection",
      MaterialName: "PC / PMMA Optical Grade",
      AtMouldLife: "125,400 shots",
      PartName: `${name} Injection Component`,
      UserName: "Rajesh Kumar (Maint. Engineer)"
    },
    {
      Instance: 2,
      CheckListID: 1,
      MouldID: String(mouldID || 1),
      MouldName: name,
      CheckListName: "Health Check (HC) 100K Comprehensive",
      MaterialName: "PC / PMMA Optical Grade",
      AtMouldLife: "175,200 shots",
      PartName: `${name} Injection Component`,
      UserName: "Vikas Sharma (Mould Specialist)"
    },
    {
      Instance: 3,
      CheckListID: 1,
      MouldID: String(mouldID || 1),
      MouldName: name,
      CheckListName: "Periodic Health Check Routine",
      MaterialName: "PC / PMMA Optical Grade",
      AtMouldLife: "225,800 shots",
      PartName: `${name} Injection Component`,
      UserName: "Rajesh Kumar (Maint. Engineer)"
    }
  ];
};

// 8. Header Details for HC Checkpoint Report
export const getDummyHCHeader = (mouldID = 1, instance = 1, mouldName = "") => {
  const name = mouldName || dummyHCMouldList.find(m => String(m.MouldID) === String(mouldID))?.MouldName || "YCA H/L Lens M2";
  const lifeMap = {
    1: "125,400 shots",
    2: "175,200 shots",
    3: "225,800 shots"
  };

  return {
    CheckListName: "Health Check (HC) 50K Standard Inspection",
    PartName: `${name} Primary Cavity Assembly`,
    MaterialName: "PC Clear / Makrolon 2805",
    ModelCode: "YCA-2024 / Gen-3",
    MCTonnage: "450 Ton (Toshiba EC450SX)",
    AtMouldLife: lifeMap[instance] || "125,400 shots",
    MouldLife: lifeMap[instance] || "125,400 shots",
    PMFreqCount: "50,000 Shots / Monthly",
    PMDueShots: "50,000",
    UserName: "Rajesh Kumar (Sr. Tooling Engineer)",
    ApproverName: "Suresh Sharma (Maintenance Head)",
    CustomerName: "Maruti Suzuki India Ltd.",
    GateType: "Hot Runner Valve Gate (4 Drop)",
    StartTime: "2026-09-18 08:30:00",
    EndTime: "2026-09-18 11:45:00"
  };
};

// 9. Checkpoint Items Table for HC Checkpoint Report (14 technical checkpoints)
export const getDummyHCCheckpoints = (mouldID = 1, instance = 1, mouldName = "") => {
  const name = mouldName || dummyHCMouldList.find(m => String(m.MouldID) === String(mouldID))?.MouldName || "YCA H/L Lens M2";

  return [
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Core & Cavity Surface Visual Check",
      checkArea: "Cavity & Core Optical Inserts",
      checkpointItem: "Scratch, pitting, rust, flash marks, parting line dents",
      checkPointArea: "Cavity & Core Optical Inserts",
      checkingMethod: "Visual inspection with 10x magnifier & cold surface light",
      judgementCriteria: "No scratches, burrs, pitting, or rust allowable",
      checkListType: "Visual / Optical",
      upperLimit: "-",
      lowerLimit: "-",
      standard: "Zero Defects / Mirror Finish Ra < 0.05µm",
      value: "Ra 0.03µm",
      status: "OK",
      remark: "Surface mirror polished; ultrasonic degreased with solvent.",
      timeStamp: "2026-09-18T08:40:00.000Z"
    },
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Parting Line & Shut-Off Faces",
      checkArea: "Main Parting Line & Shut-off lands",
      checkpointItem: "Blue matching contact area, flash gap, deformation",
      checkPointArea: "Main Parting Line & Shut-off lands",
      checkingMethod: "Prussian blue contact check & feeler gauge (0.01mm)",
      judgementCriteria: "Even contact >= 85% area across all 4 quadrants",
      checkListType: "Contact Fit",
      upperLimit: "0.02 mm",
      lowerLimit: "0.00 mm",
      standard: "Blue Contact >= 85%, Gap < 0.02mm",
      value: "92% Contact (Gap 0.01mm)",
      status: "OK",
      remark: "Uniform shut-off seal verified; no plastic flash leakage.",
      timeStamp: "2026-09-18T08:55:00.000Z"
    },
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Guide Pillars & Guide Bushes",
      checkArea: "Guide System (Fixed & Moving Halves)",
      checkpointItem: "Radial play, scoring, galling, lubrication status",
      checkPointArea: "Guide System",
      checkingMethod: "Dial indicator & inside micrometer measurement",
      judgementCriteria: "Radial clearance within 0.020 mm to 0.040 mm",
      checkListType: "Dimensional",
      upperLimit: "0.040 mm",
      lowerLimit: "0.020 mm",
      standard: "0.020 - 0.040 mm",
      value: "0.026 mm",
      status: "OK",
      remark: "Lubricated with Kluber high-temp food-grade synthetic grease.",
      timeStamp: "2026-09-18T09:10:00.000Z"
    },
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Ejector Mechanism & Return Pins",
      checkArea: "Ejector Plate Assembly",
      checkpointItem: "Stroke smoothness, pin bending, return spring tension",
      checkPointArea: "Ejection System",
      checkingMethod: "Manual hydraulic stroke check & travel gauge",
      judgementCriteria: "Smooth full stroke 85mm; zero sticking or binding",
      checkListType: "Mechanical Function",
      upperLimit: "85.5 mm",
      lowerLimit: "84.5 mm",
      standard: "Stroke 85.0 mm ± 0.5 mm",
      value: "85.1 mm",
      status: "OK",
      remark: "All 16 ejector pins flush with cavity surface at zero stroke.",
      timeStamp: "2026-09-18T09:25:00.000Z"
    },
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Cooling Circuit Pressure & Flow Test",
      checkArea: "Core & Cavity Water Channels (8 Circuits)",
      checkpointItem: "Cooling flow rate, scale buildup, leak at 6 bar",
      checkPointArea: "Thermal Regulation",
      checkingMethod: "Digital turbine flow meter & pneumatic pressure test",
      judgementCriteria: "Zero leakage at 6 bar hold for 15 min; Flow >= 12 L/min",
      checkListType: "Hydraulic / Flow",
      upperLimit: "25 L/min",
      lowerLimit: "12 L/min",
      standard: ">= 12.0 L/min @ 4 bar, 0 drop @ 6 bar",
      value: "14.6 L/min (0.0 bar drop)",
      status: "OK",
      remark: "Acid descaling performed; all Viton O-rings replaced.",
      timeStamp: "2026-09-18T09:45:00.000Z"
    },
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Hot Runner Nozzle & Manifold Heaters",
      checkArea: "Hot Runner System (4 Drop)",
      checkpointItem: "Heater resistance, thermocouple signal, insulation",
      checkPointArea: "Hot Runner Electrical",
      checkingMethod: "Digital multimeter & 500V Megger insulation tester",
      judgementCriteria: "Resistance ±5% of 45.2 Ω; Insulation > 50 MΩ",
      checkListType: "Electrical",
      upperLimit: "47.5 Ω",
      lowerLimit: "43.0 Ω",
      standard: "45.2 Ω ± 5%, Insulation > 50 MΩ",
      value: "45.8 Ω (120 MΩ)",
      status: "OK",
      remark: "All 4 zones balanced and tested to 245°C operating setpoint.",
      timeStamp: "2026-09-18T10:05:00.000Z"
    },
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Slide Blocks & Wear Plates Clearance",
      checkArea: "Side Core Slide Mechanism",
      checkpointItem: "Wear plate clearance, locking block wedge contact",
      checkPointArea: "Side Action Cams",
      checkingMethod: "Feeler gauge & dial indicator across cam travel",
      judgementCriteria: "Slide clearance within 0.030 mm to 0.050 mm",
      checkListType: "Mechanical Fit",
      upperLimit: "0.050 mm",
      lowerLimit: "0.030 mm",
      standard: "0.030 - 0.050 mm",
      value: "0.035 mm",
      status: "OK",
      remark: "Bronze-graphite wear plates inspected; oil grooves cleaned.",
      timeStamp: "2026-09-18T10:20:00.000Z"
    },
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Hydraulic Core Pull Cylinder Operation",
      checkArea: "Hydraulic Side Cylinders (A & B)",
      checkpointItem: "Piston rod scoring, seal weepage, reed switch triggers",
      checkPointArea: "Core Actuation",
      checkingMethod: "Hydraulic power unit test at 140 bar; sensor LED verification",
      judgementCriteria: "Zero oil weepage at 140 bar; proximity sensors trigger reliably",
      checkListType: "Hydraulic / Sensor",
      upperLimit: "0 leaks",
      lowerLimit: "0 leaks",
      standard: "Zero Leakage @ 140 bar",
      value: "0 Leaks / Dual Proximity OK",
      status: "OK",
      remark: "Forward and retract magnetic sensors securely locked.",
      timeStamp: "2026-09-18T10:35:00.000Z"
    },
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Air Venting Depths & Gas Cleanliness",
      checkArea: "Parting Line Perimeter Vents",
      checkpointItem: "Vent depth, polymer burn deposits, vent channel blockage",
      checkPointArea: "Degassing System",
      checkingMethod: "Optical depth comparator & digital micrometer",
      judgementCriteria: "Depth 0.020 mm - 0.030 mm for optical polycarbonate",
      checkListType: "Precision Measurement",
      upperLimit: "0.030 mm",
      lowerLimit: "0.020 mm",
      standard: "0.025 ± 0.005 mm",
      value: "0.024 mm",
      status: "OK",
      remark: "Gas vents ultrasonic cleaned; free of oxidized polymer residue.",
      timeStamp: "2026-09-18T10:50:00.000Z"
    },
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Locating Ring & Clamping Flanges",
      checkArea: "Machine Clamping Interface",
      checkpointItem: "Centering ring outer diameter, clamping slot wear",
      checkPointArea: "Mounting Interface",
      checkingMethod: "Vernier caliper measurement & thread pitch gauge",
      judgementCriteria: "Diameter 160 mm (-0.05 / -0.10 mm); bolt threads undamaged",
      checkListType: "Interface Check",
      upperLimit: "160.00 mm",
      lowerLimit: "159.90 mm",
      standard: "Ø 160.0 mm (-0.05/-0.10)",
      value: "159.94 mm",
      status: "OK",
      remark: "Locating ring concentricity within 0.02mm TIR.",
      timeStamp: "2026-09-18T11:00:00.000Z"
    },
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Mould Base Tie Bolts Torque Audit",
      checkArea: "Cavity & Core Backing Plates",
      checkpointItem: "Bolt torque retention, dowel pin seating",
      checkPointArea: "Structure",
      checkingMethod: "Calibrated digital torque wrench (Grade 12.9 M16)",
      judgementCriteria: "All bolts torqued to specified 210 N·m",
      checkListType: "Fastening Torque",
      upperLimit: "220 N·m",
      lowerLimit: "200 N·m",
      standard: "210 N·m ± 5%",
      value: "210 N·m Verified",
      status: "OK",
      remark: "100% of tie bolts cross-pattern checked and confirmed.",
      timeStamp: "2026-09-18T11:15:00.000Z"
    },
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Digital Shot Counter & RFID Sync",
      checkArea: "Electronic Telematic Counter Housing",
      checkpointItem: "Physical counter stroke sync, RFID telemetry handshake",
      checkPointArea: "IoT / Traceability",
      checkingMethod: "Handheld RFID scanner & machine PLC comparison",
      judgementCriteria: "RFID tag shots match machine controller count exactly",
      checkListType: "Digital Telemetry",
      upperLimit: "0 variance",
      lowerLimit: "0 variance",
      standard: "Match Machine Controller",
      value: "125,400 shots (0 variance)",
      status: "OK",
      remark: "Battery level 3.6V nominal; telemetry sync verified.",
      timeStamp: "2026-09-18T11:25:00.000Z"
    },
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Safety Limit Switch Interlocks",
      checkArea: "Ejector Return & Core Safety Switches",
      checkpointItem: "Microswitch actuation, wiring harness, connector seal",
      checkPointArea: "Safety Interlocks",
      checkingMethod: "Continuity beeper test & physical plunger depression",
      judgementCriteria: "Positive contact break before clamp close; zero delay",
      checkListType: "Safety System",
      upperLimit: "-",
      lowerLimit: "-",
      standard: "100% Fail-Safe Trip",
      value: "Trip Response < 10ms",
      status: "OK",
      remark: "Omron industrial limit switches inspected and confirmed.",
      timeStamp: "2026-09-18T11:35:00.000Z"
    },
    {
      instance: Number(instance) || 1,
      mouldName: name,
      checklistName: "Health Check (HC) 50K Inspection",
      checkpointName: "Corrosion Protection & Post-Service Preservation",
      checkArea: "Mould Overall Surface & Water Inlets",
      checkpointItem: "Anti-rust aerosol spray coating, water port blanking caps",
      checkPointArea: "Storage Readiness",
      checkingMethod: "Visual inspection under bright white illumination",
      judgementCriteria: "Full vapor-phase inhibitor film applied on polished cavities",
      checkListType: "Chemical Protection",
      upperLimit: "-",
      lowerLimit: "-",
      standard: "100% Uniform VCI Film",
      value: "VCI Coated & Capped",
      status: "OK",
      remark: "Treated with CRC SP-400 corrosion barrier; ready for production.",
      timeStamp: "2026-09-18T11:45:00.000Z"
    }
  ];
};

// 10. Inspection Photos (for HCCheckpointImage.jsx)
export const getDummyHCCheckpointImages = (mouldName = "YCA H/L Lens M2", instance = 1) => {
  // Generates clean SVG technical preview illustrations
  const makeSvg = (title, subtitle, code) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
        <rect width="640" height="480" fill="#0f172a"/>
        <rect x="20" y="20" width="600" height="440" rx="12" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <path d="M40 80 H600 M40 400 H600" stroke="#334155" stroke-width="1" stroke-dasharray="4 4"/>
        <circle cx="320" cy="220" r="90" fill="#0284c7" fill-opacity="0.1" stroke="#0284c7" stroke-width="2"/>
        <circle cx="320" cy="220" r="50" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="1.5"/>
        <line x1="220" y1="220" x2="420" y2="220" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 2"/>
        <line x1="320" y1="120" x2="320" y2="320" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 2"/>
        <text x="320" y="60" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#f8fafc" text-anchor="middle">${title}</text>
        <text x="320" y="360" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">${subtitle}</text>
        <text x="320" y="430" font-family="monospace" font-size="11" fill="#38bdf8" text-anchor="middle">${code}</text>
      </svg>
    `.trim();
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  return [
    {
      uid: 101,
      checkpoint: 1,
      mouldName: mouldName,
      instance: instance,
      image: makeSvg(
        "Checkpoint #1: Optical Cavity Surface Inspection",
        "Mirror finish Ra 0.03µm - Verified zero scratch or scoring",
        "INSP-CP01-CAV-OPTICAL"
      )
    },
    {
      uid: 102,
      checkpoint: 2,
      mouldName: mouldName,
      instance: instance,
      image: makeSvg(
        "Checkpoint #2: Parting Line Shut-Off Land",
        "Prussian blue contact check - 92% uniform contact verified",
        "INSP-CP02-PL-SHUTOFF"
      )
    },
    {
      uid: 103,
      checkpoint: 3,
      mouldName: mouldName,
      instance: instance,
      image: makeSvg(
        "Checkpoint #3: Guide Pillar & Bush Clearance",
        "Dial gauge measurement - Radial clearance 0.026mm",
        "INSP-CP03-GUIDE-PILLAR"
      )
    },
    {
      uid: 104,
      checkpoint: 5,
      mouldName: mouldName,
      instance: instance,
      image: makeSvg(
        "Checkpoint #5: Cooling Channel Flow & Pressure Test",
        "Turbine flowmeter @ 14.6 L/min - 6 bar hold test passed",
        "INSP-CP05-COOLING-FLOW"
      )
    },
    {
      uid: 105,
      checkpoint: 6,
      mouldName: mouldName,
      instance: instance,
      image: makeSvg(
        "Checkpoint #6: Hot Runner Manifold Heating Test",
        "4-zone balance @ 245°C - 500V Megger test > 100MΩ",
        "INSP-CP06-HOT-RUNNER"
      )
    },
    {
      uid: 106,
      checkpoint: 12,
      mouldName: mouldName,
      instance: instance,
      image: makeSvg(
        "Checkpoint #12: Shot Counter RFID Telemetry Handshake",
        "PLC 125,400 shots synchronized with RFID transponder",
        "INSP-CP12-RFID-TELEMETRY"
      )
    }
  ];
};

// 11. HC OnTime vs Delayed (monthly fallback for Mould 360 dashboard)
export const dummyHCOnTimeVsDelayed = [
  { month: "2026/04", OnTime: 3, Delayed: 1 },
  { month: "2026/05", OnTime: 2, Delayed: 2 },
  { month: "2026/06", OnTime: 4, Delayed: 1 },
  { month: "2026/07", OnTime: 3, Delayed: 3 },
  { month: "2026/08", OnTime: 5, Delayed: 2 },
  { month: "2026/09", OnTime: 2, Delayed: 2 },
  { month: "2026/10", OnTime: 4, Delayed: 1 }
];
