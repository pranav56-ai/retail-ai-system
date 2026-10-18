import React, { useState } from 'react';
import { 
  PieChart as PieIcon, BarChart3, TrendingUp, AlertCircle, 
  Layers, DollarSign, ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TooltipText } from '../ui/Tooltip';
import { CapitalShareDonut } from './CapitalShareDonut';

export function CapitalAllocationView({ inventory, insights }) {
  const [marginFilter, setMarginFilter] = useState('All'); // 'All' | 'High' | 'Low'

  const totalCostBasis = inventory.reduce((acc, curr) => acc + (curr.cost_price * curr.current_stock), 0);
  const totalRetailPotential = inventory.reduce((acc, curr) => acc + (curr.selling_price * curr.current_stock), 0);
  const potentialGrossProfit = totalRetailPotential - totalCostBasis;
  const overallMargin = totalRetailPotential > 0 ? ((potentialGrossProfit / totalRetailPotential) * 100).toFixed(1) : 0;

  // Category Aggregate
  const categoryMap = inventory.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + (curr.cost_price * curr.current_stock);
    return acc;
  }, {});

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e', '#ec4899', '#6366f1'];

  const categoryChartData = Object.entries(categoryMap)
    .filter(([_, val]) => typeof val === 'number' && val > 0 && !isNaN(val))
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], idx) => {
      const roundedVal = Math.round(value);
      const percentage = totalCostBasis > 0 ? ((roundedVal / totalCostBasis) * 100).toFixed(1) : '0.0';
      return {
        name,
        category: name,
        value: roundedVal,
        rawValue: value,
        percentage: parseFloat(percentage),
        percentageStr: `${percentage}%`,
        color: chartColors[idx % chartColors.length],
      };
    });

  const deadStock = insights?.dead_stock || [];

  const filteredItems = inventory.filter((item) => {
    const margin = ((item.selling_price - item.cost_price) / item.selling_price) * 100;
    if (marginFilter === 'High') return margin >= 25;
    if (marginFilter === 'Low') return margin < 25;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top 3 KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <Card variant="raised" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            Wholesale Capital Tied
          </span>
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', margin: '4px 0 2px' }}>
            ₹{totalCostBasis.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Total acquisition cost across {inventory.length} SKUs
          </div>
        </Card>

        <Card variant="raised" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            Retail Inventory Value
          </span>
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', margin: '4px 0 2px' }}>
            ₹{totalRetailPotential.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Projected revenue at 100% catalog sell-through
          </div>
        </Card>

        <Card variant="raised" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            Portfolio Gross Margin
          </span>
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a78bfa', margin: '4px 0 2px' }}>
            {overallMargin}%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            ₹{potentialGrossProfit.toLocaleString()} gross profit potential
          </div>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
        {/* Category Holding Distribution Bar */}
        <Card variant="raised">
          <CardHeader>
            <CardTitle icon={BarChart3}>Category Holding Distribution</CardTitle>
            <Badge variant="sunken" size="sm">
              Capital Concentration
            </Badge>
          </CardHeader>
          <CardContent>
            <div style={{ height: '230px', width: '100%', marginTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }} 
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }} 
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-surface)', 
                      borderRadius: '10px', 
                      boxShadow: 'var(--shadow-raised-sm)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text-primary)',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`₹${val.toLocaleString()}`, 'Capital']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Allocation Visual */}
        <CapitalShareDonut
          data={categoryChartData}
          totalCapital={totalCostBasis}
        />
      </div>

      {/* SKU Margin Breakdown Deck */}
      <Card variant="raised">
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CardTitle icon={DollarSign}>Unit Margin Analysis Grid</CardTitle>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['All', 'High', 'Low'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setMarginFilter(filter)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: marginFilter === filter ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                    backgroundColor: marginFilter === filter ? 'var(--bg-sunken)' : 'transparent',
                    color: marginFilter === filter ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  {filter} Margin
                </button>
              ))}
            </div>
          </div>
          <CardDescription>
            Cost vs selling spread with markup return percentages for active SKUs.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '0.85rem',
            }}
          >
            {filteredItems.map((item) => {
              const margin = ((item.selling_price - item.cost_price) / item.selling_price * 100).toFixed(1);
              const isHigh = parseFloat(margin) >= 25;
              const unitSpread = item.selling_price - item.cost_price;

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--bg-sunken)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-sunken-sm)',
                    padding: '0.95rem',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minWidth: 0,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <TooltipText
                          text={item.name}
                          badge={item.category}
                          subtext={`Cost: ₹${item.cost_price} | Sell: ₹${item.selling_price} | Stock: ${item.current_stock}`}
                          textStyle={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}
                        />
                      </div>
                      <Badge variant={isHigh ? 'success' : 'warning'} size="sm" className="mono" style={{ flexShrink: 0 }}>
                        {margin}%
                      </Badge>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 8px' }}>
                      {item.category} • {item.current_stock} in stock
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.76rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <span className="mono" style={{ color: 'var(--text-muted)' }}>
                      ₹{item.cost_price} → ₹{item.selling_price}
                    </span>
                    <span className="mono" style={{ color: '#34d399', fontWeight: 700 }}>
                      +₹{unitSpread.toFixed(2)} / unit
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { CapitalShareDonut };
