'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command } from 'cmdk';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
    value: string;
    label: string;
}

interface ComboboxProps {
    value?: string;
    onChange: (value: string) => void;
    options: ComboboxOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    disabled?: boolean;
    hasError?: boolean;
    allowCustomValue?: boolean;
}

export function Combobox({
    value,
    onChange,
    options,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyText = "No results found.",
    className,
    disabled = false,
    hasError = false,
    allowCustomValue = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Reset search when opening/closing
    React.useEffect(() => {
        if (!open) setSearchQuery("");
    }, [open]);

    // Find selected label for display
    const selectedLabel = React.useMemo(() => {
        return options.find((option) => option.value === value)?.label || value || '';
    }, [options, value]);

    // Manually filter and limit options for performance
    const filteredOptions = React.useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const filtered = query
            ? options.filter(option =>
                option.label.toLowerCase().includes(query) ||
                option.value.toLowerCase().includes(query)
            )
            : options;

        // Return first 3000 items to ensure most cities are visible while keeping DOM somewhat performant
        return filtered.slice(0, 3000);
    }, [options, searchQuery]);

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
                        hasError
                            ? "border-red-400 bg-red-50/30 text-red-900 focus:border-red-500 focus:ring-red-500/15"
                            : "border-[#E5E7EB] bg-white text-[#333333] focus:border-[#2563EB] focus:ring-[#2563EB]/15",
                        !value && "text-[#B0B0B0]",
                        className
                    )}
                >
                    <span className="truncate">{selectedLabel || placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white text-[#333333] shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                    sideOffset={4}
                >
                    <Command
                        className="flex h-full w-full flex-col overflow-hidden rounded-md bg-white"
                        shouldFilter={false} // We handle filtering manually for performance
                    >
                        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                            <Command.Input
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[#B0B0B0] disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden py-1">
                            <Command.Empty className="py-2 text-center text-sm text-[#7C7373]">
                                {allowCustomValue && searchQuery ? (
                                    <button
                                        className="w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50"
                                        onClick={() => {
                                            onChange(searchQuery);
                                            setOpen(false);
                                        }}
                                    >
                                        Use "{searchQuery}"
                                    </button>
                                ) : (
                                    emptyText
                                )}
                            </Command.Empty>
                            {filteredOptions.map((option) => (
                                <Command.Item
                                    key={option.value}
                                    value={option.value} // Use value for selection
                                    onSelect={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-gray-100 data-[selected=true]:text-[#333333] data-[disabled=true]:opacity-50",
                                        option.value === value ? "bg-blue-50 text-blue-700" : ""
                                    )}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </Command.Item>
                            ))}
                        </Command.List>
                    </Command>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
