import React from 'react';

interface ArivomLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

const ArivomLogo: React.FC<ArivomLogoProps> = ({ 
  size = 'md', 
  variant = 'full',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Circle */}
          <circle cx="24" cy="24" r="22" fill="#0077B6" stroke="#0077B6" strokeWidth="2"/>
          
          {/* Letter A */}
          <path 
            d="M24 8L32 36H28L26 28H22L20 36H16L24 8Z" 
            fill="white"
          />
          <path 
            d="M24 12L20 26H28L24 12Z" 
            fill="#FFB703"
          />
          
          {/* Book/Pages */}
          <rect x="18" y="38" width="12" height="2" rx="1" fill="#00CC99"/>
          <rect x="18" y="42" width="8" height="2" rx="1" fill="#00CC99"/>
          
          <defs></defs>
        </svg>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`font-bold ${textSizes[size]} ${className}`}>
        <span className="text-cyber-grape">Arivom</span>
      </div>
    );
  }

  // Full logo with icon and text
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={sizeClasses[size]}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Circle */}
          <circle cx="24" cy="24" r="22" fill="#0077B6" stroke="#0077B6" strokeWidth="2"/>
          
          {/* Letter A */}
          <path 
            d="M24 8L32 36H28L26 28H22L20 36H16L24 8Z" 
            fill="white"
          />
          <path 
            d="M24 12L20 26H28L24 12Z" 
            fill="#FFB703"
          />
          
          {/* Book/Pages */}
          <rect x="18" y="38" width="12" height="2" rx="1" fill="#00CC99"/>
          <rect x="18" y="42" width="8" height="2" rx="1" fill="#00CC99"/>
          
          <defs></defs>
        </svg>
      </div>
      <div className={`font-bold ${textSizes[size]} text-dark-gunmetal`}>
        Arivom
      </div>
    </div>
  );
};

export default ArivomLogo;
