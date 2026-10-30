import { useRef, useState } from 'react';
import usePage from '../hooks/usePage';
import usePolling from '../hooks/usePolling';
import AdminSidebar from '../components/AdminSidebar';
import { groupOrders, orderLabel } from '../lib/orders';
import '../styles/adminorders.css';

const statusFlow = {
  pending: { next: 'preparing', label: 'Start preparing', badgeClass: 'badge-pending', badgeText: 'Pending', btnClass: 'pending' },
  preparing: { next: 'ready', label: 'Mark as ready', badgeClass: 'badge-preparing', badgeText: 'Preparing', btnClass: 'preparing' },
  ready: { next: 'delivered', label: 'Mark as delivered', badgeClass: 'badge-ready', badgeText: 'Ready', btnClass: 'ready' },
  delivered: { next: null, label: 'Delivered ✓', badgeClass: 'badge-delivered', badgeText: 'Delivered', btnClass: '' },
  cancelled: { next: null, label: 'Cancelled by customer', badgeClass: 'badge-cancelled', badgeText: 'Cancelled', btnClass: '' }
};

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // dalawang maikling "ding" tone, parang notification bell
    [880, 1108].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const startTime = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  } catch (err) {
    console.error('Could not play notification sound:', err);
  }
}

export default function AdminOrders() {
  usePage('pg-adminorders', 'Canteen admin — order queue');

  // status: 'loading' | 'ready' | 'error'
  const [state, setState] = useState({ status: 'loading', orders: [], loaded: false });
  const [updatingId, setUpdatingId] = useState(null);
  const knownOrderIds = useRef(null); // null = unang beses pa lang, wag mag-notify

  async function loadOrders() {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Server error');
      const rows = await res.json();
      const orders = groupOrders(rows);

      // i-detect kung may bagong order na dumating mula nung huling check
      const currentIds = new Set(orders.map((o) => o.order_id));
      if (knownOrderIds.current !== null) {
        const hasNewOrder = [...currentIds].some((id) => !knownOrderIds.current.has(id));
        if (hasNewOrder) playNotificationSound();
      }
      knownOrderIds.current = currentIds;

      setState({ status: 'ready', orders, loaded: true });
    } catch (err) {
      console.error(err);
      setState((prev) => ({ ...prev, status: 'error' }));
    }
  }

  usePolling(loadOrders, 10000);

  async function advanceStatus(orderId, nextStatus) {
    setUpdatingId(orderId);
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      await loadOrders();
    } catch (err) {
      alert('Could not update the status.');
    }
    setUpdatingId(null);
  }

  let grid;
  if (state.status === 'loading') {
    grid = <div className="col-12 text-center py-5" style={{ color: 'var(--muted)' }}>Loading orders...</div>;
  } else if (state.status === 'error') {
    grid = (
      <div className="col-12 text-center py-5" style={{ color: 'var(--muted)' }}>
        Could not load orders. Make sure the server is running.
      </div>
    );
  } else if (state.orders.length === 0) {
    grid = <div className="col-12 text-center py-5" style={{ color: 'var(--muted)' }}>No orders yet.</div>;
  } else {
    grid = state.orders.map((o) => {
      const flow = statusFlow[o.status] || statusFlow.pending;
      const cancelledClass = o.status === 'cancelled' ? 'cancelled' : '';
      const deliveredClass = o.status === 'delivered' ? 'delivered' : '';
      const followedStyle = o.followed_up ? { borderColor: '#E85D3D', boxShadow: '0 0 0 2px rgba(232,93,61,0.3)' } : undefined;

      return (
        <div className="col-md-6 col-lg-4" key={o.order_id}>
          <div className={`card-dark order-card p-3 ${deliveredClass} ${cancelledClass}`} data-order-id={o.order_id} style={followedStyle}>
            {o.followed_up ? (
              <div className="small fw-bold rounded px-2 py-1 mb-2" style={{ background: '#5A2A1E', color: '#FFB199' }}>
                ⚠️ Customer sent a follow-up!
              </div>
            ) : null}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="order-id-text">{`#A-${orderLabel(o.order_id)}`}</span>
              <span className={`badge ${flow.badgeClass}`}>{flow.badgeText}</span>
            </div>
            <div className="small mb-2" style={{ color: 'var(--muted)' }}>
              {`${o.building} Building, ${o.room_number} · ${o.customer_name}`}
            </div>
            <ul className="small mb-2 ps-3">
              {o.items.map((i, idx) => <li key={idx}>{`${i.qty}x ${i.name}`}</li>)}
            </ul>
            {o.notes ? (
              <div className="small mb-2 p-2 rounded" style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid var(--mustard)', color: 'var(--mustard)' }}>
                📝 <b>Note:</b>{` ${o.notes}`}
              </div>
            ) : null}
            <div className="fw-bold mb-2">{`Total: ₱${o.total_amount}`}</div>
            {o.rating ? (
              <div className="small mb-2" style={{ color: '#F5C518' }}>
                {`${'★'.repeat(o.rating)}${'☆'.repeat(5 - o.rating)} `}
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{`(${o.rating}/5)`}</span>
              </div>
            ) : null}
            <button
              className={`btn w-100 status-btn ${flow.btnClass}`}
              disabled={!flow.next || updatingId === o.order_id}
              data-next={flow.next || ''}
              onClick={() => advanceStatus(o.order_id, flow.next)}
            >
              {flow.label}
            </button>
          </div>
        </div>
      );
    });
  }

  return (
    <div className="d-flex">
      <AdminSidebar active="orders" logoutTo="/" />

      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="font-display mb-0">Order queue</h2>
          <span className="small" style={{ color: 'var(--muted)' }} id="orderCount">
            {state.loaded ? `${state.orders.length} total orders` : 'Loading...'}
          </span>
        </div>

        <div className="row g-3" id="queueGrid">{grid}</div>
      </div>
    </div>
  );
}
