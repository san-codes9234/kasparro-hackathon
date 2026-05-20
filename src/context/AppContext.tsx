import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

type Page = 'home' | 'products' | 'product-detail' | 'checkout' | 'success';

interface AppContextValue {
  currentPage: Page;
  navigate: (page: Page, productId?: string) => void;
  selectedProductId: string | null;
  isChatOpen: boolean;
  toggleChat: () => void;
  showCouponPopup: boolean;
  setShowCouponPopup: (val: boolean) => void;
  isVoiceActive: boolean;
  toggleVoice: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const APP_STORAGE_KEY = 'smartcart:app';

interface PersistedAppState {
  currentPage: Page;
  selectedProductId: string | null;
  isChatOpen: boolean;
  isVoiceActive: boolean;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const stored = useMemo(
    () =>
      readStorage<PersistedAppState>(APP_STORAGE_KEY, {
        currentPage: 'home',
        selectedProductId: null,
        isChatOpen: false,
        isVoiceActive: false,
      }),
    [],
  );
  const [currentPage, setCurrentPage] = useState<Page>(
    stored.currentPage === 'success' ? 'home' : stored.currentPage,
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(stored.selectedProductId);
  const [isChatOpen, setIsChatOpen] = useState(stored.isChatOpen);
  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(stored.isVoiceActive);

  const navigate = (page: Page, productId?: string) => {
    setCurrentPage(page);
    if (productId) setSelectedProductId(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleChat = () => setIsChatOpen(prev => !prev);
  const toggleVoice = () => setIsVoiceActive(prev => !prev);

  useEffect(() => {
    writeStorage<PersistedAppState>(APP_STORAGE_KEY, {
      currentPage: currentPage === 'success' ? 'home' : currentPage,
      selectedProductId,
      isChatOpen,
      isVoiceActive,
    });
  }, [currentPage, isChatOpen, isVoiceActive, selectedProductId]);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigate,
        selectedProductId,
        isChatOpen,
        toggleChat,
        showCouponPopup,
        setShowCouponPopup,
        isVoiceActive,
        toggleVoice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
