// components/ToggleParameter.jsx
export default function ToggleParameter({ name, values, onToggle }) {
  return (
    <div className="my-2">
      <div className="font-medium mb-1">{name}</div>
      <div className="flex gap-2">
        {values.map((val, index) => (
          <button
            key={index}
            className={`px-3 py-1 rounded ${
              val.active ? "bg-red-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => onToggle(name, index)}
          >
            {val.label}
          </button>
        ))}
      </div>
    </div>
  );
}
