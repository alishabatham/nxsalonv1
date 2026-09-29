import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { Modal } from '../../components/Modal';
import { Package, Plus, AlertTriangle, ArrowDownRight, ArrowUpRight, History, Search } from 'lucide-react';

export const InventoryManagement = ({ readOnly = false }) => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'transactions'
  const [loading, setLoading] = useState(true);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [sellingPrice, setSellingPrice] = useState(400);
  const [costPrice, setCostPrice] = useState(200);
  const [currentStock, setCurrentStock] = useState(20);
  const [minStock, setMinStock] = useState(5);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Stock In Modal State
  const [stockInProduct, setStockInProduct] = useState(null);
  const [stockInQty, setStockInQty] = useState(10);
  const [stockInReason, setStockInReason] = useState('Stock Refill');

  // Consume Stock Modal State
  const [consumeProduct, setConsumeProduct] = useState(null);
  const [consumeQty, setConsumeQty] = useState(1);
  const [consumeReason, setConsumeReason] = useState('In-salon usage');
  const [consumeError, setConsumeError] = useState('');

  useEffect(() => {
    loadInventory();
  }, [lowStockFilter, activeTab]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const data = await fetchApi(`/inventory${lowStockFilter ? '?lowStockOnly=true' : ''}`);
        setProducts(data.products || []);
      } else {
        const data = await fetchApi('/inventory/transactions');
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      await fetchApi('/inventory', {
        method: 'POST',
        body: JSON.stringify({
          name,
          category,
          sellingPrice: Number(sellingPrice),
          costPrice: Number(costPrice),
          currentStock: Number(currentStock),
          minStock: Number(minStock)
        })
      });
      setIsAddModalOpen(false);
      resetAddForm();
      loadInventory();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const resetAddForm = () => {
    setName('');
    setCategory('General');
    setSellingPrice(400);
    setCostPrice(200);
    setCurrentStock(20);
    setMinStock(5);
    setError('');
  };

  const handleStockIn = async (e) => {
    e.preventDefault();
    try {
      await fetchApi(`/inventory/${stockInProduct._id}/stock-in`, {
        method: 'POST',
        body: JSON.stringify({
          quantity: Number(stockInQty),
          reason: stockInReason
        })
      });
      setStockInProduct(null);
      loadInventory();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConsumeStock = async (e) => {
    e.preventDefault();
    setConsumeError('');
    try {
      await fetchApi(`/inventory/${consumeProduct._id}/consume`, {
        method: 'POST',
        body: JSON.stringify({
          quantity: Number(consumeQty),
          reason: consumeReason
        })
      });
      setConsumeProduct(null);
      loadInventory();
    } catch (err) {
      setConsumeError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Inventory & Stock Control</h2>
          <p className="text-xs text-slate-500 font-medium">Product stock tracking, refill transactions, and service consumption</p>
        </div>

        {!readOnly && (
          <button
            onClick={() => { resetAddForm(); setIsAddModalOpen(true); }}
            className="flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        )}
      </div>

      {/* Tabs & Low Stock Filter */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'products' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Products Stock
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'transactions' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Stock Movement Log
          </button>
        </div>

        {activeTab === 'products' && (
          <button
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              lowStockFilter ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 border border-amber-200 text-amber-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Warnings Only</span>
          </button>
        )}
      </div>

      {/* Products Table */}
      {activeTab === 'products' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">Loading inventory products...</div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">No products found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Selling Price</th>
                    <th className="p-3.5">Cost Price</th>
                    <th className="p-3.5">Current Stock</th>
                    <th className="p-3.5">Min Stock Threshold</th>
                    <th className="p-3.5">Status</th>
                    {!readOnly && <th className="p-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => {
                    const isLowStock = p.currentStock <= p.minStock;
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                        <td className="p-3.5 text-slate-500">{p.category}</td>
                        <td className="p-3.5 font-bold text-slate-900">₹{p.sellingPrice}</td>
                        <td className="p-3.5 text-slate-500">₹{p.costPrice || 0}</td>
                        <td className="p-3.5 font-extrabold text-slate-900 text-sm">{p.currentStock}</td>
                        <td className="p-3.5 text-slate-500 font-semibold">{p.minStock}</td>
                        <td className="p-3.5">
                          {isLowStock ? (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-100 text-amber-900 flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3" /> Low Stock Alert
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                              In Stock
                            </span>
                          )}
                        </td>
                        {!readOnly && (
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setStockInProduct(p)}
                                className="bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg"
                              >
                                + Stock In
                              </button>
                              <button
                                onClick={() => { setConsumeProduct(p); setConsumeError(''); }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg"
                              >
                                Consume
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Transactions Log Table */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Quantity</th>
                  <th className="p-3.5">Stock Shift</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(t => (
                  <tr key={t._id} className="hover:bg-slate-50/60">
                    <td className="p-3.5 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-slate-900">{t.productId?.name}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        t.quantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{t.quantity}</td>
                    <td className="p-3.5 text-slate-600 font-medium">{t.previousStock} → {t.newStock}</td>
                    <td className="p-3.5 text-slate-500">{t.reason || 'N/A'}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{t.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Product to Inventory" maxWidth="max-w-md">
        <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
          {error && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{error}</div>}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Argan Shampoo 250ml"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Hair Care / Skin Care"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={sellingPrice}
                onChange={e => setSellingPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Cost Price (₹)</label>
              <input
                type="number"
                min="0"
                value={costPrice}
                onChange={e => setCostPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Initial Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={currentStock}
                onChange={e => setCurrentStock(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Min Alert Threshold *</label>
              <input
                type="number"
                required
                min="1"
                value={minStock}
                onChange={e => setMinStock(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs"
          >
            {formLoading ? 'Saving...' : 'Add Product'}
          </button>
        </form>
      </Modal>

      {/* Stock In Modal */}
      {stockInProduct && (
        <Modal isOpen={!!stockInProduct} onClose={() => setStockInProduct(null)} title="Stock In Refill" maxWidth="max-w-md">
          <form onSubmit={handleStockIn} className="space-y-3.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">{stockInProduct.name}</span>
              <span className="text-slate-600">Current Stock: {stockInProduct.currentStock}</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Add Quantity *</label>
              <input
                type="number"
                required
                min="1"
                value={stockInQty}
                onChange={e => setStockInQty(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-lg text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reason / Note</label>
              <input
                type="text"
                value={stockInReason}
                onChange={e => setStockInReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs"
            >
              Confirm Stock In
            </button>
          </form>
        </Modal>
      )}

      {/* Consume Stock Modal (Negative Stock Protection!) */}
      {consumeProduct && (
        <Modal isOpen={!!consumeProduct} onClose={() => setConsumeProduct(null)} title="Record Product Consumption" maxWidth="max-w-md">
          <form onSubmit={handleConsumeStock} className="space-y-3.5 text-xs">
            {consumeError && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{consumeError}</div>}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">{consumeProduct.name}</span>
              <span className="text-slate-600">Available Quantity: <strong className="text-slate-900">{consumeProduct.currentStock}</strong></span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Consumed Quantity *</label>
              <input
                type="number"
                required
                min="1"
                max={consumeProduct.currentStock}
                value={consumeQty}
                onChange={e => setConsumeQty(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-lg text-rose-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reason / Purpose</label>
              <input
                type="text"
                value={consumeReason}
                onChange={e => setConsumeReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs"
            >
              Record Consumption
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
