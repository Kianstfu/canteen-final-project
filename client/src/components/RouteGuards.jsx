import { Navigate } from 'react-router-dom';
import { isAdminLoggedIn, isCustomerLoggedIn } from '../lib/session';

// Dating: if (sessionStorage.getItem('customer_logged_in') !== 'true') -> customer-login.html
export function RequireCustomer({ children }) {
  return isCustomerLoggedIn() ? children : <Navigate to="/login" replace />;
}

// Dating: if (sessionStorage.getItem('admin_logged_in') !== 'true') -> admin-login.html
export function RequireAdmin({ children }) {
  return isAdminLoggedIn() ? children : <Navigate to="/admin/login" replace />;
}
