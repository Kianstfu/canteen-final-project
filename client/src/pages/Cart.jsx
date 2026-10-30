import { Link } from 'react-router-dom';
import usePage from '../hooks/usePage';
import { useCart } from '../context/CartContext';
import Brand from '../components/Brand';
import '../styles/cart.css';

export default function Cart() {
  usePage('pg-cart', 'Canteen — your cart');
  const { cart, subtotal, changeQty, removeItem } = useCart();
  const isEmpty = cart.length === 0;

  return (
    <>
      <nav className="navbar navbar-dark-custom py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <Brand />
          <Link to="/menu" className="text-white-50 small text-decoration-none">← Back to menu</Link>
        </div>
      </nav>

      <div className="container py-4 pb-5" style={{ maxWidth: '640px' }}>
        <h2 className="font-display mb-4">Your cart</h2>

        <div className="card-dark p-3 mb-3" id="cartCard">
          {isEmpty ? (
            <div className="text-center py-4" style={{ color: 'var(--muted)' }}>
              {'You have not added anything to your cart yet. '}
              <Link to="/menu" style={{ color: 'var(--maroon)', fontWeight: 600 }}>Back to menu →</Link>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={item.item_id}
                className={`d-flex align-items-center gap-3 py-3 bc-border ${index < cart.length - 1 ? 'border-bottom' : ''}`}
              >
                <div className="thumb-sm">🍽️</div>
                <div className="flex-grow-1">
                  <div className="fw-semibold small">{item.name}</div>
                  <div className="small" style={{ color: 'var(--muted)' }}>
                    {`₱${item.price} each `}<button className="remove-link" onClick={() => removeItem(index)}>remove</button>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button className="qty-btn" onClick={() => changeQty(index, -1)}>−</button>
                  <span className="fw-semibold">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => changeQty(index, 1)}>+</button>
                </div>
                <div className="line-total text-end" style={{ minWidth: '60px' }}>{`₱${item.price * item.quantity}`}</div>
              </div>
            ))
          )}
        </div>

        <div className="card-dark p-3">
          <div className="d-flex justify-content-between small py-1" style={{ color: 'var(--muted)' }}>
            <span>Subtotal</span><span id="subtotal">{`₱${subtotal}`}</span>
          </div>
          <div className="d-flex justify-content-between small py-1" style={{ color: 'var(--muted)' }}>
            <span>Delivery to room</span><span>Free</span>
          </div>
          <div className="d-flex justify-content-between fw-bold border-top bc-border py-2 mt-1" style={{ fontSize: '1.1rem' }}>
            <span>Total</span><span id="total">{`₱${subtotal}`}</span>
          </div>
        </div>

        <Link
          to="/checkout"
          className="btn btn-teal w-100 mt-4 py-2"
          id="checkoutLink"
          style={isEmpty ? { pointerEvents: 'none', opacity: 0.5 } : undefined}
        >
          Proceed to delivery details
        </Link>
      </div>
    </>
  );
}
