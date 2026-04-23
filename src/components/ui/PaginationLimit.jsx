import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FaCheck, FaChevronDown } from 'react-icons/fa';

const PaginationLimit = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const options = [10, 25, 50, 100];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
        zIndex: 99999,
        minWidth: rect.width,
      });
    }
    setIsOpen(prev => !prev);
  };

  const menu = isOpen ? ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      style={menuStyle}
      className="w-32 bg-[#0a0f1e] border border-brand-gold/20 rounded-xl shadow-2xl overflow-hidden"
    >
      <div className="py-1">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => {
              onChange(option);
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-brand-gold/10 ${
              value === option ? 'text-brand-gold' : 'text-gray-300'
            }`}
          >
            {option}
            {value === option && <FaCheck className="text-brand-gold text-xs" />}
          </button>
        ))}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="flex items-center gap-3 bg-[#020817]/50 border border-brand-gold/20 px-4 py-2 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(214,162,16,0.1)] transition-all hover:border-brand-gold/40">
      <span className="text-gray-400 font-semibold text-xs uppercase tracking-wider">Rows per page</span>

      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className="flex items-center gap-2 w-[70px] bg-brand-gold/10 border border-brand-gold/30 rounded-lg pl-3 pr-2 py-1.5 text-brand-gold font-bold text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold/50 cursor-pointer transition-colors"
        >
          {value}
          <FaChevronDown className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {menu}
      </div>
    </div>
  );
};

export default PaginationLimit;
