import React, { useState } from 'react';
import { Plus } from 'lucide-react';

/**
 * ProductCard Component for POS Checkout Register
 * 
 * Solves CSS stacking context, z-index overlap, and clipping issues:
 * - Dynamically elevates z-index on hover/focus-within (z-30 / z-35) so preview tooltips
 *   always render above sibling and lower grid tiles.
 * - Floating detail preview card has absolute z-50 with pointer-events-none to prevent flicker.
 * - Title handles 2 lines with line-clamp-2 and fixed min-h-[2.5rem] to keep layout uniform.
 * - Light/Dark neumorphic aesthetic with soft accents and smooth transitions.
 */
export function ProductCard({
  product,
  inCartItem,
  onAddToCart,
  className = '',
  style = {},
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isOutOfStock = product.current_stock <= 0;
  const isLowStock = product.current_stock > 0 && product.current_stock <= (product.min_stock_level || 5);
  const isActiveElevation = isHovered || isFocused;

  return (
    <div
      tabIndex={isOutOfStock ? -1 : 0}
      role="button"
      aria-label={`${product.name}, Price: ₹${product.selling_price}`}
      onClick={() => !isOutOfStock && onAddToCart(product, 1)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isOutOfStock) {
          e.preventDefault();
          onAddToCart(product, 1);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        position: 'relative',
        zIndex: isActiveElevation ? 35 : 1, // Dynamic Stacking Context Elevation
        backgroundColor: inCartItem ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-surface)',
        border: inCartItem
          ? '1.5px solid rgba(59, 130, 246, 0.5)'
          : isActiveElevation
          ? '1px solid rgba(59, 130, 246, 0.35)'
          : '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: inCartItem
          ? 'var(--shadow-raised-sm)'
          : isActiveElevation
          ? 'var(--shadow-raised-sm)'
          : 'var(--shadow-raised-xs)',
        borderRadius: 'var(--radius-sm, 10px)',
        padding: '0.85rem 0.95rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.75rem',
        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
        opacity: isOutOfStock ? 0.45 : 1,
        transition: 'transform var(--transition-fast, 0.15s ease), box-shadow var(--transition-fast, 0.15s ease), border-color var(--transition-fast, 0.15s ease)',
        transform: isActiveElevation && !isOutOfStock ? 'translateY(-2px)' : 'none',
        userSelect: 'none',
        outline: 'none',
        overflow: 'visible', // Ensures floating preview is not clipped by card boundaries
        ...style,
      }}
      className={`pos-product-card group relative transition-all hover:z-30 focus-within:z-30 ${
        inCartItem ? 'in-cart' : ''
      } ${isOutOfStock ? 'out-of-stock' : ''} ${className}`}
    >
      {/* Active In-Cart Quantity Bubble */}
      {inCartItem && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            backgroundColor: 'var(--primary, #3b82f6)',
            color: '#fff',
            borderRadius: 'var(--radius-full, 9999px)',
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.72rem',
            fontWeight: 800,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
            zIndex: 10,
          }}
          className="mono"
        >
          {inCartItem.quantity}
        </div>
      )}

      {/* Main Card Content */}
      <div style={{ minWidth: 0, position: 'relative' }}>
        {/* Category Pill Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              fontSize: '0.66rem',
              color: 'var(--text-faint, #64748b)',
              textTransform: 'uppercase',
              fontWeight: 800,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '130px',
            }}
          >
            {product.category || 'General'}
          </span>
        </div>

        {/* 2-Line Clamped Title with Fixed Minimum Height */}
        <div
          title={product.name}
          style={{
            fontSize: '0.86rem',
            fontWeight: 700,
            color: 'var(--text-primary, #f8fafc)',
            lineHeight: 1.25,
            minHeight: '2.5rem', // Ensures exactly 2 lines height uniform grid baseline
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            marginBottom: '0.25rem',
          }}
          className="pos-product-title line-clamp-2 min-h-[2.5rem]"
        >
          {product.name}
        </div>

        {/* Barcode Tag */}
        {product.barcode && (
          <div
            className="mono"
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted, #64748b)',
              lineHeight: 1.35,
              marginTop: '2px',
            }}
          >
            #{product.barcode}
          </div>
        )}
      </div>

      {/* Bottom Pricing & Quick-Add Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginTop: '0.35rem',
          paddingTop: '0.4rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#34d399',
              lineHeight: 1.2,
            }}
            className="mono"
          >
            ₹{Number(product.selling_price).toFixed(2)}
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: isOutOfStock ? '#f87171' : isLowStock ? '#f59e0b' : 'var(--text-muted, #64748b)',
              fontWeight: 600,
              marginTop: '2px',
            }}
          >
            {isOutOfStock ? '0 in stock' : `${product.current_stock} left`}
          </div>
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          aria-label={`Add ${product.name} to cart`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOutOfStock) onAddToCart(product, 1);
          }}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-xs, 6px)',
            backgroundColor: 'var(--bg-sunken, #0f131c)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary, #3b82f6)',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={15} />
        </button>
      </div>

      {/* =========================================================================
          FLOATING DETAIL PREVIEW CARD (Elevated Tooltip z-50)
          Renders above all sibling grid tiles with pointer-events-none
         ========================================================================= */}
      {isActiveElevation && (
        <div
          className="pos-product-preview-card animate-in absolute z-50 pointer-events-none shadow-xl"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50, // Floating popup z-50
            pointerEvents: 'none', // Prevents mouse interaction & flicker
            backgroundColor: 'var(--bg-card, #1a202c)',
            color: 'var(--text-primary, #f8fafc)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-sm, 10px)',
            boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            padding: '10px 14px',
            minWidth: '220px',
            maxWidth: '300px',
            width: 'max-content',
            backdropFilter: 'blur(8px)',
            textAlign: 'left',
          }}
        >
          {/* Category Header Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--primary, #38bdf8)',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {product.category || 'General'}
            </span>
            {product.barcode && (
              <span
                className="mono"
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                #{product.barcode}
              </span>
            )}
          </div>

          {/* Full Unabbreviated Title */}
          <div
            style={{
              fontSize: '0.86rem',
              fontWeight: 800,
              color: 'var(--text-primary, #f8fafc)',
              lineHeight: 1.3,
              marginBottom: '8px',
            }}
          >
            {product.name}
          </div>

          {/* Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              paddingTop: '6px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.72rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted, #94a3b8)', display: 'block' }}>Price</span>
              <span className="mono" style={{ color: '#34d399', fontWeight: 700 }}>
                ₹{Number(product.selling_price).toFixed(2)}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted, #94a3b8)', display: 'block' }}>Stock Status</span>
              <span
                style={{
                  color: isOutOfStock ? '#f87171' : isLowStock ? '#f59e0b' : '#34d399',
                  fontWeight: 700,
                }}
              >
                {isOutOfStock ? 'Out of Stock' : `${product.current_stock} units left`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
