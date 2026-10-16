import React from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({
  theme = 'dark',
  onToggle,
  variant = 'button', // 'button' | 'switch' | 'pill'
  className = '',
  style = {},
}) {
  const isDark = theme === 'dark';

  if (variant === 'switch') {
    return (
      <div
        onClick={onToggle}
        title={isDark ? 'Switch to Light Neumorphism' : 'Switch to Dark Neumorphism'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '4px 8px',
          backgroundColor: 'var(--bg-sunken)',
          boxShadow: 'var(--shadow-sunken-sm)',
          borderRadius: 'var(--radius-full)',
          cursor: 'pointer',
          userSelect: 'none',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'all var(--transition-fast)',
          ...style,
        }}
        className={`neu-theme-switch ${className}`}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isDark ? 'var(--bg-card-raised)' : 'transparent',
            boxShadow: isDark ? 'var(--shadow-raised-xs)' : 'none',
            color: isDark ? '#38bdf8' : 'var(--text-muted)',
            fontSize: '0.74rem',
            fontWeight: 700,
            transition: 'all var(--transition-fast)',
          }}
        >
          <Moon size={13} />
          <span>Dark</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: !isDark ? 'var(--bg-card-raised)' : 'transparent',
            boxShadow: !isDark ? 'var(--shadow-raised-xs)' : 'none',
            color: !isDark ? '#f59e0b' : 'var(--text-muted)',
            fontSize: '0.74rem',
            fontWeight: 700,
            transition: 'all var(--transition-fast)',
          }}
        >
          <Sun size={13} />
          <span>Light</span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      title={isDark ? 'Switch to Light Neumorphism' : 'Switch to Dark Neumorphism'}
      style={{
        width: '36px',
        height: '36px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--bg-card)',
        boxShadow: 'var(--shadow-raised-sm)',
        border: 'var(--border-subtle)',
        color: isDark ? '#38bdf8' : '#f59e0b',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        outline: 'none',
        ...style,
      }}
      className={`neu-theme-toggle neu-interactive ${className}`}
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
