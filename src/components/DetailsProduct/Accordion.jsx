import React, { useRef, useEffect } from 'react';

function Accordion({ title, children, isOpen, onToggle }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.maxHeight = isOpen
        ? `${contentRef.current.scrollHeight}px`
        : '0px';
    }
  }, [isOpen]);

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className={`flex justify-between items-center w-full px-5 py-3 text-left text-gray-800 text-lg leading-tight font-medium bg-white border-b border-gray-300 focus:outline-none focus:border-gray-500 transition duration-300 ease-in-out ${
          isOpen ? 'rounded-t-md' : 'rounded-md'
        }`}
      >
        {title}
        <span
          className={`${
            isOpen ? 'transform rotate-180' : ''
          } inline-block text-gray-600 transition-transform duration-300 ease-in-out`}
        >
          <svg
            className="w-4 h-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 
              1 0 111.414 1.414l-4 
              4a1 1 0 
              01-1.414 0l-4-4a1 1 0 
              010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-max-height duration-500 ease-in-out bg-gray-100 text-sm text-gray-700"
        style={{ maxHeight: 0 }}
      >
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default Accordion;
