import React, { useState } from 'react';
import { 
  Sliders, TrendingUp, BarChart3, ArrowRight, 
  Sparkles, CheckCircle2, AlertTriangle, Activity 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Slider } from '../ui/Slider';
import { Badge } from '../ui/Badge';
import api from '../../api';

export function PriceElasticityView({ inventory }) {
  const [selectedProductId, setSelectedProductId] = useState(inventory[0]?.id || '');
  const [discountPct, setDiscountPct] = useState(12);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedProduct = inventory.find(p => String(p.id) === String(selectedProductId)) || inventory[0];

  const handleSimulate = async () => {
    if (!selectedProductId && inventory.length > 0) return;
    setLoading(true);
    try {
      const res = await api.post('/analytics/simulate-pricing', {
        product_id: parseInt(selectedProductId || inventory[0].id, 10),
        discount_pct: parseFloat(discountPct),
      });
      setSimResult(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Simulation execution failed.');
    } finally {
      setLoading(false);
    }
  };

  // Generate curve data points for Recharts across 0% to 35% discount
  const curveData = React.useMemo(() => {
    if (!selectedProduct) return [];
    const basePrice = selectedProduct.selling_price;
    const cost = selectedProduct.cost_price;
    const baseUnits = Math.max(Math.round(selectedProduct.current_stock * 0.4), 15);
    const elasticity = -1.5;

    const points = [];
    for (let d = 0; d <= 35; d += 5) {
      const discDec = d / 100;
      const price = basePrice * (1 - discDec);
      const qtyChange = elasticity * (-discDec);
      const units = Math.max(Math.round(baseUnits * (1 + qtyChange)), 1);
      const rev = Math.round(units * price);
      const profit = Math.round(units * (price - cost));
      points.push({
        discount: `${d}%`,
        discountNum: d,
        price: price.toFixed(1),
        revenue: rev,
        profit: profit,
      });
    }
    return points;
  }, [selectedProduct]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
      
      {/* Left Setup Card */}
      <Card variant="raised">
        <CardHeader>
          <CardTitle icon={Sliders}>Elasticity Parameters</CardTitle>
          <CardDescription>
            Calibrate retail discounting against FMCG demand responsiveness.
          </CardDescription>
        </CardHeader>

        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Select
            label="Target Catalog SKU"
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              setSimResult(null);
            }}
          >
            {inventory.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (₹{p.selling_price} retail | ₹{p.cost_price} cost)
              </option>
            ))}
          </Select>

          {selectedProduct && (
            <div
              style={{
                backgroundColor: 'var(--bg-sunken)',
                boxShadow: 'var(--shadow-sunken-sm)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                fontSize: '0.78rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Retail Price:</span>
                <strong className="mono" style={{ color: 'var(--text-primary)' }}>₹{selectedProduct.selling_price.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Unit Cost Basis:</span>
                <strong className="mono" style={{ color: 'var(--text-primary)' }}>₹{selectedProduct.cost_price.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Unit Margin:</span>
                <strong className="mono" style={{ color: '#34d399' }}>
                  {(((selectedProduct.selling_price - selectedProduct.cost_price) / selectedProduct.selling_price) * 100).toFixed(1)}%
                </strong>
              </div>
            </div>
          )}

          <Slider
            label="Simulated Discount %"
            min={2}
            max={40}
            step={1}
            value={discountPct}
            onChange={setDiscountPct}
            valueSuffix="%"
            helperText="Standard grocery elasticity coefficient: E_d = -1.5"
          />

          <Button
            variant="primary"
            size="lg"
            icon={TrendingUp}
            loading={loading}
            fullWidth
            onClick={handleSimulate}
          >
            {loading ? 'Modeling Curve...' : 'Forecast Volume & Profit'}
          </Button>
        </CardContent>
      </Card>

      {/* Right Projected Impact Model */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card variant="raised">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CardTitle icon={BarChart3}>Projected Elasticity Curve</CardTitle>
              <Badge variant="info" size="sm">
                Volume-Profit Frontier
              </Badge>
            </div>
            <CardDescription>
              Modeled response across discounting tiers (0% to 35%).
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div style={{ height: '220px', width: '100%', marginTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="discount" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-raised-sm)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                    formatter={(val, name) => [`₹${val.toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Net Profit']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#revGrad)" name="revenue" strokeWidth={2} />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#profitGrad)" name="profit" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Output Card */}
        <Card variant="raised">
          <CardHeader>
            <CardTitle icon={Activity}>Simulation Decision Output</CardTitle>
            {simResult && (
              <Badge variant={simResult.profit_delta >= 0 ? 'success' : 'destructive'} size="sm">
                {simResult.profit_delta >= 0 ? 'Profit Accretive' : 'Margin Dilutive'}
              </Badge>
            )}
          </CardHeader>

          <CardContent>
            {simResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '0.85rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      TESTED SKU
                    </span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {simResult.product_name}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      NEW SHELF PRICE
                    </span>
                    <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{Number(simResult.new_price).toFixed(2)}{' '}
                      <span style={{ fontSize: '0.78rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                        ₹{Number(simResult.current_price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-sunken)',
                      boxShadow: 'var(--shadow-sunken-sm)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      EST. MONTHLY RUN-RATE
                    </span>
                    <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0' }}>
                      {simResult.baseline_units} → {simResult.projected_units}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
                      +{simResult.units_delta_pct}% demand surge
                    </span>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'var(--bg-sunken)',
                      boxShadow: 'var(--shadow-sunken-sm)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      GROSS REVENUE
                    </span>
                    <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0' }}>
                      ₹{Number(simResult.projected_revenue).toFixed(0)}
                    </div>
                    <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Base: ₹{Number(simResult.baseline_revenue).toFixed(0)}
                    </span>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'var(--bg-sunken)',
                      boxShadow: 'var(--shadow-sunken-sm)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem',
                      border: simResult.profit_delta >= 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
                    }}
                  >
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      NET PROFIT DELTA
                    </span>
                    <div
                      className="mono"
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        margin: '2px 0',
                        color: simResult.profit_delta >= 0 ? '#34d399' : '#f43f5e',
                      }}
                    >
                      {simResult.profit_delta >= 0 ? `+₹${Number(simResult.profit_delta).toFixed(2)}` : `-₹${Number(Math.abs(simResult.profit_delta)).toFixed(2)}`}
                    </div>
                    <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Net: ₹{Number(simResult.projected_profit).toFixed(0)}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: simResult.profit_delta >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                    border: simResult.profit_delta >= 0 ? '1px solid rgba(16, 185, 129, 0.28)' : '1px solid rgba(244, 63, 94, 0.28)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem 0.95rem',
                    fontSize: '0.82rem',
                    color: simResult.profit_delta >= 0 ? '#6ee7b7' : '#fda4af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {simResult.profit_delta >= 0 ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{simResult.recommendation}</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-sunken)',
                  boxShadow: 'var(--shadow-sunken-sm)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                }}
              >
                <Sliders size={24} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                <div>Adjust target parameters on the left and execute simulation to calculate volume-to-margin trade-offs.</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
