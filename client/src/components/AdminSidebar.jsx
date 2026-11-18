import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession } from '../lib/session';
import '../styles/adminsidebar.css';

// Ang sidebar ng tatlong admin pages. active: 'orders' | 'sales' | 'menu'
// logoutTo: kung saan pupunta pagka-log out (landing sa orders, admin login sa iba)
// Sa desktop: nakikita palagi sa gilid. Sa cellphone: naka-hide, may burger (☰) sa taas.
export default function AdminSidebar({ active, logoutTo }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = (e) => {
    e.preventDefault();
    clearSession();
    navigate(logoutTo);
  };

  // Isara gamit ang Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Top bar na may burger — cellphone lang */}
      <div className="admin-topbar">
        <button
          type="button"
          className="admin-burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
        <span className="font-display admin-topbar-title">
          <span className="icon-badge">🍴</span> Canteen Admin
        </span>
      </div>

      {/* Dark na background kapag bukas ang menu sa cellphone */}
      <div className={`admin-backdrop${open ? ' show' : ''}`} onClick={close} />

      <div className={`sidebar-dark admin-sidebar p-3 flex-shrink-0${open ? ' open' : ''}`}>
        <div className="d-flex align-items-center gap-2 font-display fs-5 text-white mb-4 px-1 admin-sidebar-brand">
          <span className="icon-badge">🍴</span> Canteen Admin
        </div>
        <nav className="nav flex-column gap-1">
          <Link to="/admin/orders" onClick={close} className={`nav-link ${active === 'orders' ? 'active ' : ''}rounded px-3 py-2`}>
            Order queue
          </Link>
          <Link to="/admin/sales" onClick={close} className={`nav-link ${active === 'sales' ? 'active ' : ''}rounded px-3 py-2`}>
            Sales report
          </Link>
          <Link to="/admin/menu" onClick={close} className={`nav-link ${active === 'menu' ? 'active ' : ''}rounded px-3 py-2`}>
            Manage menu
          </Link>
          <a
            href={logoutTo}
            onClick={handleLogout}
            className="nav-link rounded px-3 py-2 mt-3"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Log out
          </a>
        </nav>
      </div>
    </>
  );
}