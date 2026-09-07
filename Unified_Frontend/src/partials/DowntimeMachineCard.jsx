import React from "react";
import { useNavigate } from "react-router-dom";

const DowntimeMachineCard = ({ id, name }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/downtime/machine/${id}`, { state: { machineName: name } });
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white shadow-md rounded-xl p-4 text-center hover:bg-blue-50 transition"
    >
      <p className="font-semibold text-gray-700">{name}</p>
    </div>
  );
};

export default DowntimeMachineCard;
