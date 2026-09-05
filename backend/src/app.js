require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);

// 404 for anything unmatched
app.use((req, res) => {
  res.status(404).json({ status: 404, message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: 500, message: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

module.exports = app;
