export default function HomePageMacineSummaryCard({ machine }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow w-60 cursor-pointer transform">
      {/* Title */}
      <div className="flex justify-center items-center bg-blue-100 dark:bg-blue-900 rounded-t-2xl py-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 text-center break-words max-w-[200px]">
          {machine.EquipmentName}
          
        </span>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col items-center">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 text-center mb-2">
          {machine.MouldName}
        </h3>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 w-full">
          <div className="flex flex-col items-center">
            <span className="font-medium">Expected</span>
            <span className="font-bold text-black ">{machine.ExpectedQuantity}</span>
          </div>
           <div className="flex flex-col items-center">
            <span className="font-medium">Actual</span>
            <span className="font-bold text-black ">{machine.ActualQuantity}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium">Rejected</span>
            <span className="font-bold text-black ">{machine.RejectedQty}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium">Op. Time</span>
            <span className="font-bold text-black ">{machine.OpTime}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium">Downtime</span>
            <span className="font-bold text-black ">{machine.Downtime}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium">OEE</span>
            <span className="font-bold text-black ">{machine.OEEPercent}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium">Availability</span>
            <span className="font-bold text-black ">{machine.AvailabilityPercent}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium">Performance</span>
            <span className="font-bold text-black ">{machine.PerformancePercent}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium">Quality</span>
            <span className="font-bold text-black ">{machine.QualityPercent}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
