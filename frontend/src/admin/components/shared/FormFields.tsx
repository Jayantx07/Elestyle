import React, { forwardRef, type InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className="w-full">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`block w-full rounded-md border ${
            error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary focus:ring-primary'
          } shadow-sm sm:text-sm px-3 py-2 outline-none transition-colors ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${inputId}-error`}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500" id={`${inputId}-description`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string | number; label: string }[];
  error?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, options, error, className = '', id, ...props }, ref) => {
    const selectId = id || label.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className="w-full">
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`block w-full rounded-md border ${
            error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary focus:ring-primary'
          } shadow-sm sm:text-sm px-3 py-2 outline-none transition-colors bg-white ${className}`}
          {...props}
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId = id || label.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className="w-full">
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          className={`block w-full rounded-md border ${
            error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary focus:ring-primary'
          } shadow-sm sm:text-sm px-3 py-2 outline-none transition-colors min-h-[100px] ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const checkboxId = id || label.replace(/\s+/g, '-').toLowerCase();
    
    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          id={checkboxId}
          ref={ref}
          className={`h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ${className}`}
          {...props}
        />
        <label htmlFor={checkboxId} className="ml-2 block text-sm text-gray-900">
          {label}
        </label>
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';
