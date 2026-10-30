import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePage from '../hooks/usePage';
import usePolling from '../hooks/usePolling';
import Brand from '../components/Brand';
import ProgressTrack from '../components/ProgressTrack';
import { groupOrders, orderLabel } from '../lib/orders';
import { clearSession, getCustomerId, getCustomerName } from '../lib/session';
import '../styles/myorders.css';

const statusSteps = ['pending', 'preparing', 'ready', 'delivered'];
const badgeClass = { pending: 'badge-pending', preparing: 'badge-preparing', ready: 'badge-ready', delivered: 'badge-delivered', cancelled: 'badge-cancelled' };
const badgeText = { pending: 'Placed', preparing: 'Preparing', ready: 'On the way', delivered: 'Delivered', cancelled: 'Cancelled' };

// Bituin-bituin para mag-rate ng delivered na order
function RatingWidget({ orderId, onRated }) {
  const [value, setValue] = useState(0);

  async function rate(n) {
    setValue(n);
    try {
      await fetch(`/api/orders/${orderId}/rating`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: n })
      });
      onRated();
    } catch (err) {
      alert('Rating could not be saved. Please try again.');
    }
  }

  return (
    <div className="rating-widget">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`star${n <= value ? ' filled' : ''}`} onClick={() => rate(n)}>★</span>
      ))}
    </div>
  );
}

export default function MyOrders() {
  usePage('pg-myorders', 'Canteen — my orders');
  const navigate = useNavigate();

  // status: 'loading' | 'ready' | 'error'
  const [state, setState] = useState({ status: 'loading', orders: [] });
  const [removingId, setRemovingId] = useState(null);

  async function loadMyOrders() {
    const customerId = getCustomerId();
    try {
      const res = await fetch(`/api/customer/${customerId}/orders`);
      if (!res.ok) throw new Error('Server error');
      const rows = await res.json();
      setState({ status: 'ready', orders: groupOrders(rows) });
    } catch (err) {
      console.error(err);
      setState({ status: 'error', orders: [] });
    }
  }

  usePolling(loadMyOrders, 10000);

  function handleLogout(e) {
    e.preventDefault();
    clearSession();
    navigate('/');
  }

  async function removeOrder(orderId) {
    if (!window.confirm('Remove this order from your history? This cannot be undone.')) return;
    setRemovingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'This order could not be removed.');
        setRemovingId(null);
        return;
      }
      await loadMyOrders();
      setRemovingId(null);
    } catch (err) {
      alert('Could not remove the order. Please try again.');
      setRemovingId(null);
    }
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
        {'You have no orders yet. '}
        <Link to="/menu" style={{ color: 'var(--mustard)', fontWeight: 600 }}>Order now →</Link>
      </div>
    );
  } else {
    content = state.orders.map((o) => {
      const stepIndex = statusSteps.indexOf(o.status);
      const dateStr = new Date(o.date_placed).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const canDelete = o.status === 'delivered' || o.status === 'cancelled';
      const removing = removingId === o.order_id;

      return (
        <div className="card-dark p-3 mb-3" key={o.order_id}>
          <div className="d-flex justify-content-between align-items-center">
            <span className="order-id-text">{`Order #A-${orderLabel(o.order_id)}`}</span>
            <span className={`badge ${badgeClass[o.status]}`}>{badgeText[o.status]}</span>
          </div>
          <div className="small" style={{ color: 'var(--muted)' }}>{dateStr}</div>

          {o.status === 'cancelled' ? (
            <p className="text-center small my-3" style={{ color: 'var(--muted)' }}>This order was cancelled.</p>
          ) : (
            <ProgressTrack stepIndex={stepIndex} />
          )}

          <div className="small" style={{ color: 'var(--muted)' }}>{`Deliver to: ${o.building} Building, ${o.room_number}`}</div>
          <div className="small" style={{ color: 'var(--muted)' }}>{`Items: ${o.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}`}</div>
          <div className="fw-bold mt-1">{`Total: ₱${o.total_amount}`}</div>

          {o.status === 'delivered' && (
            o.rating ? (
              <>
                <div className="small mt-2" style={{ color: 'var(--muted)' }}>Your rating:</div>
                <div className="rating-widget submitted">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`star${n <= o.rating ? ' filled' : ''}`}>★</span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="small mt-2" style={{ color: 'var(--muted)' }}>How was your order? Tap to rate:</div>
                <RatingWidget orderId={o.order_id} onRated={loadMyOrders} />
              </>
            )
          )}

          {canDelete && (
            <button
              className="btn btn-sm btn-outline-danger mt-2 delete-order-btn"
              disabled={removing}
              onClick={() => removeOrder(o.order_id)}
            >
              {removing ? 'Removing...' : '🗑 Remove from history'}
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
          <Brand />
          <div className="d-flex align-items-center gap-3">
            <span id="customerName" className="text-white-50 small">{getCustomerName()}</span>
            <Link to="/menu" className="text-white-50 small text-decoration-none">← Back to menu</Link>
            <a href="/" onClick={handleLogout} className="text-white-50 small text-decoration-none">Log out</a>
          </div>
        </div>
      </nav>

      <div className="container py-4 pb-5" style={{ maxWidth: '720px' }}>
        <h2 className="font-display mb-4">My orders</h2>
        <div id="ordersContainer">{content}</div>
      </div>
    </>
  );
}
