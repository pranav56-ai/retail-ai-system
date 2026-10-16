import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend, // number (e.g. +12.5 or -4.2)
  trendLabel = 'vs last cycle',
  variant = 'default', // 'default' | 'emerald' | 'amber' | 'rose' | 'blue'
  action,
  className = '',
  style = {},
}) {
  const getIconColor = () => {
    switch (variant) {
      case 'emerald': return '#10b981';
      case 'amber': return '#f59e0b';
      case 'rose': return '#f43f5e';
      case 'blue': return '#3b82f6';
      default: return 'var(--primary)';
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case 'emerald': return 'rgba(16, 185, 129, 0.12)';
      case 'amber': return 'rgba(245, 158, 11, 0.12)';
      case 'rose': return 'rgba(244, 63, 94, 0.12)';
      case 'blue': return 'rgba(59, 130, 246, 0.12)';
      default: return 'var(--bg-sunken)';
    }
  };

  const isPositive = typeof trend === 'number' ? trend >= 0 : undefined;

  return (
    <Card
      variant="raised"
      style={{
        padding: '1.15rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        ...style,
      }}
      className={`neu-stat-card ${className}`}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {title}
          </span>
          {Icon && (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: getIconBg(),
                boxShadow: 'var(--shadow-sunken-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getIconColor(),
              }}
            >
              <Icon size={16} />
            </div>
          )}
        </div>

        <div
          className="mono"
          style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            margin: '2px 0 6px',
          }}
        >
          {value}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.74rem' }}>
        {subtitle && (
          <span style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </span>
        )}

        {trend !== undefined && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              color: isPositive ? '#34d399' : '#fda4af',
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          >
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}

        {action && (
          <div>{action}</div>
        )}
      </div>
    </Card>
  );
}
