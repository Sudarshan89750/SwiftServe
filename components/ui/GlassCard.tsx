import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`glass-card ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const GlassButton: React.FC<GlassCardProps & { type?: 'button' | 'submit' | 'reset' }> = ({ 
  children, 
  className = '',
  onClick,
  type = 'button'
}) => {
  return (
    <button
      type={type}
      className={`glass-button ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
