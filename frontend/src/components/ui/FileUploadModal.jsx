import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet, Upload, FileText, CheckCircle2,
  AlertTriangle, Download, X, ArrowRight, Loader2, Sparkles
} from 'lucide-react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from './Dialog';
import { Button } from './Button';
import { Badge } from './Badge';
import api from '../../api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://retail-ai-system-3kqt.onrender.com/api';

export function FileUploadModal({
  open,
  onClose,
  onUploadSuccess,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const resetState = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setErrorMsg('');
    setUploading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (file) => {
    setErrorMsg('');
    setUploadResult(null);

    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.tsv')) {
      setErrorMsg('Please select a valid CSV (.csv) or Excel (.xlsx, .xls) file.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setErrorMsg('Please choose a file to upload first.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/inventory/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(res.data);
      if (onUploadSuccess) {
        onUploadSuccess(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to process file. Please ensure columns match template.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = (format = 'csv') => {
    const url = `${API_BASE}/inventory/sample-template?format=${format}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="560px">
      <DialogHeader
        icon={FileSpreadsheet}
        title="Import Excel or CSV Inventory"
        description="Upload product catalogs in bulk from spreadsheet files (.xlsx, .xls, .csv)."
        onClose={handleClose}
      />

      <DialogBody>
        {/* Template Download Prompt Banner */}
        <div
          style={{
            backgroundColor: 'var(--bg-sunken)',
            boxShadow: 'var(--shadow-sunken-sm)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={15} color="var(--primary)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Need a sample template?
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleDownloadTemplate('csv')}
            >
              CSV Template
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleDownloadTemplate('xlsx')}
            >
              Excel (.xlsx)
            </Button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        {!uploadResult && (
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-sunken)',
                boxShadow: isDragging ? 'var(--shadow-glow-blue)' : 'var(--shadow-sunken)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                border: isDragging ? '2px dashed #3b82f6' : '1px dashed rgba(255, 255, 255, 0.12)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, .tsv"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e.target.files[0])}
              />

              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-card-raised)',
                  boxShadow: 'var(--shadow-raised-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  margin: '0 auto 0.75rem',
                }}
              >
                <Upload size={22} />
              </div>

              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedFile ? selectedFile.name : 'Click or Drag & Drop Excel / CSV file'}
              </div>

              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready for processing`
                  : 'Supports .xlsx, .xls, .csv files up to 10MB'}
              </div>
            </div>

            {/* Supported Columns Guide Pill */}
            <div
              style={{
                marginTop: '0.85rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--shadow-raised-xs)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.74rem',
                color: 'var(--text-secondary)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>Expected Columns:</strong>{' '}
              <span className="mono" style={{ color: 'var(--primary)' }}>
                name, category, cost_price, selling_price, current_stock, min_stock_level, barcode
              </span>
            </div>
          </div>
        )}

        {/* Upload Success Feedback Card */}
        {uploadResult && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                margin: '0 auto 0.75rem',
              }}
            >
              <CheckCircle2 size={24} />
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', margin: 0 }}>
              Bulk Catalog Import Complete
            </h4>

            <p style={{ fontSize: '0.82rem', color: '#6ee7b7', margin: '4px 0 1rem' }}>
              {uploadResult.message}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'left' }}>
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-raised-xs)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  NEW SKUS INSERTED
                </span>
                <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                  +{uploadResult.imported_count}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-raised-xs)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  EXISTING SKUS UPDATED
                </span>
                <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
                  {uploadResult.updated_count}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {errorMsg && (
          <div
            style={{
              marginTop: '0.85rem',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.78rem',
              color: '#fda4af',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}
      </DialogBody>

      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          {uploadResult ? 'Done' : 'Cancel'}
        </Button>

        {!uploadResult && (
          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            loading={uploading}
            disabled={!selectedFile || uploading}
            onClick={handleUploadSubmit}
          >
            {uploading ? 'Processing File...' : 'Import Catalog Data'}
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}