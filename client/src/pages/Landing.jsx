import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import usePage from '../hooks/usePage';
import '../styles/landing.css';

const emoji = { Meals: '🍛', Snacks: '🍟', Drinks: '🧃', Desserts: '🍰' };

export default function Landing() {
  usePage('pg-landing', 'JPC Online Canteen');

  // status: 'loading' | 'ready' | 'error'
  const [menu, setMenu] = useState({ status: 'loading', items: [] });

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((items) => setMenu({ status: 'ready', items }))
      .catch(() => setMenu({ status: 'error', items: [] }));
  }, []);

  let preview;
  if (menu.status === 'loading') {
    preview = <div className="col-12 text-center muted">Loading menu...</div>;
  } else if (menu.status === 'error') {
    preview = <div className="col-12 text-center muted">Menu unavailable right now.</div>;
  } else if (!Array.isArray(menu.items) || !menu.items.length) {
    preview = <div className="col-12 text-center muted">Menu coming soon.</div>;
  } else {
    preview = menu.items.slice(0, 8).map((i) => (
      <div className="col-6 col-md-3" key={i.item_id}>
        <div className="card-dark dish h-100">
          <div className="thumb">
            {i.image_url ? <img src={i.image_url} alt="" /> : emoji[i.category] || '🍽️'}
          </div>
          <div className="p-3">
            <div className="fw-semibold">{i.item_name}</div>
            <div className="small muted mb-1">{i.category || ''}</div>
            <div className="price">{`₱${Number(i.price).toFixed(2)}`}</div>
          </div>
        </div>
      </div>
    ));
  }

  return (
    <>
      <nav className="topbar">
        <div className="container d-flex align-items-center justify-content-between py-2">
          <span className="fw-bold">🍴 JPC Canteen</span>
          <div className="d-flex align-items-center">
            <a href="#how" className="link d-none d-sm-inline">How it works</a>
            <a href="#menu" className="link d-none d-sm-inline">Menu</a>
            <a href="#about" className="link d-none d-sm-inline">About</a>
            <a href="#contact" className="link d-none d-sm-inline">Contact</a>
            <Link to="/login" className="btn btn-teal btn-sm ms-3 px-3">Log in</Link>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="container">
          <p className="text-uppercase small mb-2" style={{ letterSpacing: '.2em', color: 'var(--mustard)' }}>
            Welcome to JPC Online Canteen
          </p>
          <h1 className="font-display mb-3">Order ahead.<br />Skip the line.</h1>
          <p className="mb-4 mx-auto" style={{ maxWidth: '560px', opacity: 0.9 }}>
            Browse today's menu, place your order from your phone, and have it delivered to your building and room.
          </p>
          <Link to="/login" className="btn btn-teal btn-lg px-4 me-2">Log in / Register</Link>{' '}
          <a href="#menu" className="btn btn-outline-light2 btn-lg px-4">See the menu</a>
        </div>
      </header>

      <section className="section" id="how">
        <div className="container text-center">
          <h2 className="font-display mb-2">How it works</h2>
          <p className="muted mb-5">Four easy steps from craving to counter.</p>
          <div className="row g-4">
            <div className="col-6 col-md-3"><div className="card-dark p-4 h-100"><div className="step-num">1</div><div className="fw-semibold mb-1">Log in</div><div className="small muted">Create an account, or continue with Google.</div></div></div>
            <div className="col-6 col-md-3"><div className="card-dark p-4 h-100"><div className="step-num">2</div><div className="fw-semibold mb-1">Pick your food</div><div className="small muted">Browse meals, snacks, drinks and desserts.</div></div></div>
            <div className="col-6 col-md-3"><div className="card-dark p-4 h-100"><div className="step-num">3</div><div className="fw-semibold mb-1">Checkout</div><div className="small muted">Enter your building and room number.</div></div></div>
            <div className="col-6 col-md-3"><div className="card-dark p-4 h-100"><div className="step-num">4</div><div className="fw-semibold mb-1">Enjoy</div><div className="small muted">Track your order status in My Orders.</div></div></div>
          </div>
        </div>
      </section>

      <section className="section" id="menu" style={{ background: 'rgba(22,40,63,.35)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="font-display mb-2">Our Best Seller</h2>
            <p className="muted mb-0">A taste of what's cooking. Log in to order.</p>
          </div>
          <div className="row g-4" id="menuPreview">{preview}</div>
          <div className="text-center mt-5"><Link to="/login" className="btn btn-teal px-4">Order now</Link></div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-4 feature"><div className="icon mb-2">⚡</div><div className="fw-semibold mb-1">Fast</div><div className="small muted">Order in under a minute, no more waiting in line.</div></div>
            <div className="col-md-4 feature"><div className="icon mb-2">📍</div><div className="fw-semibold mb-1">Delivered to you</div><div className="small muted">Tell us your building and room, we bring it over.</div></div>
            <div className="col-md-4 feature"><div className="icon mb-2">📱</div><div className="fw-semibold mb-1">Works on your phone</div><div className="small muted">Install it as an app straight from your browser.</div></div>
          </div>
        </div>
      </section>

      <section className="section" id="gallery">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="font-display mb-2">Our campus</h2>
            <p className="muted mb-0">Where your next meal is waiting.</p>
          </div>
          <div className="row g-3">
            <div className="col-md-4"><div className="gal" style={{ backgroundSize: '260%', backgroundPosition: '28% 72%' }} role="img" aria-label="Campus fountain"></div></div>
            <div className="col-md-4"><div className="gal" style={{ backgroundSize: '200%', backgroundPosition: '52% 62%' }} role="img" aria-label="Campus entrance arch"></div></div>
            <div className="col-md-4"><div className="gal" style={{ backgroundSize: '220%', backgroundPosition: '100% 35%' }} role="img" aria-label="Palm trees"></div></div>
          </div>
        </div>
      </section>

      <section className="section" id="contact" style={{ background: 'rgba(22,40,63,.35)' }}>
        <div className="container">
          <div className="row g-4 justify-content-center">
            <div className="col-md-5">
              <div className="card-dark p-4 h-100">
                <h4 className="font-display mb-3">🕒 Opening hours</h4>
                <div className="info-row"><span>Monday – Friday</span><span className="muted">7:00 AM – 5:00 PM</span></div>
                <div className="info-row"><span>Saturday</span><span className="muted">7:00 AM – 12:00 PM</span></div>
                <div className="info-row"><span>Sunday</span><span className="muted">Closed</span></div>
              </div>
            </div>
            <div className="col-md-5">
              <div className="card-dark p-4 h-100">
                <h4 className="font-display mb-3">📞 Contact us</h4>
                <div className="info-row"><span>Location</span><span className="muted">JPC Canteen, Campus Grounds</span></div>
                <div className="info-row"><span>Phone</span><span className="muted">0912 464 2279</span></div>
                <div className="info-row"><span>Email</span><span className="muted">jpccanteen@gmail.com</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-5">
        <div className="container">
          <div className="cta text-center p-5">
            <h2 className="font-display mb-2">Hungry?</h2>
            <p className="muted mb-4">Create an account in seconds, or use your Google account.</p>
            <Link to="/login" className="btn btn-teal btn-lg px-5">Get started</Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="container text-center">© JPC Online Canteen Order System</div>
      </footer>
    </>
  );
}
