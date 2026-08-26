import { useState, useEffect } from 'react';
import { PortalDropdown } from './PortalDropdown';

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

