import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../pages/auth/PrivateRoute";
import Login from "../pages/auth/Login";
import Error from "../pages/Error";

// Home
import DashboardHome from "../pages/DashboardHome";

// Performance module
import Performance from "../pages/performance/Performance";
import MachinePerformance from "../pages/performance/MachinePerformance";
import Downtime from "../pages/performance/Downtime";
import MachineDowntime from "../pages/performance/MachineDowntime";
import Alarms from "../pages/performance/Alarms";
import Parameters from "../pages/performance/Parameters";
import MachineCockpit from "../pages/performance/MachineCockpit";
import MachineDrillDown from "../pages/performance/MachineDrillDown";

// Mould module
import MouldSummary from "../pages/mould/MouldSummary";
import PMStatus from "../pages/mould/PMStatus";
import HCStatus from "../pages/mould/HCStatus";
import SparePart from "../pages/mould/SparePart";
import MouldMaintenanceHistory from "../pages/mould/history/MouldMaintanceHistory";
import HCHistory from "../pages/mould/history/HCHistory";
import MouldBreakdownHistory from "../pages/mould/history/BreakDownHistory";
import SparePartHistory from "../pages/mould/history/SparePartHistory";
import PMCheckPointReport from "../pages/mould/history/PMCheckPointReport";
import HCCheckpointReport from "../pages/mould/history/HCCheckpointReport";
import PMCheckpointImages from "../pages/mould/history/PMCheckpointImage";
import HCCheckpointImages from "../pages/mould/history/HCCheckpointImage";
import MouldParameters from "../pages/mould/MouldParameters";

// Plant Head module
import PlantHeadHome from "../pages/plant/PlantHeadHome";

const Guard = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />

      {/* Dashboard Home */}
      <Route path="/home" element={<Guard><DashboardHome /></Guard>} />
      <Route path="/Home" element={<Guard><DashboardHome /></Guard>} />

      {/* Plant Head View */}
      <Route path="/plant-head" element={<Guard><PlantHeadHome /></Guard>} />
      <Route path="/PlantHead" element={<Guard><PlantHeadHome /></Guard>} />
      <Route path="/planthead" element={<Guard><PlantHeadHome /></Guard>} />

      {/* Performance module */}
      <Route path="/performance" element={<Guard><Performance /></Guard>} />
      <Route path="/Performance" element={<Guard><Performance /></Guard>} />
      <Route path="/performance/machine/:stationId" element={<Guard><MachinePerformance /></Guard>} />
      <Route path="/machine-cockpit" element={<Guard><MachineCockpit /></Guard>} />
      <Route path="/MachineCockpit" element={<Guard><MachineCockpit /></Guard>} />
      <Route path="/machine-cockpit/:machineId" element={<Guard><MachineDrillDown /></Guard>} />
      <Route path="/cockpit" element={<Guard><MachineCockpit /></Guard>} />

      <Route path="/downtime" element={<Guard><Downtime /></Guard>} />
      <Route path="/Downtime" element={<Guard><Downtime /></Guard>} />
      <Route path="/downtime/machine/:stationId" element={<Guard><MachineDowntime /></Guard>} />

      <Route path="/alarms" element={<Guard><Alarms /></Guard>} />
      <Route path="/Alarms" element={<Guard><Alarms /></Guard>} />

      <Route path="/parameters" element={<Guard><Parameters /></Guard>} />
      <Route path="/Parameters" element={<Guard><Parameters /></Guard>} />

      {/* Mould module - both kebab and legacy routes supported without 404 */}
      <Route path="/mould-summary" element={<Guard><MouldSummary /></Guard>} />
      <Route path="/MouldSummary" element={<Guard><MouldSummary /></Guard>} />

      <Route path="/pm-status" element={<Guard><PMStatus /></Guard>} />
      <Route path="/PMStatus" element={<Guard><PMStatus /></Guard>} />

      <Route path="/hc-status" element={<Guard><HCStatus /></Guard>} />
      <Route path="/HCStatus" element={<Guard><HCStatus /></Guard>} />

      <Route path="/mould-history" element={<Guard><MouldMaintenanceHistory /></Guard>} />
      <Route path="/MouldMaintenanceHistory" element={<Guard><MouldMaintenanceHistory /></Guard>} />

      <Route path="/HCHistory" element={<Guard><HCHistory /></Guard>} />
      <Route path="/hc-history" element={<Guard><HCHistory /></Guard>} />

      <Route path="/MouldBreakdownHistory" element={<Guard><MouldBreakdownHistory /></Guard>} />
      <Route path="/mould-breakdown-history" element={<Guard><MouldBreakdownHistory /></Guard>} />
      <Route path="/BreakDownHistory" element={<Guard><MouldBreakdownHistory /></Guard>} />

      <Route path="/SparePartHistory" element={<Guard><SparePartHistory /></Guard>} />
      <Route path="/spare-part-history" element={<Guard><SparePartHistory /></Guard>} />

      <Route path="/PMCheckPointReport" element={<Guard><PMCheckPointReport /></Guard>} />
      <Route path="/pm-checkpoint-report" element={<Guard><PMCheckPointReport /></Guard>} />

      <Route path="/HCCheckPointReport" element={<Guard><HCCheckpointReport /></Guard>} />
      <Route path="/hc-checkpoint-report" element={<Guard><HCCheckpointReport /></Guard>} />

      <Route path="/PMCheckpointImages" element={<Guard><PMCheckpointImages /></Guard>} />
      <Route path="/pm-checkpoint-images" element={<Guard><PMCheckpointImages /></Guard>} />

      <Route path="/HCCheckpointImages" element={<Guard><HCCheckpointImages /></Guard>} />
      <Route path="/hc-checkpoint-images" element={<Guard><HCCheckpointImages /></Guard>} />

      <Route path="/spare-parts" element={<Guard><SparePart /></Guard>} />
      <Route path="/SpareParts" element={<Guard><SparePart /></Guard>} />

      <Route path="/mould-parameters" element={<Guard><MouldParameters /></Guard>} />
      <Route path="/MouldParameters" element={<Guard><MouldParameters /></Guard>} />

      {/* Catch-all */}
      <Route path="*" element={<Error />} />
    </Routes>
  );
}
