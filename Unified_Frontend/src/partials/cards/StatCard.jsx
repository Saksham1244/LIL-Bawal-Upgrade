export default function StatCard({ title, value, unit = "", icon, color = "indigo", sub }) {
  const colors = {
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    green:  "bg-green-50  dark:bg-green-900/20  text-green-600  dark:text-green-400",
    red:    "bg-red-50    dark:bg-red-900/20    text-red-600    dark:text-red-400",
    amber:  "bg-amber-50  dark:bg-amber-900/20  text-amber-600  dark:text-amber-400",
    sky:    "bg-sky-50    dark:bg-sky-900/20    text-sky-600    dark:text-sky-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        {icon && (
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${colors[color] || colors.indigo}`}>
            {icon}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value ?? "—"}<span className="text-lg font-normal text-gray-400 ml-1">{unit}</span>
        </p>
        {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
