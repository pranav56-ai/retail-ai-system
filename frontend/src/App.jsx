import React, { useState, useEffect, useRef } from 'react';
import api from './api';
import { 
  Boxes, PlusCircle, AlertTriangle, Store, LogOut, 
  CheckCircle2, DollarSign, ShieldAlert, Sparkles, Tag, Trash2,
  TrendingUp, RefreshCw, Sliders, ArrowRight, BarChart3, Search, 
  LayoutDashboard, ShoppingBag, PieChart, Layers, FileText, 
  GitBranch, Check, Printer, ChevronRight, Activity, Percent, 
  ShoppingCart, Send, MessageCircle, ScanBarcode, Camera, X,
  ArrowUpRight, ArrowDownRight, Zap, Radio, CornerDownRight,
  HelpCircle, ChevronDown, PackageCheck, AlertCircle
} from 'lucide-react';

// UI Components
import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';
import { Card } from './components/ui/Card';
import { StatCard } from './components/ui/StatCard';
import { BarcodeScannerModal } from './components/ui/BarcodeScannerModal';
import { InvoiceModal } from './components/ui/InvoiceModal';

// Layout & Views
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthScreen } from './components/auth/AuthScreen';
import { POSRegisterView } from './components/views/POSRegisterView';
import { PrescriptiveDeckView } from './components/views/PrescriptiveDeckView';
import { CapitalAllocationView } from './components/views/CapitalAllocationView';
import { PriceElasticityView } from './components/views/PriceElasticityView';
import { InventoryCatalogView } from './components/views/InventoryCatalogView';
import { PurchaseOrdersView } from './components/views/PurchaseOrdersView';
import { BasketAffinityView } from './components/views/BasketAffinityView';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('retail_token') || '');
  const [storeName, setStoreName] = useState(localStorage.getItem('store_name') || '');
  const [activeTab, setActiveTab] = useState('insights');
  const [theme, setTheme] = useState(localStorage.getItem('retail_theme') || 'dark');

  // Core Data States
  const [inventory, setInventory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Daily Quick POS Sale State
  const [saleForm, setSaleForm] = useState({ product_id: '', units_sold: 1 });
  const [saleLoading, setSaleLoading] = useState(false);

  // Optical Barcode Scanner State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState('pos'); // 'pos' | 'intake'

  // Purchase Order Supplier Settings
  const [supplierPhone, setSupplierPhone] = useState(localStorage.getItem('supplier_phone') || '919876543210');
  const [selectedPO, setSelectedPO] = useState(null);

  // New Item Intake State
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Dairy',
    cost_price: '',
    selling_price: '',
    current_stock: '',
    min_stock_level: '10',
    barcode: '',
  });

  // Apply Theme on load & toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('retail_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Initial Data Load
  useEffect(() => {
    if (token) {
      loadInventory();
      loadInsights();
    }
  }, [token]);

  const loadInventory = async () => {
    try {
      const res = await api.get('/inventory/list');
      setInventory(res.data);
      if (res.data.length > 0 && !saleForm.product_id) {
        setSaleForm(prev => ({ ...prev, product_id: res.data[0].id }));
      }
    } catch (err) {
      console.error('Inventory fetch error:', err);
    }
  };

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/prescriptive-insights');
      setInsights(res.data);
    } catch (err) {
      console.error('Insights fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTransactions = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/analytics/generate-transactions');
      showToast(res.data.message || 'Transaction mining completed successfully.');
      await loadInsights();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to sync AI transaction rules.');
    } finally {
      setSyncing(false);
    }
  };

  const handleQuickSale = async (e) => {
    e.preventDefault();
    if (!saleForm.product_id) {
      alert('Please select an item first.');
      return;
    }
    setSaleLoading(true);
    try {
      const res = await api.post('/inventory/record-sale', {
        product_id: parseInt(saleForm.product_id, 10),
        units_sold: parseInt(saleForm.units_sold, 10),
      });

      showToast(`${res.data.message}${res.data.is_low_stock ? ' ⚠️ (Stock threshold triggered)' : ''}`);
      setSaleForm(prev => ({ ...prev, units_sold: 1 }));
      await loadInventory();
      await loadInsights();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to record sale.');
    } finally {
      setSaleLoading(false);
    }
  };

  const handleBarcodeDetected = async (scannedCode, targetMode) => {
    if (targetMode === 'intake') {
      setScannerOpen(false);
      try {
        const parsed = JSON.parse(scannedCode);
        if (typeof parsed === 'object' && parsed !== null) {
          setNewItem(prev => ({
            ...prev,
            name: parsed.name || prev.name,
            category: parsed.category || prev.category,
            cost_price: parsed.cost_price !== undefined ? String(parsed.cost_price) : prev.cost_price,
            selling_price: parsed.selling_price !== undefined ? String(parsed.selling_price) : prev.selling_price,
            current_stock: parsed.current_stock !== undefined ? String(parsed.current_stock) : (parsed.stock !== undefined ? String(parsed.stock) : prev.current_stock),
            min_stock_level: parsed.min_stock_level !== undefined ? String(parsed.min_stock_level) : prev.min_stock_level,
            barcode: parsed.barcode || prev.barcode || '',
          }));
          showToast(`Autofilled intake form from QR payload`);
          return;
        }
      } catch (e) {}

      setNewItem(prev => ({ ...prev, barcode: scannedCode.trim() }));
      showToast(`Populated barcode: ${scannedCode}`);
      return;
    }

    // POS Checkout Mode
    const matchedProduct = inventory.find(
      p => (p.barcode && p.barcode.trim() === scannedCode.trim()) ||
           String(p.id) === scannedCode.trim() ||
           p.name.toLowerCase().includes(scannedCode.toLowerCase())
    );

    if (matchedProduct) {
      setScannerOpen(false);
      try {
        const res = await api.post('/inventory/record-sale', {
          product_id: matchedProduct.id,
          units_sold: 1,
        });
        showToast(`Deducted [${matchedProduct.name}]: ${res.data.message}`);
        await loadInventory();
        await loadInsights();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to deduct scanned product.');
      }
    } else {
      alert(`Barcode [${scannedCode}] not recognized in active catalog.`);
    }
  };

  const sendWhatsAppPO = (item, quantityNeeded) => {
    const store = storeName || 'My Retail Store';
    const orderId = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    const phone = supplierPhone.replace(/[^0-9]/g, '');

    const message = 
      `*PURCHASE ORDER ${orderId}*\n` +
      `Store: *${store}*\n` +
      `---------------------------\n` +
      `Urgent Restock Request:\n` +
      `• *Product:* ${item.name} (${item.category})\n` +
      `• *Units Required:* ${quantityNeeded}\n` +
      `• *Current On-Hand:* ${item.current_stock}\n` +
      `• *Target Cost Price:* ₹${item.cost_price}/unit\n` +
      `• *Est. Total Value:* ₹${(quantityNeeded * item.cost_price).toLocaleString()}\n` +
      `---------------------------\n` +
      `Please confirm dispatch schedule.`;

    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const cost = parseFloat(newItem.cost_price);
    const sell = parseFloat(newItem.selling_price);
    const stock = parseInt(newItem.current_stock, 10);
    const minStock = parseInt(newItem.min_stock_level, 10);

    if (isNaN(cost) || isNaN(sell) || isNaN(stock) || isNaN(minStock)) {
      alert('Enter valid numeric numbers for prices and stock.');
      return;
    }

    try {
      await api.post('/inventory/add', {
        name: newItem.name.trim(),
        category: newItem.category.trim() || 'General',
        cost_price: cost,
        selling_price: sell,
        current_stock: stock,
        min_stock_level: minStock,
        barcode: newItem.barcode.trim() || '',
      });
      showToast('Product committed to database successfully');
      setNewItem({ name: '', category: 'Dairy', cost_price: '', selling_price: '', current_stock: '', min_stock_level: '10', barcode: '' });
      await loadInventory();
      await loadInsights();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save product.');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Permanently remove "${name}" from inventory?`)) return;
    try {
      await api.delete(`/inventory/delete/${id}`);
      showToast(`Removed "${name}" from catalog`);
      await loadInventory();
      await loadInsights();
    } catch (err) {
      alert('Failed to delete item.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('retail_token');
    localStorage.removeItem('store_name');
    setToken('');
    setStoreName('');
  };

  // Calculations for KPI bar
  const totalStockValue = inventory.reduce((acc, curr) => acc + (curr.cost_price * curr.current_stock), 0);
  const stockShortages = inventory.filter(i => i.current_stock <= i.min_stock_level);
  const healthScore = insights?.health_score || 85;

  if (!token) {
    return (
      <AuthScreen
        theme={theme}
        onToggleTheme={toggleTheme}
        onLoginSuccess={(tok, name) => {
          setToken(tok);
          setStoreName(name);
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
      }}
    >
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        storeName={storeName}
        onLogout={handleLogout}
        inventoryCount={inventory.length}
        urgentActionsCount={insights?.urgent_actions?.length || 0}
        stockShortagesCount={stockShortages.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* HEADER BAR */}
        <Header
          activeTab={activeTab}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenScanner={(target) => {
            setScannerTarget(target);
            setScannerOpen(true);
          }}
          onSyncTransactions={handleSyncTransactions}
          syncing={syncing}
        />

        {/* SCROLLABLE MAIN VIEWPORT */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem' }}>
          
          {/* TOAST FEEDBACK NOTIFICATION */}
          {toastMsg && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.14)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#6ee7b7',
                padding: '0.75rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                fontWeight: 600,
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: 'var(--shadow-raised-sm)',
              }}
              className="animate-in"
            >
              <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* PRIMARY 4-METRIC TACTILE STATS STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.15rem', marginBottom: '1.4rem' }}>
            <StatCard
              title="Catalog SKUs"
              value={inventory.length}
              subtitle="Active inventory units"
              icon={ShoppingBag}
              variant="blue"
            />
            <StatCard
              title="Wholesale Capital"
              value={`₹${totalStockValue.toLocaleString()}`}
              subtitle="Current cost basis"
              icon={DollarSign}
              variant="emerald"
            />
            <StatCard
              title="Stock Shortages"
              value={stockShortages.length}
              subtitle="Below safety threshold"
              icon={AlertTriangle}
              variant={stockShortages.length > 0 ? 'amber' : 'emerald'}
            />
            <StatCard
              title="Health Index"
              value={`${healthScore}/100`}
              subtitle="Autonomous stability rating"
              icon={Activity}
              variant="emerald"
            />
          </div>

          {/* COMPACT COUNTER SALES INGESTION BAR (Hidden on dedicated POS Register tab) */}
          {activeTab !== 'pos' && (
            <Card
              variant="raised"
              style={{
                padding: '0.85rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                  }}
                >
                  <ShoppingCart size={15} />
                </div>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Point-of-Sale Quick Deduction:
                </span>
              </div>

              <form onSubmit={handleQuickSale} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, maxWidth: '680px' }}>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--bg-sunken)',
                    boxShadow: 'var(--shadow-sunken-sm)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.2rem 0.6rem',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <select
                    value={saleForm.product_id}
                    onChange={(e) => setSaleForm({ ...saleForm, product_id: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontFamily: 'inherit',
                      padding: '0.35rem 0',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="" style={{ background: 'var(--bg-surface)' }}>-- Select product to deduct --</option>
                    {inventory.map((p) => (
                      <option key={p.id} value={p.id} style={{ background: 'var(--bg-surface)' }}>
                        {p.name} {p.barcode ? `[${p.barcode}]` : ''} (Stock: {p.current_stock} | ₹{p.selling_price})
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    width: '80px',
                    backgroundColor: 'var(--bg-sunken)',
                    boxShadow: 'var(--shadow-sunken-sm)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.2rem 0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={saleForm.units_sold}
                    onChange={(e) => setSaleForm({ ...saleForm, units_sold: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      fontFamily: 'inherit',
                      padding: '0.35rem 0',
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  variant="emerald"
                  size="sm"
                  loading={saleLoading}
                  disabled={!saleForm.product_id}
                >
                  {saleLoading ? 'Logging...' : 'Deduct Sale'}
                </Button>
              </form>
            </Card>
          )}

          {/* DEDICATED WORKSPACE TABS */}
          {activeTab === 'pos' && (
            <POSRegisterView
              inventory={inventory}
              insights={insights}
              storeName={storeName}
              onReloadCatalog={async () => {
                await loadInventory();
                await loadInsights();
              }}
              onOpenGlobalScanner={(target) => {
                setScannerTarget(target);
                setScannerOpen(true);
              }}
            />
          )}

          {activeTab === 'insights' && (
            <PrescriptiveDeckView
              insights={insights}
              inventory={inventory}
              onSendWhatsApp={sendWhatsAppPO}
              onSyncRules={handleSyncTransactions}
            />
          )}

          {activeTab === 'analytics' && (
            <CapitalAllocationView
              inventory={inventory}
              insights={insights}
            />
          )}

          {activeTab === 'simulator' && (
            <PriceElasticityView
              inventory={inventory}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryCatalogView
              inventory={inventory}
              newItem={newItem}
              setNewItem={setNewItem}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              onOpenScanner={(target) => {
                setScannerTarget(target);
                setScannerOpen(true);
              }}
              onReloadCatalog={async () => {
                await loadInventory();
                await loadInsights();
              }}
            />
          )}

          {activeTab === 'po_generator' && (
            <PurchaseOrdersView
              inventory={inventory}
              supplierPhone={supplierPhone}
              setSupplierPhone={setSupplierPhone}
              onSendWhatsApp={sendWhatsAppPO}
              onSelectPO={setSelectedPO}
            />
          )}

          {activeTab === 'affinity' && (
            <BasketAffinityView
              inventory={inventory}
              insights={insights}
            />
          )}
        </main>
      </div>

      {/* OPTICAL BARCODE SCANNER MODAL */}
      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        targetMode={scannerTarget}
        onDetected={handleBarcodeDetected}
      />

      {/* OFFICIAL PURCHASE ORDER INVOICE MODAL */}
      <InvoiceModal
        open={Boolean(selectedPO)}
        onClose={() => setSelectedPO(null)}
        purchaseOrder={selectedPO}
        storeName={storeName}
        supplierPhone={supplierPhone}
        onSendWhatsApp={sendWhatsAppPO}
      />
    </div>
  );
}