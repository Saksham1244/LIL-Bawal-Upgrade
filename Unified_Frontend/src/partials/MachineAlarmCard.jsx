import React from "react";

const MachineAlarmCard = ({ name, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 rounded-md text-white font-semibold transition-all duration-200
        ${isSelected ? "bg-red-600" : "bg-[#6b7bd9] hover:bg-[#061887]"}`}
    >
      {name}
    </button>
  );
};

export default MachineAlarmCard;
