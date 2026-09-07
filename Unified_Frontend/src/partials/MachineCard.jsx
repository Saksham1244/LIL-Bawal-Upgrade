import React from "react";

function MachineCard({ title, data }) {
  return (
    <div className="w-60 p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl flex flex-col gap-2">
      {title && (
        <h3 className="font-bold text-lg text-center text-[#3c51d2] mb-2">
          {title}
        </h3>
      )}
      {Object.entries(data).map(([key, value], idx) => (
        <div key={idx} className="flex justify-between text-sm">
          <span className="font-medium">{key}:</span>
          <span
            className={
              key.toLowerCase() === "productivity"
                ? value >= 80
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
                : ""
            }
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default MachineCard;

