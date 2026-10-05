import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminOverview from './components/admin/AdminOverview.jsx';
import ProductsManager from './components/admin/ProductsManager.jsx';
import PromotionsManager from './components/admin/PromotionsManager.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OrderHistoryPage from './pages/OrderHistoryPage.jsx';

function App() {
  return <Routes>
    <Route path="/" element={<CatalogPage />} />
    <Route path="/ingresar" element={<LoginPage />} />
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route element={<ProtectedRoute role="cliente" />}><Route path="/mis-pedidos" element={<OrderHistoryPage />} /></Route>
    <Route element={<ProtectedRoute role="administrador" />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="productos" element={<ProductsManager />} />
        <Route path="promociones" element={<PromotionsManager />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default App;
