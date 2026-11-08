'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
  searchable?: boolean;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option...',
  className,
  disabled = false,
  'aria-label': ariaLabel,
  searchable = true,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const listboxId = React.useId();

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setSearch('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Autofocus search on open
  React.useEffect(() => {
    if (open && searchable && options.length > 5) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open, searchable, options.length]);

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div ref={containerRef} className={cn('relative inline-block w-full', className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel || placeholder}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-xl border border-input bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition-all cursor-pointer select-none',
          'hover:bg-muted/70 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          open && 'ring-2 ring-primary border-primary bg-card'
        )}
      >
        <span className={cn('truncate text-left', !selectedOption && 'text-muted-foreground')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn('ml-2 h-4 w-4 opacity-70 transition-transform shrink-0', open && 'rotate-180 text-primary')} />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 top-full mt-2 z-[9999] min-w-[280px] w-full max-w-[94vw] rounded-2xl border-2 border-primary/50 bg-[#161a29] text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/10 p-2 flex flex-col gap-1.5 opacity-100 visible"
          style={{
            backgroundColor: '#161a29',
            color: '#ffffff',
          }}
        >
          {/* Search Filter inside Dropdown */}
          {searchable && options.length > 5 && (
            <div className="relative flex items-center px-1 pb-1.5 border-b border-white/10">
              <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to filter..."
                className="w-full bg-[#101320] rounded-lg pl-8 pr-7 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary border border-white/15 font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Options List with Guaranteed Sturdy Height and Smooth Scroll */}
          <div
            className="overflow-y-auto space-y-1 pr-1 overscroll-contain"
            style={{
              maxHeight: '280px',
              minHeight: filteredOptions.length > 2 ? '160px' : 'auto',
            }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors outline-none text-slate-200',
                      'hover:bg-primary/20 hover:text-white',
                      isSelected && 'bg-primary/25 text-emerald-300 font-bold border border-primary/40'
                    )}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
