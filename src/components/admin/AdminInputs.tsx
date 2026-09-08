import { useState, useEffect } from 'react';
import { PortalDropdown } from './PortalDropdown';
import { Star, Check } from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';

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
  className 
}: { 
  value: string | number; 
  onChange: (val: string) => void; 
  className?: string; 
}) => {
  const currentStars = parseNemesisStars(value);
  const labels = ['', '1★ Fácil', '2★ Normal', '3★ Difícil', '4★ Pesadilla', '5★ Infierno'];

  return (
    <div className={`inline-flex items-center gap-1 bg-black/60 border border-gray-800 px-2 py-1 rounded-sm ${className || ''}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= currentStars;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(`${star}★`)}
            className={`transition-transform hover:scale-125 focus:outline-none p-0.5 ${isFilled ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]' : 'text-gray-700 hover:text-gray-500'}`}
            title={labels[star]}
          >
            <Star size={13} fill={isFilled ? 'currentColor' : 'none'} strokeWidth={isFilled ? 0 : 2} />
          </button>
        );
      })}
      <span className="font-mono text-[10px] text-gray-400 ml-1 select-none hidden sm:inline">
        {currentStars}★
      </span>
    </div>
  );
};

// Backwards-compatible dropdown
export const NemesisSelect = ({ value, onChange, className }: { value: string, onChange: (val: string) => void, className?: string }) => {
  const options = [
    { val: '1★', label: '1★ (Fácil)' },
    { val: '2★', label: '2★ (Normal)' },
    { val: '3★', label: '3★ (Difícil)' },
    { val: '4★', label: '4★ (Pesadilla)' },
    { val: '5★', label: '5★ (Infierno)' },
  ];
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

export const PowerInput = ({ 
  value, 
  onChange, 
  className,
  onEnterPress
}: { 
  value: number; 
  onChange: (val: number) => void; 
  className?: string;
  onEnterPress?: () => void;
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
    setIsFocused(true);
    setLocalStr(value ? value.toString() : '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9,]/g, '');
    setLocalStr(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      value={localStr}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="0"
      className={className || "w-full bg-transparent border-b border-transparent hover:border-gray-600 focus:border-neon-red focus:bg-black text-gray-300 font-mono text-[10px] sm:text-xs focus:outline-none transition-colors"}
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
  className
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  title?: string;
  className?: string;
}) => {
  const { playClick } = useSound();

  const handleToggle = () => {
    playClick();
    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      title={title}
      className={`inline-flex items-center gap-2 cursor-pointer select-none group focus:outline-none ${className || ''}`}
    >
      <div 
        className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all duration-150 ${
          checked 
            ? 'bg-blood-red/30 border-neon-red text-neon-red shadow-[0_0_8px_rgba(255,42,42,0.4)] group-hover:bg-blood-red/50' 
            : 'bg-black/60 border-gray-700 text-transparent group-hover:border-gray-500'
        } group-focus:ring-1 group-focus:ring-neon-red`}
      >
        <Check size={12} strokeWidth={3} className={`transition-transform ${checked ? 'scale-100 text-neon-red' : 'scale-0'}`} />
      </div>
      {label && (
        <span className={`font-mono text-xs ${checked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>
          {label}
        </span>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// VACUNAS ROLE SELECTOR (Equipo 1/2, Titulares & Suplentes)
// -------------------------------------------------------------

export type VacunasRole = 'none' | 'team1_titular' | 'team1_suplente' | 'team2_titular' | 'team2_suplente';

export const VacunasRoleSelect = ({
  value,
  onChange,
  className
}: {
  value: VacunasRole;
  onChange: (role: VacunasRole) => void;
  className?: string;
}) => {
  const options: { val: VacunasRole; label: string }[] = [
    { val: 'none', label: 'Sin Asignar' },
    { val: 'team1_titular', label: 'Eq. 1 - Titular' },
    { val: 'team1_suplente', label: 'Eq. 1 - Suplente' },
    { val: 'team2_titular', label: 'Eq. 2 - Titular' },
    { val: 'team2_suplente', label: 'Eq. 2 - Suplente' },
  ];

  return (
    <PortalDropdown
      value={value || 'none'}
      options={options}
      onChange={(v) => onChange(v as VacunasRole)}
      className={className}
      menuWidth="150px"
    />
  );
};
