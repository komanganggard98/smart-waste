import React, { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectOption {
    label: string;
    value: string | number;
}

export interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
    options?: SelectOption[] | string[];
    placeholder?: string;
    error?: boolean;
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
    ({ className = '', options = [], placeholder, error, children, ...props }, ref) => {
        return (
            <select
                ref={ref}
                className={`block w-full rounded-md border-slate-200 text-sm transition-colors duration-150 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary-soft)] ${
                    error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                } ${className}`}
                {...props}
            >
                {/* Custom Placeholder jika ada */}
                {placeholder && (
                    <option value="" disabled hidden={props.required}>
                        {placeholder}
                    </option>
                )}

                {/* Render dari array options (mendukung array string maupun object {label, value}) */}
                {options.map((option, index) => {
                    if (typeof option === 'string') {
                        return (
                            <option key={`${option}-${index}`} value={option}>
                                {option}
                            </option>
                        );
                    }
                    return (
                        <option key={`${option.value}-${index}`} value={option.value}>
                            {option.label}
                        </option>
                    );
                })}

                {/* Render children manual jika tidak menggunakan prop options */}
                {children}
            </select>
        );
    }
);

SelectInput.displayName = 'SelectInput';

export default SelectInput;