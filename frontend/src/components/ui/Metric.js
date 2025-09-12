import React from 'react';

function Metric({ label, value, icon, accent = 'none', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {accent === 'primary' && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-gradient rounded-t-2xl"></div>
      )}
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted">{label}</p>
          {icon && (
            <div className="text-primary">
              {icon}
            </div>
          )}
        </div>
        
        <div className="text-2xl font-bold text-text">
          {value}
        </div>
      </div>
    </div>
  );
}

export default Metric;
