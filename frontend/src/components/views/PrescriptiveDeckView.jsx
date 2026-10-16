import React from 'react';
import { 
  ShieldAlert, Tag, MessageCircle, AlertTriangle, CheckCircle2, 
  Sparkles, ArrowRight, Zap, TrendingUp, DollarSign, PackageCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TooltipText } from '../ui/Tooltip';

export function PrescriptiveDeckView({
  insights,
  inventory,
  onSendWhatsApp,
  onSyncRules,
}) {
  const urgentActions = insights?.urgent_actions || [];
  const bundleRecommendations = insights?.bundle_recommendations || [];
  const healthScore = insights?.health_score || 85;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner / AI Summary Deck */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.25rem',
        }}
      >
        {/* Prescriptive Autonomous Deck Overview */}
        <Card variant="raised" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <Badge variant="info" size="sm" style={{ marginBottom: '0.5rem' }}>
                <Sparkles size={11} /> Real-time Prescriptive Engine
              </Badge>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 6px', letterSpacing: '-0.02em' }}>
                Store Operational Deck
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, maxWidth: '580px' }}>
                AI engine scans stock velocity, safety buffers, and transaction basket co-occurrences every 60 seconds to provide zero-guesswork decisions.
              </p>
            </div>

            <Button variant="outline" size="sm" icon={Zap} onClick={onSyncRules}>
              Re-mine Rules
            </Button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginTop: '1.25rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--bg-sunken)',
                boxShadow: 'var(--shadow-sunken-sm)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 0.9rem',
                border: '1px solid rgba(255, 255, 255, 0.03)',
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                CRITICAL ACTIONS
              </span>
              <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: urgentActions.length > 0 ? '#f43f5e' : '#34d399', marginTop: '2px' }}>
                {urgentActions.length} Pending
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-sunken)',
                boxShadow: 'var(--shadow-sunken-sm)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 0.9rem',
                border: '1px solid rgba(255, 255, 255, 0.03)',
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                APRIORI COMBOS
              </span>
              <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#60a5fa', marginTop: '2px' }}>
                {bundleRecommendations.length} Derived
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-sunken)',
                boxShadow: 'var(--shadow-sunken-sm)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 0.9rem',
                border: '1px solid rgba(255, 255, 255, 0.03)',
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                HEALTH INDEX
              </span>
              <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                {healthScore}/100
              </div>
            </div>
          </div>
        </Card>

        {/* Circular Health Gauge Card */}
        <Card
          variant="raised"
          style={{
            padding: '1.4rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 0.75rem' }}>
            <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--bg-sunken)"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeDasharray={`${healthScore}, 100`}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {healthScore}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                SCORE
              </span>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Store Stability Rating
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Calculated from stockout risk & capital turnover
          </div>
        </Card>
      </div>

      {/* Action Triggers Feed */}
      <Card variant="raised">
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CardTitle icon={ShieldAlert}>Autonomous Decision Triggers</CardTitle>
            {urgentActions.length > 0 && (
              <Badge variant="destructive" size="sm">
                {urgentActions.length} Required
              </Badge>
            )}
          </div>
          <CardDescription>
            High-priority operational interventions to prevent stockouts and liberate idle cash.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {urgentActions.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: '1rem',
              }}
            >
              {urgentActions.map((act, i) => {
                const matchedItem = inventory.find(item => item.id === act.product_id);
                const reorderAmount = matchedItem ? Math.max((matchedItem.min_stock_level * 2) - matchedItem.current_stock, 10) : 10;
                const isCritical = act.severity === 'CRITICAL';

                return (
                  <div
                    key={i}
                    style={{
                      backgroundColor: 'var(--bg-sunken)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-sunken-sm)',
                      padding: '1.15rem',
                      border: isCritical ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                      borderLeft: isCritical ? '4px solid #f43f5e' : '4px solid #f59e0b',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      minWidth: 0,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', gap: '0.5rem' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <TooltipText
                            text={act.product_name}
                            badge={act.badge}
                            badgeColor={isCritical ? '#f43f5e' : '#f59e0b'}
                            subtext={act.detail}
                            textStyle={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}
                          />
                        </div>
                        <Badge variant={isCritical ? 'destructive' : 'warning'} size="sm" style={{ flexShrink: 0 }}>
                          {act.badge}
                        </Badge>
                      </div>

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.45 }}>
                        {act.detail}
                      </p>

                      <div
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          boxShadow: 'var(--shadow-raised-xs)',
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.76rem',
                          color: 'var(--text-primary)',
                          marginBottom: '0.85rem',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <strong style={{ color: isCritical ? '#fda4af' : '#fcd34d' }}>Recommendation:</strong> {act.action}
                      </div>
                    </div>

                    {matchedItem && act.type === 'REORDER' && (
                      <Button
                        variant="emerald"
                        size="sm"
                        icon={MessageCircle}
                        fullWidth
                        onClick={() => onSendWhatsApp(matchedItem, reorderAmount)}
                      >
                        WhatsApp Restock Dispatch ({reorderAmount} units)
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-sunken)',
                boxShadow: 'var(--shadow-sunken-sm)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                fontSize: '0.84rem',
              }}
            >
              <CheckCircle2 size={28} color="#10b981" style={{ margin: '0 auto 0.65rem' }} />
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Catalog Operating in Optimal State</div>
              <div>All items are currently above configured safety buffer thresholds.</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apriori Basket Association Bundles */}
      <Card variant="raised">
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CardTitle icon={Tag}>Co-Purchase Association Bundles (Apriori Mining)</CardTitle>
            <Badge variant="success" size="sm">
              Lift Multipliers Active
            </Badge>
          </div>
          <CardDescription>
            Empirical multi-item affinities mined from historical POS receipts to maximize average basket size.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {bundleRecommendations.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: '1rem',
              }}
            >
              {bundleRecommendations.map((b, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--bg-sunken)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sunken-sm)',
                    padding: '1.15rem',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderLeft: '4px solid #10b981',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minWidth: 0,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', gap: '0.5rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <TooltipText
                          text={`${b.primary_item} + ${b.paired_item}`}
                          badge="Apriori Pair"
                          badgeColor="#34d399"
                          subtext={`Lift: ${b.lift}x | Combined Original: ₹${b.original_total}`}
                          textStyle={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <Badge variant="success" size="sm" className="mono" style={{ flexShrink: 0 }}>
                        Lift: {b.lift}x
                      </Badge>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.85rem', lineHeight: 1.45, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                      {b.rationale}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--bg-card)',
                      boxShadow: 'var(--shadow-raised-xs)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        ORIGINAL
                      </span>
                      <div className="mono" style={{ fontSize: '0.82rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                        ₹{b.original_total}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.68rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>
                        COMBO DEAL (Save ₹{b.savings})
                      </span>
                      <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399' }}>
                        ₹{b.suggested_bundle_price}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-sunken)',
                boxShadow: 'var(--shadow-sunken-sm)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                fontSize: '0.84rem',
              }}
            >
              <Tag size={28} color="var(--primary)" style={{ margin: '0 auto 0.65rem' }} />
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>No Transaction Patterns Mined Yet</div>
              <div style={{ marginTop: '3px' }}>Click "Sync AI Rules" in the top bar to run ML association mining on simulated customer transactions.</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
