import { AppProvider, useApp } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/layout/Header';
import { ChatPanel } from './components/ai/ChatPanel';
import { AIFloatingButton } from './components/ai/AIFloatingButton';
import { CouponPopup } from './components/ai/CouponPopup';
import { AuroraBackground } from './components/effects/AuroraBackground';
import { NotificationToast } from './components/ui/NotificationToast';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SuccessPage } from './pages/SuccessPage';

function AppContent() {
  const { currentPage } = useApp();

  return (
    <div className="min-h-screen" style={{ background: '#030712' }}>
      {/* Global aurora canvas background */}
      <AuroraBackground />

      {/* All content above aurora */}
      <div className="relative z-10">
        <Header />

        <main>
          {currentPage === 'home'           && <HomePage />}
          {currentPage === 'products'       && <ProductsPage />}
          {currentPage === 'product-detail' && <ProductDetailPage />}
          {currentPage === 'checkout'       && <CheckoutPage />}
          {currentPage === 'success'        && <SuccessPage />}
        </main>

        <ChatPanel />
        <AIFloatingButton />
        <CouponPopup />
        <NotificationToast />
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AppProvider>
  );
}

export default App;
