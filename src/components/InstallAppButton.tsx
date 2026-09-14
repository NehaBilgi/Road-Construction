import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppButton: React.FC = () => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstallEvent(null);
      setShowInstructions(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        title="Install Construction Pro on this computer"
        onClick={async () => {
          if (installEvent) {
            await installEvent.prompt();
            await installEvent.userChoice;
            setInstallEvent(null);
          } else {
            setShowInstructions((visible) => !visible);
          }
        }}
        className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        <span className="text-[11px] font-semibold">Install app</span>
      </button>

      {showInstructions && !installEvent && (
        <div className="absolute right-0 top-11 z-[100] w-64 rounded-2xl border border-[#1E293B] bg-[#121927] p-3 text-[11px] text-slate-300 shadow-2xl">
          <div className="font-bold text-white">Install Construction Pro</div>
          <p className="mt-1.5 leading-relaxed">
            In Chrome, open the <strong>⋮</strong> menu, choose{' '}
            <strong>Cast, save and share</strong>, then select{' '}
            <strong>Install page as app</strong>.
          </p>
          <button
            type="button"
            onClick={() => setShowInstructions(false)}
            className="mt-2 text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
