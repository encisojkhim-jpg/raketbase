require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Route Handlers
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const proposalsRoutes = require('./routes/proposals');
const contractRoutes = require('./routes/contracts');
const adminRoutes = require('./routes/admin');
const disputesRoutes = require('./routes/disputes');
const usersRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount Feature Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/proposals', proposalsRoutes);
app.use('/api/v1/contracts', contractRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/disputes', disputesRoutes);
app.use('/api/v1/users', usersRoutes);

// 404 for anything unmatched (Must stay AFTER all route mounts)
app.use((req, res) => {
  res.status(404).json({ status: 404, message: 'Not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: 500, message: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

module.exports = app;