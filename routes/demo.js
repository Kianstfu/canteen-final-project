// ─────────────────────────────────────────
// DEMO ACCOUNTS — para ma-test ang login kahit WALANG database.
// Gumagana lang kapag naka-set ang environment variable DEMO_MODE=true
// (sa Render: Environment tab). Alisin/i-set sa false kapag may totoong DB na.
// ─────────────────────────────────────────
const DEMO_ENABLED = String(process.env.DEMO_MODE).toLowerCase() === 'true';

const DEMO_CUSTOMER = {
  username: 'demo_user',
  password: 'demo123',
  customer_id: 0,            // 0 = hindi totoong row sa DB
  full_name: 'Demo Customer'
};

const DEMO_ADMIN = {
  username: 'demo_admin',
  password: 'admin123',
  full_name: 'Demo Admin'
};

module.exports = { DEMO_ENABLED, DEMO_CUSTOMER, DEMO_ADMIN };