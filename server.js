const express = require('express');
const { connectDB } = require('./db');

const menuRoutes = require('./routes/menu.routes');
const ordersRoutes = require('./routes/orders.routes');
const salesRoutes = require('./routes/sales.routes');
const customerRoutes = require('./routes/customer.routes');

const app = express();
const PORT = 3000;

app.use(express.json()); // para maintindihan ni Express ang JSON na ipapadala ng frontend
app.use(express.static('public')); // ilalagay natin dito lahat ng HTML/CSS files mo mamaya

app.get('/', (req, res) => {
  res.redirect('/0-landing.html');
});

app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/customer', customerRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🍴 Canteen server running at http://localhost:${PORT}`);
  });
}).catch(() => {
  console.error('Server not started dahil hindi makakonekta sa database. I-check ang XAMPP MySQL at db.js settings.');
});