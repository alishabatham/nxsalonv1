const mongoose = require('mongoose');
const dns = require('dns');

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGODB_URI || 'mongodb+srv://alishabatham2_db_user:alishabatham2004@cluster0.afsckde.mongodb.net/nxsalon?retryWrites=true&w=majority&authSource=admin&appName=Cluster0';

  console.log('Connecting to MongoDB Atlas Cluster in Serverless Context...');
  cachedPromise = mongoose.connect(uri, {
    bufferCommands: false, // Disable buffering so Mongoose throws immediately instead of timing out 10s if connection fails
    serverSelectionTimeoutMS: 5000
  }).then((conn) => {
    console.log('Successfully connected to MongoDB Atlas Cluster');
    return conn;
  }).catch((err) => {
    cachedPromise = null;
    console.warn('MongoDB Atlas connection failed:', err.message);
    throw err;
  });

  return cachedPromise;
};

module.exports = connectDB;
