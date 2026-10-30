import { Link, useNavigate } from 'react-router-dom';
import { clearSession } from '../lib/session';

// Ang sidebar ng tatlong admin pages. active: 'orders' | 'sales' | 'menu'
// logoutTo: kung saan pupunta pagka-log out (landing sa orders, admin login sa iba)
export default function AdminSidebar({ active, logoutTo }) {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    clearSession();
    navigate(logoutTo);
  };

  return (
    <div className="sidebar-dark p-3 flex-shrink-0">
      <div className="d-flex align-items-center gap-2 font-display fs-5 text-white mb-4 px-1">
        <span className="icon-badge">🍴</span> Canteen Admin
      </div>
      <nav className="nav flex-column gap-1">
        <Link to="/admin/orders" className={`nav-link ${active === 'orders' ? 'active ' : ''}rounded px-3 py-2`}>
          Order queue
        </Link>
        <Link to="/admin/sales" className={`nav-link ${active === 'sales' ? 'active ' : ''}rounded px-3 py-2`}>
          Sales report
        </Link>
        <Link to="/admin/menu" className={`nav-link ${active === 'menu' ? 'active ' : ''}rounded px-3 py-2`}>
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
  );
}
