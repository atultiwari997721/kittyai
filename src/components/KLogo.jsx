import React from 'react';

const KLogo = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* 1. Blue Vertical Stem (Left side of K/A) */}
      <path 
        d="M4 2C3.44772 2 3 2.44772 3 3V21C3 21.5523 3.44772 22 4 22H9C9.55228 22 10 21.5523 10 21V12V3C10 2.44772 9.55228 2 9 2H4Z" 
        fill="#4285F4" 
      />
      
      {/* 2. Red Upper Diagonal (Top of K, Apex of A) */}
      <path 
        d="M10 12L16.5 4H21C21.5523 4 22 4.44772 22 5V6C22 6.55228 21.5523 7 21 7L14 14L10 12Z" 
        fill="#EA4335" 
      />

      {/* 3. Yellow Lower Diagonal (Bottom of K, Right leg of A) */}
      <path 
        d="M10.5 12L15 17L18.5 21.5C18.800 21.90000 19.5 22 20 22H21C21.5523 22 22 21.5523 22 21V19C22 18.4477 21.5523 18 21 18L10 12Z" 
        fill="#FBBC05" 
      />

      {/* 4. Green Crossbar (Adjusted: Small & Low) */}
      <rect x="9.5" y="16.5" z="3" width="6" height="2" rx="1" fill="#34A853" />
    </svg>
  );
};

export default KLogo;
