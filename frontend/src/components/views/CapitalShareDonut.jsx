import React, { useState, useMemo } from 'react';
import { PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

/**
 * Curated palette for high-contrast, harmonious neumorphic dark styling.
 */
const DEFAULT_PALETTE = [
  '#3b82f6', // Electric Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

/**
 * Custom Neumorphic Dark Tooltip Component
 * Displays prominent category name, Indian Rupee formatted capital value,
 * and portfolio percentage share.
 */
export function CustomDonutTooltip({ active, payload, totalCapital }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const item = data.payload || {};
  const categoryName = item.name || item.category || data.name || 'Category';
  const value = typeof item.value === 'number' ? item.value : (typeof data.value === 'number' ? data.value : 0);
  const color = item.color || data.fill || data.color || '#3b82f6';

  // Calculate percentage if not already present on payload
  const percentage = item.percentage !== undefined && item.percentage !== null
    ? item.percentage
    : totalCapital > 0
      ? ((value / totalCapital) * 100).toFixed(1)
      : '0.0';

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, #121824)',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: 'var(--shadow-raised-float, 0 12px 28px rgba(0, 0, 0, 0.75), 6px 6px 14px #0a0c12)',
        minWidth: '200px',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none',
        textAlign: 'left',
      }}
    >
      {/* Category Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          paddingBottom: '6px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <span
          style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.86rem',
            color: color || '#f8fafc',
            letterSpacing: '0.01em',
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {categoryName}
        </span>
      </div>

      {/* Metric Breakdown */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.67rem',
              color: 'var(--text-muted, #64748b)',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.04em',
              marginBottom: '2px',
            }}
          >
            Tied Capital
          </div>
          <div
            className="mono"
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#f8fafc',
            }}
          >
            ₹{Number(value).toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '0.67rem',
              color: 'var(--text-muted, #64748b)',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.04em',
              marginBottom: '2px',
            }}
          >
            Share
          </div>
          <span
            className="mono"
            style={{
              display: 'inline-block',
              backgroundColor: `${color}1f`,
              color: color,
              border: `1px solid ${color}40`,
              borderRadius: '4px',
              padding: '2px 7px',
              fontSize: '0.78rem',
              fontWeight: 800,
            }}
          >
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Capital Share Donut Chart Component
 * 
 * Features:
 * - Rich Neumorphic Dark styling matching dashboard theme
 * - Custom Tooltip displaying Category Name, INR Capital Value, and Share %
 * - Direct slice payload data binding (name, category, value, percentage, color)
 * - Interactive hover states syncing center donut labels and legend chips
 * - Color-coded interactive legend beneath donut
 * - Graceful empty state handling for zero/empty category values
 */
export function CapitalShareDonut({
  inventory = [],
  data = null,
  totalCapital: externalTotalCapital = null,
  title = 'Capital Share Donut',
  subtitle = '% Portfolio',
  showLegend = true,
  wrapInCard = true,
  height = 230,
  className = '',
  style = {},
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  // Compute or normalize chart data with explicit slice payload binding
  const { chartData, totalCapital } = useMemo(() => {
    // 1. If explicit pre-calculated data array is passed
    if (data && Array.isArray(data)) {
      const positiveItems = data.filter((item) => typeof item.value === 'number' && item.value > 0);
      const computedTotal = externalTotalCapital ?? positiveItems.reduce((acc, curr) => acc + curr.value, 0);

      const mapped = positiveItems.map((item, idx) => {
        const val = Math.round(item.value);
        const pct = computedTotal > 0 ? ((val / computedTotal) * 100).toFixed(1) : '0.0';
        const color = item.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
        return {
          ...item,
          name: item.name || item.category || `Category ${idx + 1}`,
          category: item.category || item.name || `Category ${idx + 1}`,
          value: val,
          rawValue: item.value,
          percentage: parseFloat(pct),
          percentageStr: `${pct}%`,
          color,
        };
      });

      return { chartData: mapped, totalCapital: computedTotal };
    }

    // 2. If raw inventory array is passed, calculate category aggregation
    if (inventory && Array.isArray(inventory)) {
      const totalBasis = inventory.reduce(
        (acc, curr) => acc + ((Number(curr.cost_price) || 0) * (Number(curr.current_stock) || 0)),
        0
      );

      const categoryMap = inventory.reduce((acc, curr) => {
        const cat = curr.category?.trim() || 'Uncategorized';
        const itemCost = (Number(curr.cost_price) || 0) * (Number(curr.current_stock) || 0);
        acc[cat] = (acc[cat] || 0) + itemCost;
        return acc;
      }, {});

      const mapped = Object.entries(categoryMap)
        .filter(([_, val]) => typeof val === 'number' && val > 0 && !isNaN(val))
        .sort((a, b) => b[1] - a[1]) // Sort largest share first
        .map(([name, val], idx) => {
          const roundedVal = Math.round(val);
          const pct = totalBasis > 0 ? ((roundedVal / totalBasis) * 100).toFixed(1) : '0.0';
          return {
            name,
            category: name,
            value: roundedVal,
            rawValue: val,
            percentage: parseFloat(pct),
            percentageStr: `${pct}%`,
            color: DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
          };
        });

      return { chartData: mapped, totalCapital: totalBasis };
    }

    return { chartData: [], totalCapital: 0 };
  }, [inventory, data, externalTotalCapital]);

  const isEmpty = chartData.length === 0 || totalCapital <= 0;

  // Active slice data when hovered
  const hoveredSlice = activeIndex !== null && chartData[activeIndex] ? chartData[activeIndex] : null;

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', ...style }} className={className}>
      {isEmpty ? (
        /* Empty State */
        <div
          style={{
            height: `${height}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            color: 'var(--text-muted, #64748b)',
            textAlign: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-sunken, #0f131c)',
              boxShadow: 'var(--shadow-sunken-sm, inset 2px 2px 5px #0a0c12, inset -2px -2px 5px #242c3f)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted, #64748b)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <PieIcon size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '3px' }}>
              No Capital Allocation Data
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted, #64748b)', maxWidth: '240px', lineHeight: 1.4 }}>
              Active inventory items with positive stock and cost price are required to compute category capital share.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Donut Visual Container */}
          <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={chartData.length > 1 ? 4 : 0}
                  dataKey="value"
                  nameKey="name"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  isAnimationActive={true}
                  animationDuration={700}
                >
                  {chartData.map((entry, index) => {
                    const isHovered = activeIndex === index;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="var(--bg-card, #121824)"
                        strokeWidth={isHovered ? 3 : 2}
                        style={{
                          filter: isHovered ? `drop-shadow(0 0 8px ${entry.color}90)` : 'none',
                          opacity: activeIndex !== null && !isHovered ? 0.6 : 1,
                          transition: 'opacity 0.2s ease, filter 0.2s ease',
                          cursor: 'pointer',
                        }}
                      />
                    );
                  })}
                </Pie>
                <Tooltip
                  content={(props) => <CustomDonutTooltip {...props} totalCapital={totalCapital} />}
                  wrapperStyle={{ outline: 'none', zIndex: 1000 }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Dynamic Center Label */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                textAlign: 'center',
                maxWidth: '92px',
                width: '100%',
              }}
            >
              <span
                style={{
                  fontSize: '0.64rem',
                  color: hoveredSlice ? hoveredSlice.color : 'var(--text-muted, #64748b)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  transition: 'color 0.2s ease',
                }}
                title={hoveredSlice ? hoveredSlice.name : 'CATEGORIES'}
              >
                {hoveredSlice ? hoveredSlice.name : 'CATEGORIES'}
              </span>
              <span
                className="mono"
                style={{
                  fontSize: hoveredSlice ? '1.05rem' : '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-primary, #f8fafc)',
                  lineHeight: 1.15,
                  marginTop: '2px',
                  transition: 'font-size 0.2s ease',
                }}
              >
                {hoveredSlice ? `${hoveredSlice.percentage}%` : chartData.length}
              </span>
              {hoveredSlice && (
                <span
                  className="mono"
                  style={{
                    fontSize: '0.66rem',
                    color: 'var(--text-secondary, #94a3b8)',
                    fontWeight: 600,
                    marginTop: '2px',
                  }}
                >
                  ₹{hoveredSlice.value.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Color-Coded Category Legend Beneath Donut */}
          {showLegend && chartData.length > 0 && (
            <div
              style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.45rem',
                maxHeight: '120px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                paddingRight: '2px',
              }}
            >
              {chartData.map((item, index) => {
                const isHovered = activeIndex === index;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: isHovered
                        ? 'var(--bg-card-hover, #22293c)'
                        : 'var(--bg-sunken, #0f131c)',
                      border: isHovered
                        ? `1px solid ${item.color}`
                        : '1px solid rgba(255, 255, 255, 0.05)',
                      boxShadow: isHovered
                        ? `0 0 10px ${item.color}35`
                        : 'var(--shadow-sunken-sm, inset 2px 2px 5px #0a0c12)',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      textAlign: 'left',
                    }}
                    title={`${item.name}: ₹${item.value.toLocaleString('en-IN')} (${item.percentage}%)`}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: item.color,
                        boxShadow: `0 0 6px ${item.color}`,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: isHovered ? 700 : 600,
                        color: isHovered ? '#f8fafc' : 'var(--text-secondary, #94a3b8)',
                        maxWidth: '110px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: isHovered ? item.color : 'var(--text-muted, #64748b)',
                      }}
                    >
                      {item.percentage}%
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );

  if (!wrapInCard) {
    return content;
  }

  return (
    <Card variant="raised">
      <CardHeader>
        <CardTitle icon={PieIcon}>{title}</CardTitle>
        <Badge variant="sunken" size="sm">
          {subtitle}
        </Badge>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

export default CapitalShareDonut;
