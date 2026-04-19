
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connection established.'))
  .catch(err => console.error('MongoDB connection failed:', err));


app.use('/api/auth', require('./routes/auth'));
app.use('/api/execute', require('./routes/execute'));
app.use('/api/game', require('./routes/game'));





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server initialized. Listening on port ${PORT}...`);
});