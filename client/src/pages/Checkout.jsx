import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePage from '../hooks/usePage';
import { useCart } from '../context/CartContext';
import Brand from '../components/Brand';
import { getCustomerId, setLastOrder } from '../lib/session';
import '../styles/checkout.css';

const BUILDINGS = ['Darius', 'Kate', 'Nelrose'];
const SELECTED_PAYMENT = 'Cash on delivery';

export default function Checkout() {
  usePage('pg-checkout', 'Canteen — delivery details');
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [name, setName] = useState('');
  const [building, setBuilding] = useState('Darius');
  const [room, setRoom] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (cart.length === 0) return;

    setPlacing(true);
    setError('');

    const orderData = {
      customer_id: getCustomerId() || null,
      customer_name: name,
      building,
      room_number: room,
      contact_number: contact,
      notes,
      payment_method: SELECTED_PAYMENT,
      items: cart.map((i) => ({ item_id: i.item_id, quantity: i.quantity, price: i.price }))
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) throw new Error('Order could not be saved. Please try again.');

      const result = await res.json();

      setLastOrder({
        order_id: result.order_id,
        total: result.total_amount,
        building,
        room,
        payment: SELECTED_PAYMENT,
        items: cart
      });

      navigate('/order-confirmation');
      clearCart();
    } catch (err) {
      setError(err.message || 'There was a problem saving your order. Make sure the server is running.');
      setPlacing(false);
    }
  }

  return (
    <>
      <nav className="navbar navbar-dark-custom py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <Brand />
          <Link to="/cart" className="text-white-50 small text-decoration-none">← Back to cart</Link>
        </div>
      </nav>

      <div className="container py-4 pb-5" style={{ maxWidth: '520px' }}>
        <h2 className="font-display mb-1">Where should we deliver this?</h2>
        <p className="mb-4 small" style={{ color: 'var(--muted)' }}>Confirm your delivery details and we'll bring your order over.</p>

        <form id="checkoutForm" onSubmit={handleSubmit}>
          <div className="card-dark p-4 mb-3">

            <div className="mb-3">
              <label htmlFor="name" className="form-label-dark form-label">Your name</label>
              <input id="name" name="customer_name" type="text" className="form-control form-control-dark"
                placeholder="e.g. Juan Dela Cruz" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <label className="form-label-dark form-label">Building</label>
            <div className="row g-2 mb-3" id="buildingGrid">
              {BUILDINGS.map((b) => (
                <div className="col-4" key={b}>
                  <div
                    className={`option-btn${building === b ? ' selected-building' : ''} py-2`}
                    onClick={() => setBuilding(b)}
                  >
                    {b}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-3">
              <label htmlFor="room" className="form-label-dark form-label">Room number</label>
              <input id="room" name="room_number" type="text" className="form-control form-control-dark"
                placeholder="e.g. Room 204" required value={room} onChange={(e) => setRoom(e.target.value)} />
            </div>

            <div className="mb-3">
              <label htmlFor="contact" className="form-label-dark form-label">Contact number (optional)</label>
              <input id="contact" name="contact_number" type="tel" className="form-control form-control-dark"
                placeholder="09XX XXX XXXX" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>

            <div className="mb-3">
              <label htmlFor="notes" className="form-label-dark form-label">Notes for the canteen (optional)</label>
              <textarea id="notes" name="notes" rows="2" className="form-control form-control-dark"
                placeholder="e.g. less rice, no ice" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
            </div>

            <label className="form-label-dark form-label">Payment method</label>
            <div className="option-btn selected-pay py-2 mb-2" style={{ cursor: 'default' }}>💵 Cash on delivery</div>
          </div>

          <div className="card-dark p-3" id="summaryCard">
            {cart.length === 0 ? (
              <p className="small mb-0" style={{ color: 'var(--muted)' }}>
                {'Your cart is empty. '}
                <Link to="/menu" style={{ color: 'var(--maroon)', fontWeight: 600 }}>Back to menu →</Link>
              </p>
            ) : (
              <>
                {cart.map((i) => (
                  <div className="d-flex justify-content-between small py-1" key={i.item_id}>
                    <span style={{ color: 'var(--muted)' }}>{`${i.name} x${i.quantity}`}</span>
                    <span>{`₱${i.price * i.quantity}`}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between fw-bold border-top bc-border py-2 mt-1" style={{ fontSize: '1.1rem' }}>
                  <span>Total</span><span>{`₱${total}`}</span>
                </div>
              </>
            )}
          </div>

          <button type="submit" className="btn btn-teal w-100 mt-4 py-2" id="placeOrderBtn" disabled={placing || cart.length === 0}>
            {placing ? 'Placing order...' : 'Place order'}
          </button>
          <div className="alert alert-danger mt-2 py-2 px-3 small" id="errorMsg" style={{ display: error ? 'block' : 'none' }}>{error}</div>
        </form>
      </div>
    </>
  );
}
