const dns = require('dns');

// Force IPv4 and public Google/Cloudflare DNS for instant SRV lookup
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Salon = require('./models/Salon');
const Service = require('./models/Service');
const Staff = require('./models/Staff');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const Appointment = require('./models/Appointment');
const Bill = require('./models/Bill');
const Payment = require('./models/Payment');
const InventoryTransaction = require('./models/InventoryTransaction');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://alishabatham2_db_user:alishabatham2004@cluster0.afsckde.mongodb.net/nxsalon?retryWrites=true&w=majority&authSource=admin&appName=Cluster0';
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing collections if desired, or check existing
    const existingSalon = await Salon.findOne();
    if (existingSalon) {
      console.log('Database already contains salon setup. Skipping duplicate seed.');
      process.exit(0);
    }

    // 1. Create Salon
    const salon = await Salon.create({
      name: 'NX Studio & Salon',
      logo: '',
      phone: '9876543210',
      email: 'owner@nxsalon.com',
      address: '102 Luxury Boulevard, Bandra West',
      city: 'Mumbai',
      gstNumber: '27AAAAA0000A1Z5',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      isSetupCompleted: true,
      workingHours: [
        { day: 'Monday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { day: 'Tuesday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { day: 'Wednesday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { day: 'Thursday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { day: 'Friday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { day: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { day: 'Sunday', isOpen: false, openTime: '10:00', closeTime: '20:00' }
      ]
    });

    // 2. Create Users (Owner, Receptionist)
    const ownerUser = await User.create({
      name: 'Ananya Roy (Owner)',
      email: 'owner@nxsalon.com',
      mobile: '9876543210',
      password: 'password123',
      role: 'owner',
      salonId: salon._id
    });

    const receptionistUser = await User.create({
      name: 'Pooja Verma (Receptionist)',
      email: 'reception@nxsalon.com',
      mobile: '9876543211',
      password: 'password123',
      role: 'receptionist',
      salonId: salon._id
    });

    // 3. Create Services
    const haircutService = await Service.create({
      name: 'Premium Haircut & Styling',
      category: 'Hair',
      price: 300,
      duration: 30,
      description: 'Precision haircut with hair wash and blow dry styling',
      active: true,
      salonId: salon._id
    });

    const hairColourService = await Service.create({
      name: 'Global Hair Colour',
      category: 'Hair',
      price: 1200,
      duration: 90,
      description: 'Full head premium ammonia-free hair colouring',
      active: true,
      salonId: salon._id
    });

    const facialService = await Service.create({
      name: 'Gold Glow Facial',
      category: 'Facial',
      price: 800,
      duration: 60,
      description: 'Deep cleansing gold facial for radiant skin',
      active: true,
      salonId: salon._id
    });

    const spaService = await Service.create({
      name: 'Head & Shoulder Spa',
      category: 'Spa',
      price: 600,
      duration: 45,
      description: 'Relaxing herbal oil massage and hair steam',
      active: true,
      salonId: salon._id
    });

    // 4. Create Staff Users & Profiles
    const staff1User = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@nxsalon.com',
      mobile: '9876543212',
      password: 'password123',
      role: 'staff',
      salonId: salon._id
    });

    const staff2User = await User.create({
      name: 'Amit Kumar',
      email: 'amit@nxsalon.com',
      mobile: '9876543213',
      password: 'password123',
      role: 'staff',
      salonId: salon._id
    });

    const staff1 = await Staff.create({
      userId: staff1User._id,
      name: 'Rahul Sharma',
      mobile: '9876543212',
      email: 'rahul@nxsalon.com',
      role: 'Stylist',
      assignedServices: [haircutService._id, hairColourService._id],
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      workingHours: { openTime: '10:00', closeTime: '19:00' },
      salonId: salon._id
    });

    const staff2 = await Staff.create({
      userId: staff2User._id,
      name: 'Amit Kumar',
      mobile: '9876543213',
      email: 'amit@nxsalon.com',
      role: 'Stylist',
      assignedServices: [haircutService._id, facialService._id, spaService._id],
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      workingHours: { openTime: '10:00', closeTime: '19:00' },
      salonId: salon._id
    });

    // 5. Create Products & Initial Inventory
    const shampoo = await Product.create({
      name: 'Argan Oil Nourishing Shampoo (250ml)',
      category: 'Hair Care',
      sellingPrice: 450,
      costPrice: 250,
      currentStock: 20,
      minStock: 5,
      active: true,
      salonId: salon._id
    });

    const conditioner = await Product.create({
      name: 'Smooth & Silk Conditioner (200ml)',
      category: 'Hair Care',
      sellingPrice: 400,
      costPrice: 200,
      currentStock: 3, // Low stock trigger!
      minStock: 5,
      active: true,
      salonId: salon._id
    });

    await InventoryTransaction.create({
      productId: shampoo._id,
      quantity: 20,
      type: 'Stock In',
      previousStock: 0,
      newStock: 20,
      reason: 'Initial setup stock',
      createdBy: 'Owner',
      salonId: salon._id
    });

    // 6. Sample Customer & Initial Appointment
    const customer = await Customer.create({
      name: 'Vikram Singh',
      mobile: '9812345678',
      email: 'vikram@example.com',
      notes: 'Prefers mild tea during service',
      salonId: salon._id
    });

    const todayStr = new Date().toISOString().split('T')[0];

    const appt = await Appointment.create({
      appointmentNumber: 'APT-1001',
      customerId: customer._id,
      serviceId: haircutService._id,
      staffId: staff1._id,
      date: todayStr,
      startTime: '11:00',
      endTime: '11:30',
      duration: 30,
      status: 'Completed',
      bookingSource: 'Walk-in',
      checkInTime: new Date(),
      actualStartTime: new Date(),
      actualEndTime: new Date(),
      salonId: salon._id
    });

    // Bill for the appointment
    const bill = await Bill.create({
      invoiceNumber: 'INV-2026-00001',
      appointmentId: appt._id,
      customerId: customer._id,
      items: [
        {
          itemType: 'service',
          itemId: haircutService._id,
          name: haircutService.name,
          quantity: 1,
          unitPrice: haircutService.price,
          discount: 0,
          finalAmount: haircutService.price
        }
      ],
      subtotal: 300,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxEnabled: false,
      grandTotal: 300,
      paidAmount: 300,
      pendingAmount: 0,
      paymentStatus: 'Paid',
      salonId: salon._id
    });

    await Payment.create({
      billId: bill._id,
      customerId: customer._id,
      amount: 300,
      method: 'Cash',
      paidAt: new Date(),
      createdBy: 'Pooja Verma',
      salonId: salon._id
    });

    console.log('Seed completed successfully into MongoDB Atlas!');
    process.exit(0);

  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
};

seedData();
