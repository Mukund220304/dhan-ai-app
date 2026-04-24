import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadExpenseFile } from '../services/api';
import { UploadCloud, FileText, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AIExtract() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type === 'text/csv' || selected.type.startsWith('image/')) {
        setFile(selected);
        setError('');
      } else {
        setError('Please select a valid CSV or Image (PNG/JPG) file.');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadExpenseFile(formData);
      setSuccess(true);
      setTimeout(() => navigate('/transactions'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing CSV with AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up" style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>AI Data Extraction</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Upload your bank statement CSV or a screenshot of a receipt/payment. Gemini AI will analyze, clean, and extract the transaction automatically.</p>
      </div>

      <div className="surface-card" style={{ padding: 48, textAlign: 'center' }}>
        {success ? (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={32} color="var(--success)" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Extraction Complete!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Redirecting to your transactions...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UploadCloud size={40} color="var(--primary)" />
            </div>
            
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Select Document or Image</h3>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Supported formats: .csv, .png, .jpg, .jpeg</p>
            </div>

            <input 
              type="file" 
              accept=".csv,image/png,image/jpeg,image/jpg" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              id="file-upload" 
            />
            
            {!file ? (
              <label htmlFor="file-upload" className="btn-ghost" style={{ padding: '12px 24px' }}>
                Browse Files
              </label>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <FileText size={20} color="var(--primary)" />
                <span style={{ fontWeight: 500, fontSize: 14 }}>{file.name}</span>
                <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}>×</button>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', background: 'var(--danger-bg)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500 }}>
                <AlertTriangle size={18} />
                {error}
              </div>
            )}

            {file && (
              <button onClick={handleUpload} disabled={loading} className="btn-primary" style={{ width: '100%', maxWidth: 300, padding: 16, marginTop: 16 }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                {loading ? 'AI is analyzing data...' : 'Extract Data'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
