import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
    /* pwa-prompt class in index.css positions it above BottomNav on mobile */
    <div className="pwa-prompt fixed left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-blue-100 shadow-xl rounded-2xl">
        {/* Logo */}
        <img
          src="/quickbite_logo.svg"
          alt="QB Delivery"
          className="flex-shrink-0 w-10 h-10 rounded-xl"
        />

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight text-gray-900">Install QB Delivery</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">Add to home screen for quick access</p>
        </div>

        {/* Buttons */}
        <div className="flex items-center flex-shrink-0 gap-1">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg active:scale-95"
          >
            Install
          </button>
          <button
            onClick={() => setShow(false)}
            className="flex items-center justify-center w-8 h-8 text-gray-400 rounded-lg hover:bg-gray-100 active:scale-95"
            aria-label="Dismiss"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
