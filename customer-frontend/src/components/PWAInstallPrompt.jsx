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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm
                    bg-white border border-orange-200 rounded-2xl shadow-xl px-4 py-3
                    flex items-center gap-3 animate-fade-in">
      <img src="/quickbite_logo.svg" alt="QuickBite" className="w-10 h-10 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-tight">Install QuickBite</p>
        <p className="text-xs text-gray-500 truncate">Add to home screen for quick access</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => setShow(false)}
          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg"
        >
          Later
        </button>
        <button
          onClick={handleInstall}
          className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600
                     px-3 py-1.5 rounded-lg transition-colors"
        >
          Install
        </button>
      </div>
    </div>
  );
}
