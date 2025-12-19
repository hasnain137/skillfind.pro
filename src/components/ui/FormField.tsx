// Reusable form field wrapper with inline error display
import { ReactNode } from 'react';

interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: ReactNode;
    className?: string;
}

export function FormField({
    label,
    required = false,
    error,
    hint,
    children,
    className = '',
}: FormFieldProps) {
    return (
        <div className={className}>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                {label} {required && '*'}
            </label>
            {children}
            {error && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <span className="text-red-500">⚠</span> {error}
                </p>
            )}
            {hint && !error && (
                <p className="mt-1 text-[11px] text-[#7C7373]">{hint}</p>
            )}
        </div>
    );
}

// Input with error state styling
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
}

export function FormInput({ hasError, className = '', ...props }: FormInputProps) {
    return (
        <input
            {...props}
            className={`
        w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#333333] 
        placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 transition-colors
        ${hasError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15 bg-red-50/30'
                    : 'border-[#E5E7EB] focus:border-[#2563EB] focus:ring-[#2563EB]/15'
                }
        ${className}
      `}
        />
    );
}

// Textarea with error state styling
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    hasError?: boolean;
}

export function FormTextarea({ hasError, className = '', ...props }: FormTextareaProps) {
    return (
        <textarea
            {...props}
            className={`
        w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#333333] 
        placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 transition-colors
        ${hasError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15 bg-red-50/30'
                    : 'border-[#E5E7EB] focus:border-[#2563EB] focus:ring-[#2563EB]/15'
                }
        ${className}
      `}
        />
    );
}

// Select with error state styling
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    hasError?: boolean;
}

export function FormSelect({ hasError, className = '', children, ...props }: FormSelectProps) {
    return (
        <select
            {...props}
            className={`
        w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#333333] 
        focus:outline-none focus:ring-2 transition-colors
        disabled:bg-gray-50 disabled:text-gray-400
        ${hasError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15 bg-red-50/30'
                    : 'border-[#E5E7EB] focus:border-[#2563EB] focus:ring-[#2563EB]/15'
                }
        ${className}
      `}
        >
            {children}
        </select>
    );
}
