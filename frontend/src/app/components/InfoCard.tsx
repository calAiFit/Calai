export default function InfoCard({
  title,
  value,
  description,
  highlight = false,
}: {
  title: string;
  value: string | number;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-xl border shadow-sm ${
        highlight
          ? "bg-purple-50 border-purple-200"
          : "bg-white border-gray-200"
      }`}
    >
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  );
}
