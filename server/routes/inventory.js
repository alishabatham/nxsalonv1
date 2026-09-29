const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const Notification = require('../models/Notification');
const { protect, authorize, recordAudit } = require('../middleware/auth');

// GET all products
router.get('/', protect, authorize('owner', 'receptionist'), async (req, res) => {
  try {
    const { lowStockOnly, category } = req.query;
    let filter = {};
    if (category && category !== 'All') filter.category = category;

    const products = await Product.find(filter).sort({ name: 1 });
    let result = products;

    if (lowStockOnly === 'true') {
      result = products.filter(p => p.currentStock <= p.minStock);
    }

    res.json({ success: true, count: result.length, products: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Stock Transactions Audit
router.get('/transactions', protect, authorize('owner', 'receptionist'), async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find()
      .populate('productId', 'name category')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, count: transactions.length, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Add Product (Owner only)
router.post('/', protect, authorize('owner'), async (req, res) => {
  try {
    const { name, category, sellingPrice, costPrice, currentStock, minStock } = req.body;
    if (!name || sellingPrice === undefined || currentStock === undefined) {
      return res.status(400).json({ success: false, message: 'Product name, selling price, and initial stock are required' });
    }

    if (currentStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock cannot be negative' });
    }

    const product = await Product.create({
      name,
      category: category || 'General',
      sellingPrice: Number(sellingPrice),
      costPrice: Number(costPrice) || 0,
      currentStock: Number(currentStock),
      minStock: Number(minStock) || 5,
      active: true,
      salonId: req.user.salonId
    });

    // Create initial stock in transaction
    await InventoryTransaction.create({
      productId: product._id,
      quantity: Number(currentStock),
      type: 'Stock In',
      previousStock: 0,
      newStock: Number(currentStock),
      reason: 'Initial stock setup',
      createdBy: req.user.name,
      salonId: req.user.salonId
    });

    await recordAudit({
      user: req.user,
      action: 'ADD_PRODUCT',
      entity: 'Product',
      entityId: product._id,
      details: { name, stock: currentStock },
      salonId: req.user.salonId
    });

    res.status(201).json({ success: true, product, message: 'Product added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Stock In (Add Stock, Spec Section 45)
router.post('/:id/stock-in', protect, authorize('owner', 'receptionist'), async (req, res) => {
  try {
    const { quantity, purchasePrice, reason } = req.body;
    const addQty = Number(quantity);

    if (!addQty || addQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
    }

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const prevStock = product.currentStock;
    product.currentStock += addQty;
    if (purchasePrice) product.costPrice = Number(purchasePrice);
    await product.save();

    const transaction = await InventoryTransaction.create({
      productId: product._id,
      quantity: addQty,
      type: 'Stock In',
      previousStock: prevStock,
      newStock: product.currentStock,
      reason: reason || 'Stock Refill',
      createdBy: req.user.name,
      salonId: req.user.salonId
    });

    await recordAudit({
      user: req.user,
      action: 'STOCK_IN',
      entity: 'Product',
      entityId: product._id,
      details: { added: addQty, newStock: product.currentStock },
      salonId: req.user.salonId
    });

    res.json({ success: true, product, transaction, message: 'Stock added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Stock Out / Service Consumption (Spec Section 46 & 48)
router.post('/:id/consume', protect, authorize('owner', 'receptionist', 'staff'), async (req, res) => {
  try {
    const { quantity, reason, appointmentId } = req.body;
    const consumeQty = Number(quantity);

    if (!consumeQty || consumeQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
    }

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Spec Section 48: Negative stock is NOT allowed!
    if (product.currentStock < consumeQty) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Available quantity: ${product.currentStock}` 
      });
    }

    const prevStock = product.currentStock;
    product.currentStock -= consumeQty;
    await product.save();

    const transaction = await InventoryTransaction.create({
      productId: product._id,
      quantity: -consumeQty,
      type: 'Service Consumption',
      previousStock: prevStock,
      newStock: product.currentStock,
      reason: reason || 'In-salon service usage',
      appointmentId: appointmentId || null,
      createdBy: req.user.name,
      salonId: req.user.salonId
    });

    // Check Low Stock condition (Spec Section 51)
    if (product.currentStock <= product.minStock) {
      await Notification.create({
        recipientRole: 'owner',
        type: 'Low Stock',
        title: 'Low Stock Alert',
        message: `⚠ Low Stock: ${product.name} (${product.currentStock} remaining, min threshold: ${product.minStock})`,
        deliveryStatus: 'Sent',
        salonId: req.user.salonId
      });
    }

    await recordAudit({
      user: req.user,
      action: 'STOCK_CONSUME',
      entity: 'Product',
      entityId: product._id,
      details: { consumed: consumeQty, newStock: product.currentStock },
      salonId: req.user.salonId
    });

    res.json({ success: true, product, transaction, message: 'Stock consumption recorded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
