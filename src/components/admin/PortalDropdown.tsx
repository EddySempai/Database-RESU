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
        className={className || "w-full border-b border-transparent hover:border-gray-600 focus-within:border-neon-red text-gray-300 font-mono text-[10px] sm:text-xs flex justify-between items-center transition-colors relative"}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              inputRef.current?.blur();
            }
          }}
          onBlur={handleBlurOrEnter}
          className="bg-transparent w-full outline-none px-2 pb-1"
        />
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="px-1" tabIndex={-1}>
          <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180 text-neon-red' : 'text-gray-500'}`} />
        </button>
      </div>

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
          {filteredOptions.length > 0 ? filteredOptions.map(o => (
            <div
              key={o.val}
              onClick={(e) => {
                e.stopPropagation();
                onChange(o.val);
                setInputValue(String(o.label));
                setIsOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer font-mono text-xs hover:bg-blood-red/20 hover:text-neon-red transition-colors ${o.val === value ? 'bg-blood-red/10 text-neon-red border-l-2 border-neon-red' : 'text-gray-300'}`}
            >
              {o.label}
            </div>
          )) : (
            <div className="px-3 py-2 font-mono text-xs text-gray-500 italic">No encontrado</div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};
