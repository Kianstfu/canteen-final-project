import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAdmin, RequireCustomer } from './components/RouteGuards';

import Landing from './pages/Landing';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import IncomingOrders from './pages/IncomingOrders';
import AdminOrders from './pages/AdminOrders';
import AdminSales from './pages/AdminSales';
import AdminMenu from './pages/AdminMenu';

// Ang Login page lang ang gumagamit ng Firebase, kaya hiwalay ang chunk nito
// para hindi bumigat ang unang load ng ibang pages.
const Login = lazy(() => import('./pages/Login'));

// Mga lumang URL (galing sa HTML version) -> bagong route, para gumana pa rin ang lumang bookmarks/links.
const LEGACY_ROUTES = {
  '/0-landing': '/',
  '/customer-login': '/login',
  '/customer-register': '/register',
  '/admin-login': '/admin/login',
  '/1-menu': '/menu',
  '/3-checkout': '/checkout',
  '/4-order-confirmation': '/order-confirmation',
  '/5-admin-orders': '/admin/orders',
  '/6-admin-sales': '/admin/sales',
  '/7-admin-menu': '/admin/menu'
};

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/menu" element={<RequireCustomer><Menu /></RequireCustomer>} />
        <Route path="/cart" element={<RequireCustomer><Cart /></RequireCustomer>} />
        <Route path="/checkout" element={<RequireCustomer><Checkout /></RequireCustomer>} />
        <Route path="/order-confirmation" element={<RequireCustomer><OrderConfirmation /></RequireCustomer>} />
        <Route path="/my-orders" element={<RequireCustomer><MyOrders /></RequireCustomer>} />
        <Route path="/incoming-orders" element={<RequireCustomer><IncomingOrders /></RequireCustomer>} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/orders" element={<RequireAdmin><AdminOrders /></RequireAdmin>} />
        <Route path="/admin/sales" element={<RequireAdmin><AdminSales /></RequireAdmin>} />
        <Route path="/admin/menu" element={<RequireAdmin><AdminMenu /></RequireAdmin>} />

        {Object.entries(LEGACY_ROUTES).flatMap(([from, to]) => [
          <Route key={from} path={from} element={<Navigate to={to} replace />} />,
          <Route key={from + '.html'} path={from + '.html'} element={<Navigate to={to} replace />} />
        ])}
        <Route path="/cart.html" element={<Navigate to="/cart" replace />} />
        <Route path="/my-orders.html" element={<Navigate to="/my-orders" replace />} />
        <Route path="/incoming-orders.html" element={<Navigate to="/incoming-orders" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
