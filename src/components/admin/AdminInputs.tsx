import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

// Generic Portal Dropdown to prevent clipping in overflow containers
const PortalDropdown = ({ 
  value, 
  options, 
  onChange, 
  className,
  menuWidth,
  alignRight
}: { 
  value: any, 
  options: {val: any, label: string}[], 
  onChange: (val: any) => void, 
  className?: string,
  menuWidth?: string,
  alignRight?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: alignRight ? rect.right + window.scrollX : rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen, alignRight]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If clicking outside, close. For simplicity, just close on any mousedown
      // unless it's on the button itself. The portal content will handle its own clicks.
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        // We use a timeout to allow the portal item click to register first
        setTimeout(() => setIsOpen(false), 100);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedLabel = options.find(o => o.val === value)?.label || value;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className={className || "w-full bg-transparent border-b border-transparent hover:border-gray-600 focus:border-neon-red text-gray-300 font-mono text-[10px] sm:text-xs text-left pb-1 px-2 flex justify-between items-center transition-colors"}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180 text-neon-red' : 'text-gray-500'}`} />
      </button>

      {isOpen && createPortal(
        <div 
          className="absolute z-[9999] bg-[#0a0a0a] border border-gray-800 shadow-xl max-h-48 overflow-y-auto custom-scrollbar"
          style={{ 
            top: coords.top, 
            left: alignRight ? `calc(${coords.left}px - ${menuWidth || '100px'})` : coords.left, 
            width: menuWidth || Math.max(coords.width, 100)
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {options.map(o => (
            <div
              key={o.val}
              onClick={(e) => {
                e.stopPropagation();
                onChange(o.val);
                setIsOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer font-mono text-xs hover:bg-blood-red/20 hover:text-neon-red transition-colors ${o.val === value ? 'bg-blood-red/10 text-neon-red border-l-2 border-neon-red' : 'text-gray-300'}`}
            >
              {o.label}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

export const MansionSelect = ({ value, onChange, className }: { value: number, onChange: (val: number) => void, className?: string }) => {
  const options = [];
  for (let i = 1; i <= 30; i++) {
    options.push({ val: i, label: `${i}` });
  }
  for (let i = 1; i <= 8; i++) {
    options.push({ val: 30 + i, label: `P${i}` });
  }
  return <PortalDropdown value={value} options={options} onChange={onChange} className={className} menuWidth="100px" />;
};

export const NemesisSelect = ({ value, onChange, className }: { value: string, onChange: (val: string) => void, className?: string }) => {
  const options = ['Fácil', 'Normal', 'Difícil', 'Pesadilla', 'Infierno'].map(o => ({ val: o, label: o }));
  return <PortalDropdown value={value} options={options} onChange={onChange} className={className} menuWidth="120px" />;
};

export const PhaseSelect = ({ value, onChange, className }: { value: number, onChange: (val: number) => void, className?: string }) => {
  const options = [
    { val: 1, label: 'Fase 1' },
    { val: 2, label: 'Fase 2' }
  ];
  return <PortalDropdown value={value} options={options} onChange={onChange} className={className} menuWidth="100px" />;
};

export const RankSelect = ({ value, onChange, className }: { value: string, onChange: (val: string) => void, className?: string }) => {
  const options = ['R1', 'R2', 'R3', 'R4', 'R5'].map(o => ({ val: o, label: o }));
  return <PortalDropdown value={value} options={options} onChange={onChange} className={className} menuWidth="80px" />;
};

export const AccountTypeSelect = ({ value, onChange, className }: { value: string, onChange: (val: string) => void, className?: string }) => {
  const options = [
    { val: 'main', label: 'Principal' },
    { val: 'alt', label: 'Secundaria' }
  ];
  return <PortalDropdown value={value} options={options} onChange={onChange} className={className} menuWidth="120px" alignRight />;
};

// Formats number with commas: 146433591 -> 146,433,591
export const formatPower = (num: number) => {
  if (!num) return '';
  return new Intl.NumberFormat('en-US').format(num);
};

export const PowerInput = ({ value, onChange, className }: { value: number, onChange: (val: number) => void, className?: string }) => {
  const [localStr, setLocalStr] = useState(formatPower(value));
  const [isFocused, setIsFocused] = useState(false);

  // Sync when external value changes and not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalStr(formatPower(value));
    }
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseInt(localStr.replace(/,/g, '')) || 0;
    onChange(num);
    setLocalStr(formatPower(num));
  };

  const handleFocus = () => {
    setIsFocused(true);
    setLocalStr(value ? value.toString() : '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // allow only numbers and commas
    const val = e.target.value.replace(/[^0-9,]/g, '');
    setLocalStr(val);
  };

  return (
    <input 
      type="text" 
      value={localStr}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder="0"
      className={className || "w-full bg-transparent border-b border-transparent hover:border-gray-600 focus:border-neon-red focus:bg-black text-gray-300 font-mono text-[10px] sm:text-xs focus:outline-none transition-colors"}
    />
  );
};

