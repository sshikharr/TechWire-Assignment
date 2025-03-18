const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const prisma = new PrismaClient();

// Middleware setup
app.use(cors());
app.use(express.json());

// Route setup
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});