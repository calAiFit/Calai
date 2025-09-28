import { Input } from "@/components/ui/input";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

export default function InputField({ label, value, onChange, type = "text" }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
        placeholder={`Enter your ${label.toLowerCase()}`}
        type={type}
      />
    </div>
  );
}
