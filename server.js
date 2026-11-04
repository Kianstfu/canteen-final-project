const express = require('express');
const path = require('path');
const { connectDB } = require('./db');

const menuRoutes = require('./routes/menu.routes');
const ordersRoutes = require('./routes/orders.routes');
const salesRoutes = require('./routes/sales.routes');
const customerRoutes = require('./routes/customer.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000; // Render ang magbibigay ng PORT

app.use(express.json()); // para maintindihan ni Express ang JSON na ipapadala ng frontend

// BACKEND-ONLY na ito: wala nang ine-serve na HTML website.
// Ang mga larawan lang ng menu (public/uploads) ang ine-serve, kasi
// doon sine-save ng multer at doon kumukuha ang frontend via /uploads/...
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Para kapag binuksan ang Render link, makikita mong gumagana ang API
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Canteen API is running' });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);

// Kapag walang tumugmang route
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Magsisimula na ang server kahit walang database (para makapag-deploy muna sa Render)
app.listen(PORT, () => {
  console.log(`🍴 Canteen server running on port ${PORT}`);
});

// Susubukan pa ring kumonekta sa database, pero hindi nito ihihinto ang server kapag nabigo
connectDB().catch((err) => {
  console.error('DB not connected (okay lang muna):', err.message);
});