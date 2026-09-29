const mongoose = require('mongoose');
const dns = require('dns');

// Use Google & Cloudflare DNS to guarantee SRV lookups work on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback if DNS override fails
}
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://alishabatham2_db_user:alishabatham2004@cluster0.afsckde.mongodb.net/nxsalon?retryWrites=true&w=majority&authSource=admin&appName=Cluster0';

  try {
    console.log('Connecting to MongoDB Atlas Cluster with Google/Cloudflare DNS...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('Successfully connected to MongoDB Atlas Cluster');
  } catch (err) {
    console.warn('MongoDB Atlas connection warning:', err.message);
    console.log('Attempting secondary fallback connection...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('Connected to fallback MongoMemoryServer at:', mongoUri);
    } catch (memErr) {
      console.error('Fatal Database Connection Error:', memErr.message);
    }
  }
};

module.exports = connectDB;
