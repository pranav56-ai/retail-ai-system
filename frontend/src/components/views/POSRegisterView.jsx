import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, ScanBarcode, Search, Plus, Minus, Trash2, 
  Sparkles, Check, DollarSign, CreditCard, QrCode, ArrowRight,
  AlertCircle, RefreshCw, Printer, User, Phone, Tag, Layers,
  ChevronRight, CheckCircle2, X, PauseCircle, PlayCircle, History,
  ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TooltipText } from '../ui/Tooltip';
import { POSReceiptModal } from '../ui/POSReceiptModal';
import { ProductGrid, ProductCard } from './ProductGrid';
import api from '../../api';

// Web Audio API Sound Feedback Helpers
function playBeepSound(type = 'scan') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'scan') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08); // E6
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    // AudioContext autoplay restrictions fallback
  }
}

export function POSRegisterView({
  inventory = [],
  insights,
  storeName,
  onReloadCatalog,
  onOpenGlobalScanner,
}) {
  // Cart & Basket State
  const [cart, setCart] = useState([]);
  const [discountPct, setDiscountPct] = useState(0);
  const [customDiscount, setCustomDiscount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH'); // 'CASH' | 'UPI' | 'CARD'
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [cashTendered, setCashTendered] = useState('');

  // Catalog Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Scanner & Input References
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef(null);

  // Completed Receipt Modal State
  const [lastReceipt, setLastReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Held Baskets State
  const [heldBaskets, setHeldBaskets] = useState([]);

  // Recent Transactions Modal / View State
  const [recentOrdersOpen, setRecentOrdersOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(false);

  // Auto-focus barcode input on mount and after cart actions
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  const showFeedback = (msg, isError = false) => {
    setFeedbackMsg(msg);
    playBeepSound(isError ? 'error' : 'scan');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(inventory.map((p) => p.category || 'General')))];

  // Filtered inventory list
  const filteredInventory = inventory.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Add Item to Cart (or increment quantity)
  const handleAddToCart = (product, quantityToAdd = 1) => {
    if (product.current_stock <= 0) {
      showFeedback(`"${product.name}" is out of stock!`, true);
      return;
    }

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.product_id === product.id);
      if (existingIdx > -1) {
        const currentQty = prevCart[existingIdx].quantity;
        const newQty = currentQty + quantityToAdd;
        if (newQty > product.current_stock) {
          showFeedback(`Max available stock reached (${product.current_stock} units)`, true);
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        showFeedback(`Updated: ${product.name} (Qty: ${newQty})`);
        return updated;
      } else {
        const initialQty = Math.min(quantityToAdd, product.current_stock);
        showFeedback(`Added to cart: ${product.name}`);
        return [
          ...prevCart,
          {
            product_id: product.id,
            name: product.name,
            category: product.category,
            selling_price: product.selling_price,
            cost_price: product.cost_price,
            current_stock: product.current_stock,
            min_stock_level: product.min_stock_level,
            barcode: product.barcode,
            quantity: initialQty,
          },
        ];
      }
    });

    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  // Adjust Quantity of line item
  const handleUpdateQty = (productId, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.current_stock) {
              showFeedback(`Stock limit of ${item.current_stock} reached for ${item.name}`, true);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId));
  };

  // Clear Basket
  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Clear all items from current checkout basket?')) {
      setCart([]);
      setDiscountPct(0);
      setCustomDiscount('');
      setCashTendered('');
      showFeedback('Basket cleared');
    }
  };

  // Hold Basket
  const handleHoldCart = () => {
    if (cart.length === 0) return;
    const basketId = `BASKET-#${heldBaskets.length + 1}`;
    setHeldBaskets((prev) => [
      ...prev,
      {
        id: basketId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        customerName: customerName || 'Guest Customer',
        customerPhone,
      },
    ]);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountPct(0);
    setCustomDiscount('');
    showFeedback(`Cart held as ${basketId}`);
  };

  // Restore Held Basket
  const handleRestoreBasket = (heldItem) => {
    if (cart.length > 0 && !window.confirm('Current cart has items. Replace with held basket?')) {
      return;
    }
    setCart(heldItem.items);
    setCustomerName(heldItem.customerName === 'Guest Customer' ? '' : heldItem.customerName);
    setCustomerPhone(heldItem.customerPhone || '');
    setHeldBaskets((prev) => prev.filter((b) => b.id !== heldItem.id));
    showFeedback(`Restored ${heldItem.id}`);
  };

  // Handle Barcode Scan / Keydown event
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    // Search by exact barcode or SKU ID or name
    const matched = inventory.find(
      (p) =>
        (p.barcode && p.barcode.trim() === code) ||
        String(p.id) === code ||
        p.name.toLowerCase() === code.toLowerCase()
    );

    if (matched) {
      handleAddToCart(matched, 1);
      setBarcodeInput('');
    } else {
      showFeedback(`Unrecognized Barcode / SKU: "${code}"`, true);
    }
  };

  // Calculations
  const grossSubtotal = cart.reduce((acc, it) => acc + it.selling_price * it.quantity, 0);
  const totalQuantity = cart.reduce((acc, it) => acc + it.quantity, 0);

  const discountAmount = customDiscount !== ''
    ? Math.min(parseFloat(customDiscount) || 0, grossSubtotal)
    : Math.round((grossSubtotal * (discountPct / 100)) * 100) / 100;

  const netPayable = Math.max(0, Math.round((grossSubtotal - discountAmount) * 100) / 100);

  const tenderedVal = parseFloat(cashTendered) || 0;
  const changeDue = tenderedVal > 0 ? Math.max(0, tenderedVal - netPayable) : 0;

  // Real-time AI Apriori Basket Cross-selling Suggestions
  const cartProductIds = new Set(cart.map((it) => it.product_id));
  const activeUpsells = (insights?.bundle_recommendations || [])
    .filter((bundle) => {
      // Find rules where cart has the primary item and NOT YET the paired item
      const hasPrimary = inventory.some((p) => p.name === bundle.primary_item && cartProductIds.has(p.id));
      const hasPaired = inventory.some((p) => p.name === bundle.paired_item && cartProductIds.has(p.id));
      return hasPrimary && !hasPaired;
    })
    .map((bundle) => {
      const pairedProd = inventory.find((p) => p.name === bundle.paired_item);
      return {
        ...bundle,
        pairedProduct: pairedProd,
      };
    })
    .filter((bundle) => bundle.pairedProduct && bundle.pairedProduct.current_stock > 0)
    .slice(0, 2);

  // Complete Multi-Item Checkout
  const handleCompleteCheckout = async () => {
    if (cart.length === 0) {
      showFeedback('Please add at least 1 item to the cart', true);
      return;
    }

    setCheckoutLoading(true);
    try {
      const payload = {
        items: cart.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
        })),
        discount_applied: discountAmount,
        payment_mode: paymentMode,
        customer_phone: customerPhone.trim() || undefined,
        customer_name: customerName.trim() || undefined,
      };

      const res = await api.post('/inventory/checkout-basket', payload);
      playBeepSound('success');

      setLastReceipt(res.data);
      setReceiptModalOpen(true);

      // Reset cart
      setCart([]);
      setDiscountPct(0);
      setCustomDiscount('');
      setCashTendered('');
      setCustomerPhone('');
      setCustomerName('');

      if (onReloadCatalog) {
        await onReloadCatalog();
      }
    } catch (err) {
      playBeepSound('error');
      const errDetail = err.response?.data?.detail;
      if (typeof errDetail === 'object' && errDetail.errors) {
        alert(`Checkout validation failed:\n• ${errDetail.errors.join('\n• ')}`);
      } else {
        alert(errDetail || 'Failed to complete checkout.');
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Fetch recent orders history
  const fetchRecentOrders = async () => {
    setRecentOrdersLoading(true);
    try {
      const res = await api.get('/inventory/recent-orders?limit=15');
      setRecentOrders(res.data);
      setRecentOrdersOpen(true);
    } catch (err) {
      console.error('Recent orders error:', err);
    } finally {
      setRecentOrdersLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1.25rem', height: 'calc(100vh - 120px)', minHeight: '620px' }}>
      
      {/* =========================================================================
          LEFT PANE: FAST-TOUCH CATALOG & INSTANT BARCODE SEARCH (60% Width)
         ========================================================================= */}
      <div style={{ flex: '1.25', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '0' }}>
        
        {/* Top Control Strip: Search, Barcode Input & Scanner */}
        <Card variant="raised" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            
            {/* Barcode / SKU Direct Input */}
            <form onSubmit={handleBarcodeSubmit} style={{ flex: '1.2', minWidth: '220px', display: 'flex', gap: '0.4rem' }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--bg-sunken)',
                  boxShadow: 'var(--shadow-sunken-sm)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.75rem',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                <ScanBarcode size={17} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Scan barcode or press Enter..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <Button type="submit" variant="primary" size="sm">
                Add SKU
              </Button>
            </form>

            {/* General Search Filter */}
            <div
              style={{
                flex: '1',
                minWidth: '180px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--bg-sunken)',
                boxShadow: 'var(--shadow-sunken-sm)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search catalog by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontFamily: 'inherit',
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <Button
              variant="secondary"
              size="sm"
              icon={ScanBarcode}
              onClick={() => onOpenGlobalScanner('pos')}
            >
              Camera
            </Button>

            <Button
              variant="ghost"
              size="sm"
              icon={History}
              onClick={fetchRecentOrders}
              loading={recentOrdersLoading}
            >
              Orders
            </Button>
          </div>

          {/* Feedback Toast Inside Panel */}
          {feedbackMsg && (
            <div
              style={{
                marginTop: '0.65rem',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: feedbackMsg.includes('out of stock') || feedbackMsg.includes('Unrecognized') || feedbackMsg.includes('limit')
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(16, 185, 129, 0.15)',
                color: feedbackMsg.includes('out of stock') || feedbackMsg.includes('Unrecognized') || feedbackMsg.includes('limit')
                  ? '#f87171'
                  : '#34d399',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <CheckCircle2 size={14} />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </Card>

        {/* Category Horizontal Filter Pills */}
        <div className="category-pill-strip">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-sunken)',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all var(--transition-fast)',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Product Fast-Touch Cards Grid with Stacking Context Elevation */}
        <ProductGrid
          products={filteredInventory}
          cart={cart}
          onAddToCart={handleAddToCart}
        />
      </div>

      {/* =========================================================================
          RIGHT PANE: LIVE CUSTOMER BASKET & BILLING REGISTER TERMINAL (40% Width)
         ========================================================================= */}
      <div
        style={{
          flex: '1',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'var(--shadow-raised-md)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          minWidth: '340px',
        }}
      >
        {/* Register Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            backgroundColor: 'var(--bg-sunken)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCart size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Active Checkout Basket
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {totalQuantity} {totalQuantity === 1 ? 'unit' : 'units'} scanned
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {heldBaskets.length > 0 && (
              <Badge variant="warning" size="sm">
                {heldBaskets.length} Held
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={PauseCircle}
              disabled={cart.length === 0}
              onClick={handleHoldCart}
              title="Hold this basket"
            >
              Hold
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              disabled={cart.length === 0}
              onClick={handleClearCart}
              title="Clear basket"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Held Baskets Quick Banner (If any) */}
        {heldBaskets.length > 0 && (
          <div
            style={{
              padding: '0.5rem 1.15rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.76rem',
              color: '#fcd34d',
            }}
          >
            <span>Held Baskets ({heldBaskets.length}):</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {heldBaskets.map((hb) => (
                <button
                  key={hb.id}
                  type="button"
                  onClick={() => handleRestoreBasket(hb)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#fef3c7',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {hb.id} ({hb.items.length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Cart Line Items Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 1.15rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {cart.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                gap: '0.75rem',
                textAlign: 'center',
                padding: '2rem 1rem',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-sunken)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-faint)',
                }}
              >
                <ScanBarcode size={26} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Register is Empty
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Scan barcode with USB scanner or click catalog items to build the customer bill.
                </div>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-sunken)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  gap: '0.6rem',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <TooltipText
                    text={item.name}
                    badge={item.category}
                    subtext={`₹${item.selling_price.toFixed(2)} / unit | Available Stock: ${item.current_stock}`}
                    textStyle={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    ₹{item.selling_price.toFixed(2)} / unit
                  </div>
                </div>

                {/* Quantity Controller */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.product_id, -1)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <Minus size={12} />
                  </button>

                  <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, minWidth: '22px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.product_id, 1)}
                    disabled={item.quantity >= item.current_stock}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.quantity >= item.current_stock ? 'var(--text-faint)' : 'var(--primary)',
                      cursor: item.quantity >= item.current_stock ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Line Total */}
                <div className="mono" style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', minWidth: '60px', textAlign: 'right' }}>
                  ₹{(item.selling_price * item.quantity).toFixed(2)}
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemoveFromCart(item.product_id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-faint)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  title="Remove SKU"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}

          {/* AI Apriori Basket Cross-Sell Strip */}
          {activeUpsells.length > 0 && (
            <div
              style={{
                marginTop: '0.35rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                border: '1px dashed rgba(59, 130, 246, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)' }}>
                <Sparkles size={14} />
                <span>Apriori Companion Upsell:</span>
              </div>
              {activeUpsells.map((up, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.74rem',
                    color: 'var(--text-secondary)',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <TooltipText
                      text={`+ ${up.paired_item} (Lift ${up.lift}x)`}
                      badge="Apriori Upsell"
                      badgeColor="var(--accent-emerald)"
                      subtext={`Price: ₹${up.pairedProduct.selling_price} | Stock: ${up.pairedProduct.current_stock}`}
                      textStyle={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(up.pairedProduct, 1)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      color: '#93c5fd',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    + Add ₹{up.pairedProduct.selling_price}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Phone & Bill Calculations Footer */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'var(--bg-sunken)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {/* Customer Meta Inputs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.25rem 0.55rem',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <Phone size={13} style={{ color: 'var(--text-muted)' }} />
              <input
                type="tel"
                placeholder="WhatsApp Phone..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.76rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Discount Quick Pills */}
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              {[0, 5, 10].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDiscountPct(d);
                    setCustomDiscount('');
                  }}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: discountPct === d && customDiscount === '' ? 'var(--primary)' : 'var(--bg-card)',
                    color: discountPct === d && customDiscount === '' ? '#fff' : 'var(--text-muted)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {d === 0 ? 'No Disc' : `${d}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[
              { id: 'CASH', label: 'Cash', icon: DollarSign },
              { id: 'UPI', label: 'UPI / QR', icon: QrCode },
              { id: 'CARD', label: 'Card', icon: CreditCard },
            ].map((pm) => {
              const isSel = paymentMode === pm.id;
              const Icon = pm.icon;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMode(pm.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: isSel ? 'rgba(16, 185, 129, 0.18)' : 'var(--bg-card)',
                    border: isSel ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.05)',
                    color: isSel ? '#34d399' : 'var(--text-secondary)',
                    fontSize: '0.76rem',
                    fontWeight: isSel ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={14} />
                  <span>{pm.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cash Tendered Calculator (when CASH is selected) */}
          {paymentMode === 'CASH' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem' }}>
              <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Tendered:</span>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.2rem 0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <span style={{ color: 'var(--text-muted)', marginRight: '2px' }}>₹</span>
                <input
                  type="number"
                  placeholder={netPayable ? String(netPayable) : '0'}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.78rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {tenderedVal > 0 && (
                <div style={{ color: changeDue >= 0 ? '#34d399' : '#f87171', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  Change: ₹{changeDue.toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Financial Calculation Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Gross Subtotal:</span>
              <span className="mono">₹{grossSubtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                <span>Discount ({discountPct > 0 ? `${discountPct}%` : 'Custom'}):</span>
                <span className="mono">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.35rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Net Amount Payable:
              </span>
              <span className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                ₹{netPayable.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Master Checkout Button */}
          <Button
            variant="emerald"
            size="lg"
            icon={ArrowRight}
            loading={checkoutLoading}
            disabled={cart.length === 0}
            onClick={handleCompleteCheckout}
            style={{ width: '100%', padding: '0.75rem', fontWeight: 800 }}
          >
            {checkoutLoading ? 'Processing Ledger...' : `Confirm Checkout (₹${netPayable.toFixed(2)})`}
          </Button>
        </div>
      </div>

      {/* =========================================================================
          COMPLETED TRANSACTION RECEIPT & INVOICE MODAL
         ========================================================================= */}
      <POSReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={lastReceipt}
        storeName={storeName}
        onNewSale={() => {
          if (barcodeInputRef.current) barcodeInputRef.current.focus();
        }}
      />

      {/* =========================================================================
          RECENT ORDERS HISTORY MODAL
         ========================================================================= */}
      {recentOrdersOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: 'var(--shadow-raised-lg)',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.25rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <History size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Recent Multi-Item Transactions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRecentOrdersOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
              {recentOrders.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No recent checkout orders recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentOrders.map((ord, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-sunken)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                            {ord.order_id}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {new Date(ord.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {ord.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div className="mono" style={{ fontSize: '0.96rem', fontWeight: 800, color: '#34d399' }}>
                          ₹{ord.total_revenue.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {ord.total_quantity} {ord.total_quantity === 1 ? 'item' : 'items'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Button variant="secondary" size="sm" onClick={() => setRecentOrdersOpen(false)}>
                Close History
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
