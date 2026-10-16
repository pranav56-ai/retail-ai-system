import React from 'react';

export function Card({ 
  children, 
  variant = 'raised', // 'raised' | 'sunken' | 'flat' | 'raised-sm' | 'raised-lg'
  className = '', 
  style = {}, 
  ...props 
}) {
  const getShadowStyle = () => {
    switch (variant) {
      case 'sunken':
        return {
          backgroundColor: 'var(--bg-sunken)',
          boxShadow: 'var(--shadow-sunken)',
          border: 'var(--border-subtle)',
        };
      case 'raised-sm':
        return {
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-raised-sm)',
          border: 'var(--border-subtle)',
        };
      case 'raised-lg':
        return {
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-raised-lg)',
          border: 'var(--border-subtle)',
        };
      case 'flat':
        return {
          backgroundColor: 'var(--bg-card)',
          border: 'var(--border-subtle)',
        };
      case 'raised':
      default:
        return {
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-raised)',
          border: 'var(--border-subtle)',
        };
    }
  };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        position: 'relative',
        transition: 'box-shadow var(--transition-normal), transform var(--transition-normal)',
        ...getShadowStyle(),
        ...style,
      }}
      className={`neu-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', style = {}, ...props }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        ...style,
      }}
      className={`neu-card-header ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, icon: Icon, className = '', style = {}, ...props }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.015em',
        ...style,
      }}
      className={`neu-card-title ${className}`}
      {...props}
    >
      {Icon && <Icon size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
      <span>{children}</span>
    </div>
  );
}

export function CardDescription({ children, className = '', style = {}, ...props }) {
  return (
    <p
      style={{
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        marginTop: '0.2rem',
        lineHeight: 1.4,
        ...style,
      }}
      className={`neu-card-description ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', style = {}, ...props }) {
  return (
    <div
      style={{
        ...style,
      }}
      className={`neu-card-content ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', style = {}, ...props }) {
  return (
    <div
      style={{
        marginTop: '1rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...style,
      }}
      className={`neu-card-footer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
