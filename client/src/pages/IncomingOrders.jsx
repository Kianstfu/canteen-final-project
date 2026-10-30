import { useState } from 'react';
import { Link } from 'react-router-dom';
import usePage from '../hooks/usePage';
import usePolling from '../hooks/usePolling';
import Brand from '../components/Brand';
import ProgressTrack from '../components/ProgressTrack';
import { groupOrders, orderLabel } from '../lib/orders';
import { getCustomerId } from '../lib/session';
import '../styles/incoming.css';

const statusSteps = ['pending', 'preparing', 'ready', 'delivered'];
const badgeClass = { pending: 'badge-pending', preparing: 'badge-preparing', ready: 'badge-ready' };
const badgeText = { pending: 'Placed', preparing: 'Preparing', ready: 'On the way' };
const statusNoteText = {
  pending: 'Waiting for the kitchen.',
  preparing: '👨‍🍳 Preparing your order.',
  ready: '🛵 Your food is out for delivery!'
};

export default function IncomingOrders() {
  usePage('pg-incoming', 'Canteen — my incoming orders');

  // status: 'loading' | 'ready' | 'error'
  const [state, setState] = useState({ status: 'loading', orders: [] });
  const [busy, setBusy] = useState(null); // { id, action: 'followup' | 'cancel' }

  async function loadIncomingOrders() {
    const customerId = getCustomerId();
    try {
      const res = await fetch(`/api/customer/${customerId}/orders`);
      if (!res.ok) throw new Error('Server error');
      const rows = await res.json();
      const incoming = groupOrders(rows).filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
      setState({ status: 'ready', orders: incoming });
    } catch (err) {
      console.error(err);
      setState({ status: 'error', orders: [] });
    }
  }

  usePolling(loadIncomingOrders, 8000);

  async function sendFollowUp(orderId) {
    setBusy({ id: orderId, action: 'followup' });
    try {
      await fetch(`/api/orders/${orderId}/followup`, { method: 'PUT' });
      await loadIncomingOrders();
    } catch (err) {
      alert('Follow up could not be sent. Please try again.');
    }
    setBusy(null);
  }

  async function cancelOrder(orderId) {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setBusy({ id: orderId, action: 'cancel' });
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'This order could not be cancelled.');
        setBusy(null);
        return;
      }
      await loadIncomingOrders();
    } catch (err) {
      alert('Could not cancel the order. Please try again.');
    }
    setBusy(null);
  }

  let content;
  if (state.status === 'loading') {
    content = <p className="text-center" style={{ color: 'var(--muted)' }}>Loading...</p>;
  } else if (state.status === 'error') {
    content = (
      <div className="text-center py-5" style={{ color: 'var(--muted)' }}>
        Could not load orders. Make sure the server is running.
      </div>
    );
  } else if (state.orders.length === 0) {
    content = (
      <div className="text-center py-5" style={{ color: 'var(--muted)' }}>
        {'No incoming orders right now. '}
        <Link to="/menu" style={{ color: 'var(--mustard)', fontWeight: 600 }}>Order now →</Link>
      </div>
    );
  } else {
    content = state.orders.map((o) => {
      const stepIndex = statusSteps.indexOf(o.status);
      const followingUp = busy && busy.id === o.order_id && busy.action === 'followup';
      const cancelling = busy && busy.id === o.order_id && busy.action === 'cancel';

      return (
        <div className="card-dark p-3 mb-3" key={o.order_id}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="order-id-text">{`Order #A-${orderLabel(o.order_id)}`}</span>
            <span className={`badge ${badgeClass[o.status]}`}>{badgeText[o.status]}</span>
          </div>
          <ProgressTrack stepIndex={stepIndex} />
          <p className="text-center small fw-semibold" style={{ color: 'var(--mustard)' }}>{statusNoteText[o.status]}</p>
          <div className="small" style={{ color: 'var(--muted)' }}>{`Deliver to: ${o.building} Building, ${o.room_number}`}</div>
          <div className="small" style={{ color: 'var(--muted)' }}>{`Items: ${o.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}`}</div>
          <div className="fw-bold mt-1">{`Total: ₱${o.total_amount}`}</div>

          {o.followed_up ? (
            <div className="text-center mt-3 small fw-semibold" style={{ color: 'var(--mustard)' }}>
              📨 Canteen staff has been notified about this
            </div>
          ) : (
            <button
              className="btn btn-outline-teal-sm w-100 mt-3 followup-btn"
              disabled={followingUp}
              onClick={() => sendFollowUp(o.order_id)}
            >
              {followingUp ? 'Sending follow up...' : '🔔 I have a question / follow up'}
            </button>
          )}

          {o.status === 'pending' && (
            <button
              className="btn btn-outline-danger-sm w-100 mt-2 cancel-btn"
              disabled={cancelling}
              onClick={() => cancelOrder(o.order_id)}
            >
              {cancelling ? 'Cancelling...' : '✕ Cancel order'}
            </button>
          )}
        </div>
      );
    });
  }

  return (
    <>
      <nav className="navbar navbar-dark-custom py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <Brand icon="🛵" title="My incoming orders" />
          <div className="d-flex align-items-center gap-3">
            <Link to="/my-orders" className="text-white-50 small text-decoration-none">All orders</Link>
            <Link to="/menu" className="text-white-50 small text-decoration-none">← Back to menu</Link>
          </div>
        </div>
      </nav>

      <div className="container py-4 pb-5" style={{ maxWidth: '720px' }}>
        <div id="ordersContainer">{content}</div>
      </div>
    </>
  );
}
