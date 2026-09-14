import { useState, useEffect } from 'react';
import { PortalDropdown } from './PortalDropdown';
import { Star, Check } from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';

export const MansionSelect = ({ value, onChange, className, disabled }: { value: number, onChange: (val: number) => void, className?: string, disabled?: boolean }) => {
  const options = [];
  for (let i = 1; i <= 30; i++) {
    options.push({ val: i, label: `${i}` });
  }
  for (let i = 1; i <= 8; i++) {
    options.push({ val: 30 + i, label: `P${i}` });
  }
  return <PortalDropdown value={value} options={options} onChange={onChange} className={className} menuWidth="100px" disabled={disabled} />;
};

// Convert legacy difficulty text to 1-5 number
export const parseNemesisStars = (val: string | number | undefined): number => {
  if (typeof val === 'number') return Math.min(Math.max(val, 1), 5);
  if (!val) return 2; // Default Normal
  const lower = String(val).toLowerCase();
  if (lower.includes('1') || lower.includes('fácil') || lower.includes('facil')) return 1;
  if (lower.includes('2') || lower.includes('normal')) return 2;
  if (lower.includes('3') || lower.includes('difícil') || lower.includes('dificil')) return 3;
  if (lower.includes('4') || lower.includes('pesadilla')) return 4;
  if (lower.includes('5') || lower.includes('infierno')) return 5;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? 2 : Math.min(Math.max(parsed, 1), 5);
};

export const NemesisStarsSelect = ({ 
  value, 
  onChange, 
  className,
  disabled
}: { 
  value: string | number; 
  onChange: (val: string) => void; 
  className?: string; 
  disabled?: boolean;
}) => {
  const currentStars = parseNemesisStars(value);
  const labels = ['', '1★ Fácil', '2★ Normal', '3★ Difícil', '4★ Pesadilla', '5★ Infierno'];

  return (
    <div className={`inline-flex items-center gap-1 dark:bg-slate-900/80 bg-slate-100 border dark:border-slate-800 border-slate-300 px-2.5 py-1 rounded-xl shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className || ''}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= currentStars;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(`${star}★`)}
            className={`transition-transform hover:scale-125 focus:outline-none p-0.5 ${isFilled ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]' : 'dark:text-slate-700 text-slate-300 hover:text-amber-400/60'} ${disabled ? 'hover:scale-100 cursor-not-allowed' : ''}`}
            title={labels[star]}
          >
            <Star size={13} fill={isFilled ? 'currentColor' : 'none'} strokeWidth={isFilled ? 0 : 2} />
          </button>
        );
      })}
      <span className="font-mono text-[10px] dark:text-slate-400 text-slate-600 ml-1 select-none hidden sm:inline">
        {currentStars}★
      </span>
    </div>
  );
};

// Backwards-compatible dropdown
// Backwards-compatible dropdown
export const NemesisSelect = ({ value, onChange, className, disabled }: { value: string, onChange: (val: string) => void, className?: string, disabled?: boolean }) => {
  const options = [
    { val: '1★', label: '1★ (Fácil)' },
    { val: '2★', label: '2★ (Normal)' },
    { val: '3★', label: '3★ (Difícil)' },
    { val: '4★', label: '4★ (Pesadilla)' },
    { val: '5★', label: '5★ (Infierno)' },
  ];
  return <PortalDropdown value={value} options={options} onChange={onChange} className={className} menuWidth="120px" disabled={disabled} />;
};

export const PhaseSelect = ({ value, onChange, className = '', disabled }: { value: number, onChange: (val: number) => void, className?: string, disabled?: boolean }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className={`w-full bg-transparent border-b border-transparent hover:border-slate-500 focus:border-rose-500 dark:text-slate-200 text-slate-800 font-mono text-[10px] sm:text-xs outline-none cursor-pointer ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <option value={1} className="dark:bg-[#141824] dark:text-slate-200">Fase 1</option>
      <option value={2} className="dark:bg-[#141824] dark:text-slate-200">Fase 2</option>
    </select>
  );
};

export const RankSelect = ({ value, onChange, className = '', disabled }: { value: string, onChange: (val: string) => void, className?: string, disabled?: boolean }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full bg-transparent border-b border-transparent hover:border-slate-500 focus:border-rose-500 dark:text-slate-200 text-slate-800 font-mono text-[10px] sm:text-xs outline-none cursor-pointer ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {['R1', 'R2', 'R3', 'R4', 'R5'].map(o => (
        <option key={o} value={o} className="dark:bg-[#141824] dark:text-slate-200">{o}</option>
      ))}
    </select>
  );
};

export const AccountTypeSelect = ({ value, onChange, className = '', disabled }: { value: string, onChange: (val: string) => void, className?: string, disabled?: boolean }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full bg-transparent border-b border-transparent hover:border-slate-500 focus:border-rose-500 dark:text-slate-200 text-slate-800 font-mono text-[10px] sm:text-xs outline-none cursor-pointer ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <option value="main" className="dark:bg-[#141824] dark:text-slate-200">Principal</option>
      <option value="alt" className="dark:bg-[#141824] dark:text-slate-200">Secundaria</option>
    </select>
  );
};

// Formats number with commas: 146433591 -> 146,433,591
export const formatPower = (num: number) => {
  if (!num) return '';
  return new Intl.NumberFormat('en-US').format(num);
};

export const PowerInput = ({ 
  value, 
  onChange, 
  className,
  onEnterPress,
  disabled
}: { 
  value: number; 
  onChange: (val: number) => void; 
  className?: string;
  onEnterPress?: () => void;
  disabled?: boolean;
}) => {
  const [localStr, setLocalStr] = useState(formatPower(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalStr(formatPower(value));
    }
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseInt(localStr.replace(/,/g, ''), 10) || 0;
    onChange(num);
    setLocalStr(formatPower(num));
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsFocused(true);
    setLocalStr(value ? value.toString() : '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const val = e.target.value.replace(/[^0-9,]/g, '');
    setLocalStr(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Enter') {
      const num = parseInt(localStr.replace(/,/g, ''), 10) || 0;
      onChange(num);
      setLocalStr(formatPower(num));
      if (onEnterPress) {
        onEnterPress();
      }
    }
  };

  return (
    <input 
      type="text" 
      disabled={disabled}
      value={localStr}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="0"
      className={`${className || "w-full bg-transparent border-b border-transparent hover:border-slate-500 focus:border-rose-500 focus:bg-rose-500/10 dark:text-slate-200 text-slate-800 font-mono text-[10px] sm:text-xs focus:outline-none transition-colors"} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  );
};

// -------------------------------------------------------------
// MODERN TACTICAL CHECKBOX (Accessible with Enter/Space)
// -------------------------------------------------------------

export const TacticalCheckbox = ({
  checked,
  onChange,
  label,
  title,
  className,
  disabled
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  title?: string;
  className?: string;
  disabled?: boolean;
}) => {
  const { playClick } = useSound();

  const handleToggle = () => {
    if (disabled) return;
    playClick();
    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      title={title}
      className={`inline-flex items-center gap-2 select-none group focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'} ${className || ''}`}
    >
      <div 
        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-150 ${
          checked 
            ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)] group-hover:bg-rose-500/30' 
            : 'dark:bg-slate-900/80 dark:border-slate-700 bg-slate-100 border-slate-300 text-transparent group-hover:border-slate-400'
        } ${!disabled && 'group-focus:ring-2 group-focus:ring-rose-500/40'}`}
      >
        <Check size={12} strokeWidth={3} className={`transition-transform ${checked ? 'scale-100 text-rose-400' : 'scale-0'}`} />
      </div>
      {label && (
        <span className={`font-mono text-xs ${checked ? 'dark:text-white text-slate-900 font-medium' : 'dark:text-slate-400 text-slate-600 group-hover:text-slate-800 dark:group-hover:text-slate-300'}`}>
          {label}
        </span>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// VACUNAS ROLE SELECTOR (Equipo 1/2, Titulares & Suplentes)
// -------------------------------------------------------------

export type VacunasRole = 'none' | 'equipo1' | 'equipo2' | 'suplente';

export const VacunasRoleSelect = ({
  value,
  onChange,
  className = '',
  disabled
}: {
  value: VacunasRole;
  onChange: (role: VacunasRole) => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <select
      value={value || 'none'}
      onChange={(e) => onChange(e.target.value as VacunasRole)}
      disabled={disabled}
      className={`w-full bg-transparent border-b border-transparent hover:border-slate-500 focus:border-rose-500 dark:text-slate-200 text-slate-800 font-mono text-[10px] sm:text-xs outline-none cursor-pointer ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <option value="none" className="dark:bg-[#141824] dark:text-slate-200">Sin Asignar</option>
      <option value="equipo1" className="dark:bg-[#141824] dark:text-slate-200">Equipo 1</option>
      <option value="equipo2" className="dark:bg-[#141824] dark:text-slate-200">Equipo 2</option>
      <option value="suplente" className="dark:bg-[#141824] dark:text-slate-200">Suplente</option>
    </select>
  );
};
