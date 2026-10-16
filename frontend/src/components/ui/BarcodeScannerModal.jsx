import React, { useRef, useEffect } from 'react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from './Dialog';
import { Button } from './Button';
import { ScanBarcode, Camera, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export function BarcodeScannerModal({
  open,
  onClose,
  targetMode = 'pos', // 'pos' | 'intake'
  onDetected,
}) {
  const [scannerError, setScannerError] = React.useState('');
  const [lastScanned, setLastScanned] = React.useState('');
  const [manualCode, setManualCode] = React.useState('');
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    if (!open) {
      if (codeReaderRef.current) {
        try {
          if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach(track => track.stop());
          }
        } catch (e) {
          console.error(e);
        }
        codeReaderRef.current = null;
      }
      setScannerError('');
      setLastScanned('');
      setManualCode('');
      return;
    }

    setScannerError('');
    setLastScanned('');

    let codeReader;
    try {
      codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const timer = setTimeout(async () => {
        if (!videoRef.current) return;
        try {
          await codeReader.decodeFromVideoDevice(
            undefined,
            videoRef.current,
            (result, error) => {
              if (result) {
                const text = result.getText();
                setLastScanned(text);
                onDetected(text, targetMode);
              }
            }
          );
        } catch (err) {
          setScannerError('Camera permission not granted or device unavailable: ' + err.message);
        }
      }, 350);

      return () => {
        clearTimeout(timer);
        if (codeReaderRef.current) {
          try {
            if (videoRef.current && videoRef.current.srcObject) {
              const stream = videoRef.current.srcObject;
              stream.getTracks().forEach(track => track.stop());
            }
          } catch (e) {}
          codeReaderRef.current = null;
        }
      };
    } catch (err) {
      setScannerError('Unable to initialize optical scanner: ' + err.message);
    }
  }, [open, targetMode]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onDetected(manualCode.trim(), targetMode);
    setManualCode('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="480px">
      <DialogHeader
        icon={ScanBarcode}
        title={targetMode === 'intake' ? 'Optical Catalog Intake' : 'Optical POS Checkout'}
        description={
          targetMode === 'intake'
            ? 'Align any 1D barcode or 2D QR payload to automatically populate the product intake form.'
            : 'Point camera at any barcode in your catalog to record an instant single-unit sale.'
        }
        onClose={onClose}
      />

      <DialogBody>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '240px',
            backgroundColor: '#05070a',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sunken-deep)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            muted
            playsInline
          />

          {/* Targeting Box with corner brackets */}
          <div
            style={{
              position: 'absolute',
              inset: '18%',
              border: '2px dashed rgba(16, 185, 129, 0.8)',
              borderRadius: 'var(--radius-sm)',
              pointerEvents: 'none',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div className="scanline-bar" />
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '2px 10px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(6px)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              color: '#34d399',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span className="live-indicator" /> Optical Sensor Active
          </div>
        </div>

        {lastScanned && (
          <div
            style={{
              marginTop: '0.85rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#6ee7b7',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>Captured Code: <strong className="mono">{lastScanned}</strong></span>
          </div>
        )}

        {scannerError && (
          <div
            style={{
              marginTop: '0.85rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertTriangle size={16} />
            <span>{scannerError}</span>
          </div>
        )}

        {/* Manual Fallback Entry */}
        <form onSubmit={handleManualSubmit} style={{ marginTop: '1.15rem', display: 'flex', gap: '0.5rem' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-sunken)',
              boxShadow: 'var(--shadow-sunken-sm)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.2rem 0.6rem',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <input
              type="text"
              placeholder="Or key-in Barcode / SKU manually..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" disabled={!manualCode.trim()}>
            Simulate
          </Button>
        </form>
      </DialogBody>

      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={onClose}>
          Done
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
