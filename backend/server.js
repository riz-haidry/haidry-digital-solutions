// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const connectDatabase = require('./config/database');
// const authRoutes = require('./routes/authRoutes');
// const inquiryRoutes = require('./routes/inquiryRoutes');
// const customerRoutes = require('./routes/customerRoutes');
// const orderRoutes = require('./routes/orderRoutes');
// const path = require('node:path');
// const portfolioRoutes = require('./routes/portfolioRoutes');

// const app = express();
// const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173').split(',').map((origin) => origin.trim());

// app.disable('x-powered-by');
// app.use(helmet());
// app.use(cors({ origin(origin, callback) {
//   if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
//   return callback(new Error('This origin is not allowed by CORS.'));
// } }));
// app.use('/uploads', (req, res, next) => {
//   res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
//   next();
// }, express.static(path.join(__dirname, 'uploads'), { maxAge: '1d', immutable: true }));
// app.use('/api/portfolio', portfolioRoutes);
// app.use(express.json({ limit: '20kb' }));
// app.use(express.urlencoded({ extended: false, limit: '20kb' }));

// app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
// app.use('/api/auth', authRoutes);
// app.use('/api/inquiries', inquiryRoutes);
// app.use('/api/customers', customerRoutes);
// app.use('/api/orders', orderRoutes);

// app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
// app.use((error, req, res, next) => {
//   if (res.headersSent) return next(error);
//   if (error.type === 'entity.too.large') return res.status(413).json({ message: 'The upload is too large. Choose a smaller image or video.' });
//   if (error.message === 'This origin is not allowed by CORS.') return res.status(403).json({ message: 'This origin is not allowed.' });
//   if (error.name === 'ValidationError') return res.status(400).json({ message: 'Please check the submitted fields.' });
//   if (error.code === 11000) return res.status(409).json({ message: 'A record with those details already exists.' });
//   if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ message: 'Request body is not valid JSON.' });
//   console.error(error);
//   return res.status(500).json({ message: 'Something went wrong. Please try again.' });
// });

// const port = Number(process.env.PORT) || 5000;
// connectDatabase().then(() => {
//   app.listen(port, () => console.info(`Haidry API listening on port ${port}`));
// }).catch((error) => {
//   console.error(error.message);
//   process.exitCode = 1;
// });


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDatabase = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const path = require('node:path');
const portfolioRoutes = require('./routes/portfolioRoutes');
const ensureAdmin = require('./utils/ensureAdmin');

const app = express();

// Hardcoded allowed origins to completely bypass environment variable mismatch issues
const allowedOrigins = [
  'https://haidry-digital-solutions.vercel.app',
  'http://localhost:5173'
];

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('This origin is not allowed by CORS.'));
} }));

app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads'), { maxAge: '1d', immutable: true }));

app.use('/api/portfolio', portfolioRoutes);
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);

app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'The upload is too large. Choose a smaller image or video.' });
  if (error.message === 'This origin is not allowed by CORS.') return res.status(403).json({ message: 'This origin is not allowed.' });
  if (error.name === 'ValidationError') return res.status(400).json({ message: 'Please check the submitted fields.' });
  if (error.code === 11000) return res.status(409).json({ message: 'A record with those details already exists.' });
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ message: 'Request body is not valid JSON.' });
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

const port = Number(process.env.PORT) || 5000;
connectDatabase()
  .then(() => ensureAdmin())
  .then(() => {
    app.listen(port, () => console.info(`Haidry API listening on port ${port}`));
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });