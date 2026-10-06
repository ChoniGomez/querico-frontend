import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminOverview from './components/admin/AdminOverview.jsx';
import ProductsManager from './components/admin/ProductsManager.jsx';
import CategoriesManager from './components/admin/CategoriesManager.jsx';
import PromotionsManager from './components/admin/PromotionsManager.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OrderHistoryPage from './pages/OrderHistoryPage.jsx';
import AccountProfilePage from './pages/AccountProfilePage.jsx';

function App() {
  return <Routes>
    <Route path="/" element={<CatalogPage />} />
    <Route path="/ingresar" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}><Route path="/mi-cuenta" element={<AccountProfilePage />} /></Route>
    <Route element={<ProtectedRoute role="customer" />}><Route path="/mis-pedidos" element={<OrderHistoryPage />} /></Route>
    <Route element={<ProtectedRoute role="admin" />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="categorias" element={<CategoriesManager />} />
        <Route path="productos" element={<ProductsManager />} />
        <Route path="promociones" element={<PromotionsManager />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default App;
