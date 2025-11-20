// @ts-ignore;
import React from 'react';

export function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  icon: Icon,
  className = ''
}) {
  return <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {Icon && <Icon className="inline w-4 h-4 mr-1" />}
        {label}
        {required && ' *'}
      </label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} className={`w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${className}`} placeholder={placeholder} />
    </div>;
}