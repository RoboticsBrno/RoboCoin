import React from 'react';
import { useFormContext } from 'react-hook-form';

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  name: string;
  options: Option[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function FormSelect({ label, name, options, onChange, ...props }: FormSelectProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  // Get the onChange from react-hook-form
  const { onChange: rfhOnChange, ...restOfRegister } = register(name);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // First, call the handler from react-hook-form to update the form state
    rfhOnChange(e);
    // Then, call the custom handler if it exists
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <>
      <label htmlFor={props.id || name} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <select
        id={props.id || name}
        className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        {...restOfRegister} // Spread the rest of the register props
        {...props}
        onChange={handleChange} // Use our combined handler
      >
        <option value="">-- Select an Option --</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </>
  );
}
