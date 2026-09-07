export default function MachineCard({ machine }) {
  const oee = parseFloat(machine.OEEPercent) || 0;
  const oeeColor = oee >= 75 ? "text-green-600" : oee >= 50 ? "text-amber-500" : "text-red-500";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{machine.EquipmentName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{machine.MouldName || "—"}</p>
        </div>
        <span className={`text-xl font-bold ${oeeColor}`}>{oee}%</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ["Plan", machine.ExpectedQuantity],
          ["Actual", machine.ActualQuantity],
          ["Reject", machine.RejectedQty],
          ["Downtime", machine.Downtime],
          ["Avail.", machine.AvailabilityPercent],
          ["Perf.", machine.PerformancePercent],
        ].map(([k, v]) => (
          <div key={k} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
            <p className="text-gray-400 text-[10px] uppercase font-medium">{k}</p>
            <p className="text-gray-700 dark:text-gray-200 font-semibold">{v ?? "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
