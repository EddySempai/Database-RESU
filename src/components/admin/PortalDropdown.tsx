import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { AdminModal, type AdminModalType } from './AdminModal'; // We can use it!

export const PortalDropdown = ({ 
  value, 
  options, 
  onChange, 
  className,
  menuWidth,
  alignRight,
  disabled,
  searchable = true
}: { 
  value: any, 
  options: {val: any, label: string}[], 
  onChange: (val: any) => void, 
  className?: string,
  menuWidth?: string,
  alignRight?: boolean,
  disabled?: boolean,
  searchable?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [inputValue, setInputValue] = useState('');
  
  const [modal, setModal] = useState<{isOpen: boolean, type: AdminModalType, title: string, message: string}>({isOpen: false, type: 'error', title: '', message: ''});
  const closeModal = () => setModal(prev => ({...prev, isOpen: false}));

  // Sync external value to local input value
  useEffect(() => {
    const selectedLabel = options.find(o => o.val === value)?.label || value;
    setInputValue(selectedLabel ? String(selectedLabel) : '');
  }, [value, options]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: alignRight ? rect.right + window.scrollX : rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen, alignRight]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setTimeout(() => setIsOpen(false), 150);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredOptions = options.filter(o => 
    String(o.label).toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleBlurOrEnter = () => {
    // Exact match check (case-insensitive)
    const exactMatch = options.find(o => String(o.label).toLowerCase() === inputValue.toLowerCase().trim());
    if (exactMatch) {
      onChange(exactMatch.val);
      setInputValue(String(exactMatch.label));
      setIsOpen(false);
    } else {
      // Revert to old value
      const oldLabel = options.find(o => o.val === value)?.label || value;
      setInputValue(oldLabel ? String(oldLabel) : '');
      setIsOpen(false);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Valor Inválido',
        message: 'Por favor, selecciona o escribe un valor que exista en la lista.'
      });
    }
  };

  return (
    <>
      <AdminModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onConfirm={closeModal} onClose={closeModal} />
      <div
        ref={containerRef}
        className={`${className || "w-full border-b border-transparent hover:border-slate-500 focus-within:border-rose-500 dark:text-slate-200 text-slate-800 font-mono text-[10px] sm:text-xs flex justify-between items-center transition-colors relative"} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          readOnly={!searchable}
          value={inputValue}
          onChange={(e) => {
            if (disabled || !searchable) return;
            setInputValue(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled && searchable) setIsOpen(true);
          }}
          onClick={() => {
            if (!disabled && !searchable) setIsOpen(!isOpen);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              inputRef.current?.blur();
            }
          }}
          onBlur={handleBlurOrEnter}
          className={`bg-transparent w-full outline-none px-2 pb-1 ${disabled ? 'cursor-not-allowed' : ''} ${!searchable && !disabled ? 'cursor-pointer' : ''}`}
        />
        <button 
          type="button" 
          disabled={disabled}
          onClick={() => {
            if (!disabled) setIsOpen(!isOpen);
          }} 
          className="px-1 disabled:opacity-40" 
          tabIndex={-1}
        >
          <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180 text-rose-500' : 'text-slate-400'}`} />
        </button>
      </div>

      {isOpen && createPortal(
        <div 
          className="absolute z-[9999] rounded-xl border shadow-xl max-h-48 overflow-y-auto custom-scrollbar dark:bg-[#121623] dark:border-slate-800 bg-white border-slate-200 py-1"
          style={{ 
            top: coords.top, 
            left: alignRight ? `calc(${coords.left}px - ${menuWidth || '100px'})` : coords.left, 
            width: menuWidth || Math.max(coords.width, 100)
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault(); // Prevents input from losing focus before onClick fires
          }}
        >
          {filteredOptions.length > 0 ? filteredOptions.map(o => (
            <div
              key={o.val}
              onClick={(e) => {
                e.stopPropagation();
                onChange(o.val);
                setInputValue(String(o.label));
                setIsOpen(false);
              }}
              className={`px-3 py-1.5 cursor-pointer font-mono text-xs transition-colors ${
                o.val === value 
                  ? 'dark:bg-rose-500/20 dark:text-rose-300 bg-rose-50 text-rose-600 font-semibold border-l-2 border-rose-500' 
                  : 'dark:text-slate-300 text-slate-700 dark:hover:bg-slate-800/60 hover:bg-slate-100 hover:text-rose-500'
              }`}
            >
              {o.label}
            </div>
          )) : (
            <div className="px-3 py-2 font-mono text-xs text-slate-400 italic">No encontrado</div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};
