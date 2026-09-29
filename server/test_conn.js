const mongoose = require('mongoose');
const dns = require('dns');

// Force IPv4 and public Google DNS
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const testAtlas = async () => {
  // Test primary standard Atlas URI
  const uri = 'mongodb+srv://alishabatham2_db_user:alishabatham2004@cluster0.afsckde.mongodb.net/nxsalon?retryWrites=true&w=majority&authSource=admin&appName=Cluster0';

  console.log('Testing Atlas connection...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('SUCCESS: Connected to MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.log('SRV connect error:', err.message);

    // Try standard non-srv fallback host
    const directUri = 'mongodb://alishabatham2_db_user:alishabatham2004@cluster0-shard-00-00.afsckde.mongodb.net:27017,cluster0-shard-00-01.afsckde.mongodb.net:27017,cluster0-shard-00-02.afsckde.mongodb.net:27017/nxsalon?ssl=true&replicaSet=atlas-afsckde-shard-0&authSource=admin';
    try {
      console.log('Testing direct replica set connection...');
      await mongoose.connect(directUri, { serverSelectionTimeoutMS: 5000 });
      console.log('SUCCESS: Connected via direct replica set!');
      process.exit(0);
    } catch (err2) {
      console.log('Direct connect error:', err2.message);
      process.exit(1);
    }
  }
};

testAtlas();
