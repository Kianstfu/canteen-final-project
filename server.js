const express = require('express');
const { connectDB } = require('./db');

const menuRoutes = require('./routes/menu.routes');
const ordersRoutes = require('./routes/orders.routes');
const salesRoutes = require('./routes/sales.routes');
const customerRoutes = require('./routes/customer.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000; // Render ang magbibigay ng PORT

app.use(express.json()); // para maintindihan ni Express ang JSON na ipapadala ng frontend
app.use(express.static('public')); // dito nakalagay lahat ng HTML/CSS files

app.get('/', (req, res) => {
  res.redirect('/0-landing.html');
});

app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);

// Magsisimula na ang server kahit walang database (para makapag-deploy muna sa Render)
app.listen(PORT, () => {
  console.log(`🍴 Canteen server running on port ${PORT}`);
});

// Susubukan pa ring kumonekta sa database, pero hindi nito ihihinto ang server kapag nabigo
connectDB().catch((err) => {
  console.error('DB not connected (okay lang muna):', err.message);
});