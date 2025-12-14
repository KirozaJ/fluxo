import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    label?: string;
    className?: string;
}

export const Select = ({ value, onChange, options, placeholder = 'Select...', label, className = '' }: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`w-full ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-text-muted mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center justify-between h-11 w-full rounded-2xl border border-white/20 dark:border-white/10 bg-background px-4 py-2 text-sm text-text-main transition-all hover:bg-secondary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}`}
                >
                    <span className={selectedOption ? 'text-text-main' : 'text-text-muted/50'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDownIcon className={`h-4 w-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/20 dark:border-white/10 bg-surface shadow-lg animate-in fade-in zoom-in-95 duration-100">
                        <div className="max-h-60 overflow-auto py-1 custom-scrollbar">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 hover:text-primary text-text-main
                                        ${value === option.value ? 'bg-primary/5 text-primary font-medium' : ''}
                                    `}
                                >
                                    {option.label}
                                </button>
                            ))}
                            {options.length === 0 && (
                                <div className="px-4 py-3 text-sm text-text-muted text-center">
                                    No options available
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
