import React from 'react'

const MachinePerformanceCard = ({ title }) => {
  return (
    <div
     className="bg-white dark:bg-gray-800 h-24 dark:text-white shadow-md cursor-pointer rounded-2xl flex items-center justify-center p-6 text-lg font-semibold text-gray-800">
      {title}
    </div>
  )
}

export default MachinePerformanceCard