// Chart theme configuration for Recharts
export const chartTheme = {
  // Colors
  primary: '#E53935',
  primary600: '#C62828',
  surface: '#161a20',
  surface2: '#1F2430',
  text: '#EAECEF',
  muted: '#9AA4AF',
  
  // Chart specific colors
  colors: {
    primary: '#E53935',
    primaryLight: '#FF6A00',
    background: '#161a20',
    text: '#EAECEF',
    muted: '#9AA4AF',
    grid: '#242a35'
  },
  
  // Recharts theme object
  recharts: {
    backgroundColor: '#161a20',
    textColor: '#EAECEF',
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
    
    // Tooltip styling
    tooltip: {
      backgroundColor: '#1F2430',
      border: '1px solid #242a35',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      color: '#EAECEF'
    },
    
    // Legend styling
    legend: {
      color: '#EAECEF',
      fontSize: 12
    },
    
    // Grid styling
    grid: {
      stroke: '#242a35',
      strokeWidth: 1
    },
    
    // Axis styling
    axis: {
      stroke: '#9AA4AF',
      fontSize: 11,
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  }
};

export default chartTheme;
