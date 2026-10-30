import { useState } from 'react';
import { Link } from 'react-router-dom';
import usePage from '../hooks/usePage';
import usePolling from '../hooks/usePolling';
import Brand from '../components/Brand';
import ProgressTrack from '../components/ProgressTrack';
import { getLastOrder } from '../lib/session';
import '../styles/confirm.css';

const statusSteps = ['pending', 'preparing', 'ready', 'delivered'];

function statusNote(status) {
  if (status === null) return '';
  if (status === 'ready') return '🛵 Your order is on its way!';
  if (status === 'delivered') return '✅ Your order has been delivered.';
  if (status === 'preparing') return '👨‍🍳 Your order is being prepared.';
  return 'Waiting for the kitchen.';
}

export default function OrderConfirmation() {
  usePage('pg-confirm', 'Canteen — order placed');

  const [lastOrder] = useState(getLastOrder);
  const [status, setStatus] = useState(null);

  async function refreshStatus() {
    if (!lastOrder) return;
    try {
      const res = await fetch(`/api/orders/${lastOrder.order_id}/status`);
      if (!res.ok) return;
      const data = await res.json();
      if (statusSteps.indexOf(data.status) < 0) return;
      setStatus(data.status);
    } catch (err) {
      console.error(err);
    }
  }

  usePolling(refreshStatus, lastOrder ? 8000 : 0);

  const stepIndex = status === null ? -1 : statusSteps.indexOf(status);

  return (
    <>
      <nav className="navbar navbar-dark-custom py-3">
        <div className="container">
          <Brand />
        </div>
      </nav>

      <div className="container py-4 pb-5 text-center" style={{ maxWidth: '520px' }}>
        <div id="pageWrap">
          {!lastOrder ? (
            <div className="card-dark p-4">
              <p style={{ color: 'var(--muted)' }}>No recent order found.</p>
              <Link to="/menu" className="btn btn-outline-dark-custom mt-2">Back to menu</Link>
            </div>
          ) : (
            <>
              <div className="check-badge mx-auto mb-3">✓</div>
              <h2 className="font-display">Order placed!</h2>
              <div className="order-no my-2">{`Order #${lastOrder.order_id}`}</div>

              <div className="card-dark p-4 text-start mt-3">
                <ProgressTrack stepIndex={stepIndex} />
                <p id="statusNote" className="text-center small mt-2" style={{ color: 'var(--muted)' }}>{statusNote(status)}</p>

                <div className="mt-4">
                  <div className="d-flex justify-content-between border-bottom bc-border py-2 small">
                    <span style={{ color: 'var(--muted)' }}>Deliver to</span>
                    <span>{`${lastOrder.building} Building, ${lastOrder.room}`}</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom bc-border py-2 small">
                    <span style={{ color: 'var(--muted)' }}>Payment</span>
                    <span>{lastOrder.payment}</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom bc-border py-2 small">
                    <span style={{ color: 'var(--muted)' }}>Items</span>
                    <span>{lastOrder.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}</span>
                  </div>
                  <div className="d-flex justify-content-between py-2 small">
                    <span style={{ color: 'var(--muted)' }}>Total</span>
                    <span className="fw-bold">{`₱${lastOrder.total}`}</span>
                  </div>
                </div>
              </div>

              <Link to="/menu" className="btn btn-outline-dark-custom w-100 mt-4">Order something else</Link>
              <Link to="/my-orders" className="btn btn-teal w-100 mt-2">View all my orders →</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
