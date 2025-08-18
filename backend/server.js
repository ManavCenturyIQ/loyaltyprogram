const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const scanRoute = require('./routes/scan');
const cors = require('cors');

dotenv.config();

const app = express();

const allowedOrigins = ['http://localhost:5173', 'https://loyaltyprogram.century.ae','http://localhost:5174'];
 
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
 
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));


app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use the scan route for /scan prefix
app.use('/scan', scanRoute);

app.get('/', (req, res) => res.send('Backend is running'));

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
