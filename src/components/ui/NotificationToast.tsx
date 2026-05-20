import { useEffect, useState } from 'react';
import { CheckCircle, Zap, X } from 'lucide-react';

export type ToastType = 'success' | 'ai' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const colors: Record<ToastType, { border: string; icon: string; bg: string; glow: string }> = {
  success: { border: 'rgba(16,185,129,0.4)', icon: 'text-green-400', bg: 'rgba(16,185,129,0.1)', glow: 'rgba(16,185,129,0.2)' },
  ai:      { border: 'rgba(6,182,212,0.4)',  icon: 'text-cyan-400',  bg: 'rgba(6,182,212,0.1)',  glow: 'rgba(6,182,212,0.2)' },
  warning: { border: 'rgba(245,158,11,0.4)', icon: 'text-amber-400', bg: 'rgba(245,158,11,0.1)', glow: 'rgba(245,158,11,0.2)' },
  info:    { border: 'rgba(139,92,246,0.4)', icon: 'text-purple-400',bg: 'rgba(139,92,246,0.1)', glow: 'rgba(139,92,246,0.2)' },
};

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4" />,
  ai:      <Zap className="w-4 h-4" />,
  warning: <Zap className="w-4 h-4" />,
  info:    <Zap className="w-4 h-4" />,
};

// Global toast manager
type Listener = (toasts: ToastMessage[]) => void;
let toasts: ToastMessage[] = [];
const listeners: Listener[] = [];

function notify() {
  listeners.forEach(l => l([...toasts]));
}

export const toast = {
  show(msg: Omit<ToastMessage, 'id'>) {
    const t = { ...msg, id: `t-${Date.now()}` };
    toasts = [t, ...toasts].slice(0, 5);
    notify();
    setTimeout(() => {
      toasts = toasts.filter(x => x.id !== t.id);
      notify();
    }, msg.duration ?? 4000);
  },
};

function SingleToast({ t, onDismiss }: { t: ToastMessage; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const tid = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(tid);
  }, []);

  const c = colors[t.type];

  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 max-w-xs shadow-2xl"
      style={{
        background: 'rgba(8,16,36,0.92)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${c.border}`,
        boxShadow: `0 8px 32px ${c.glow}`,
        animation: visible ? 'toastSlide 0.4s cubic-bezier(0.34,1.56,0.64,1) both' : undefined,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
    >
      <div className={`flex-shrink-0 mt-0.5 ${c.icon}`}>{icons[t.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{t.title}</p>
        {t.message && <p className="text-xs text-gray-400 mt-0.5">{t.message}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-gray-600 hover:text-white transition-colors mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function NotificationToast() {
  const [items, setItems] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener: Listener = (t) => setItems(t);
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  const dismiss = (id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  };

  return (
    <div className="fixed bottom-24 left-4 z-[70] flex flex-col gap-2 pointer-events-none">
      {items.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <SingleToast t={t} onDismiss={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
