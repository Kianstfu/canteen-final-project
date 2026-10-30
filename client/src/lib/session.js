// Mga helper para sa sessionStorage (login state). Parehong keys ang gamit
// ng orihinal na HTML version, kaya pareho ang behavior.

export const isCustomerLoggedIn = () => sessionStorage.getItem('customer_logged_in') === 'true';
export const getCustomerId = () => sessionStorage.getItem('customer_id');
export const getCustomerName = () => sessionStorage.getItem('customer_name') || '';

export function setCustomerSession(customerId, fullName) {
  sessionStorage.setItem('customer_logged_in', 'true');
  sessionStorage.setItem('customer_id', customerId);
  sessionStorage.setItem('customer_name', fullName);
}

export const isAdminLoggedIn = () => sessionStorage.getItem('admin_logged_in') === 'true';

export function setAdminSession(username) {
  sessionStorage.setItem('admin_logged_in', 'true');
  sessionStorage.setItem('admin_username', username);
}

export const clearSession = () => sessionStorage.clear();

export function getLastOrder() {
  try {
    return JSON.parse(sessionStorage.getItem('last_order') || 'null');
  } catch {
    return null;
  }
}
export const setLastOrder = (order) => sessionStorage.setItem('last_order', JSON.stringify(order));
