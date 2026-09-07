export default function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
      {action && <div>{action}</div>}
    </div>
  );
}
