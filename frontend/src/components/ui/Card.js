import React from 'react';

function Card({ title, subtitle, footer, className = '', children, ...props }) {
  return (
    <div 
      className={`bg-surface text-text rounded-2xl shadow-soft border border-[#242a35] ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="p-6 pb-4">
          {title && (
            <h3 className="text-lg font-bold text-text mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className={title || subtitle ? 'px-6 pb-6' : 'p-6'}>
        {children}
      </div>
      
      {footer && (
        <div className="px-6 pt-4 pb-6 border-t border-[#242a35]">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
