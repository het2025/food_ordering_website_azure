import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 2rem)', maxWidth: 360,
      background: '#1E293B', border: '1px solid #334155', borderRadius: 16,
      boxShadow: '0 10px 40px rgba(0,0,0,0.4)', padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 12
    }}>
      <img src="/quickbite_logo.svg" alt="QuickBite Admin" style={{ width: 40, height: 40, flexShrink: 0 }} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>Install QB Admin</p>
        <p style={{ margin: 0, fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Add to home screen for quick access
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={() => setShow(false)}
          style={{ fontSize: 12, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
          Later
        </button>
        <button onClick={handleInstall}
          style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: '#3B82F6', border: 'none',
                   cursor: 'pointer', padding: '6px 12px', borderRadius: 8 }}>
          Install
        </button>
      </div>
    </div>
  );
}
