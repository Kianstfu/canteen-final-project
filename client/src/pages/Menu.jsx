import { useState } from 'react';
import { Link } from 'react-router-dom';
import usePage from '../hooks/usePage';
import usePolling from '../hooks/usePolling';
import { useCart } from '../context/CartContext';
import Brand from '../components/Brand';
import { getCustomerId } from '../lib/session';
import '../styles/menu.css';

const categoryEmoji = { Meals: '🍛', Snacks: '🍟', Drinks: '🧃', Desserts: '🍰' };
const CATEGORIES = ['All', 'Meals', 'Snacks', 'Drinks', 'Desserts'];

export default function Menu() {
  usePage('pg-menu', 'Canteen — order online');
  const { totalQty, addToCart } = useCart();

  // status: 'loading' | 'ready' | 'error'
  const [menu, setMenu] = useState({ status: 'loading', items: [] });
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [incomingCount, setIncomingCount] = useState(0);

  async function loadMenu() {
    try {
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error('Server error');
      const items = await res.json();
      setMenu({ status: 'ready', items });
    } catch (err) {
      console.error(err);
      setMenu({ status: 'error', items: [] });
    }
  }

  async function updateIncomingBadge() {
    const customerId = getCustomerId();
    if (!customerId) return;
    try {
      const res = await fetch(`/api/customer/${customerId}/orders`);
      if (!res.ok) return;
      const rows = await res.json();
      const uniqueOrderIds = new Set();
      rows.forEach((r) => {
        if (r.status !== 'delivered' && r.status !== 'cancelled') uniqueOrderIds.add(r.order_id);
      });
      setIncomingCount(uniqueOrderIds.size);
    } catch (err) {
      console.error(err);
    }
  }

  usePolling(loadMenu, 0);
  usePolling(updateIncomingBadge, 10000);

  // Mga filter (category + search)
  let filtered = activeCategory === 'All' ? menu.items : menu.items.filter((i) => i.category === activeCategory);
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((i) => i.item_name.toLowerCase().includes(q));
  }

  let content;
  if (menu.status === 'loading') {
    content = <div className="col-12 text-center py-5" style={{ color: 'var(--muted)' }}>Loading menu...</div>;
  } else if (menu.status === 'error') {
    content = (
      <div className="col-12 text-center py-5" style={{ color: 'var(--muted)' }}>
        Could not load the menu. Make sure the server is running (node server.js).
      </div>
    );
  } else if (menu.items.length === 0) {
    content = <div className="col-12 text-center py-5" style={{ color: 'var(--muted)' }}>No items available on the menu yet.</div>;
  } else if (filtered.length === 0) {
    content = <div className="col-12 text-center py-5" style={{ color: 'var(--muted)' }}>No items in this category.</div>;
  } else {
    content = filtered.map((item) => (
      <div className="col-6 col-md-4" key={item.item_id}>
        <div className="card-dark h-100 d-flex flex-column">
          <div className="thumb-gradient d-flex align-items-center justify-content-center">
            {item.image_url ? (
              <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            ) : (
              categoryEmoji[item.category] || '🍽️'
            )}
          </div>
          <div className="p-3 d-flex flex-column flex-grow-1">
            <div className="fw-semibold">{item.item_name}</div>
            <div className="small mb-2 flex-grow-1" style={{ color: 'var(--muted)' }}>{item.description || item.category}</div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="price-text">{`₱${item.price}`}</span>
              <button
                className="add-btn"
                onClick={() => addToCart({ item_id: Number(item.item_id), item_name: item.item_name, price: Number(item.price) })}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    ));
  }

  return (
    <>
      <nav className="navbar navbar-dark-custom sticky-top py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <Brand />
          <div className="d-flex align-items-center gap-3">
            <Link to="/incoming-orders" className="pill-btn px-3 py-2 small" id="incomingBtn">
              🛵 Incoming <span className="count-badge ms-1" id="incomingCount">{incomingCount}</span>
            </Link>
            <Link to="/my-orders" className="text-white-50 small text-decoration-none">My orders</Link>
            <Link to="/cart" className="pill-btn px-3 py-2 small">
              🛒 Cart <span className="count-badge ms-1" id="cartCount">{totalQty}</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-4 pb-5">
        <div className="text-center mb-4">
          <div className="text-uppercase small fw-bold mb-1" style={{ color: 'var(--mustard-dark)', letterSpacing: '0.1em' }}>
            Open now · 7:00 AM – 5:00 PM
          </div>
          <h1 className="font-display">What are you craving today?</h1>
          <p style={{ color: 'var(--muted)' }}>Order now, pick your delivery room, and we'll bring it straight to you.</p>
        </div>

        <div className="mb-3">
          <input
            type="text"
            id="menuSearch"
            className="form-control"
            placeholder="🔍 Search for an item..."
            style={{ maxWidth: '340px', margin: '0 auto', background: '#F0F6FB', color: '#16283F', border: '1px solid var(--border)' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="d-flex gap-2 mb-4 flex-nowrap overflow-auto pb-1" id="categoryTabs">
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              className={`cat-tab${activeCategory === cat ? ' active' : ''} px-3 py-2`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </div>
          ))}
        </div>

        <div id="menuContainer" className="row g-3">{content}</div>
      </div>
    </>
  );
}
