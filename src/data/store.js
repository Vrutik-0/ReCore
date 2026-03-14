// Data persistence layer using localStorage

const PREFIX = 'coreinventory_';

export function loadData(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveData(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function generateRef(prefix) {
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `${prefix}-${num}`;
}

// Seed data
export const SEED_CATEGORIES = [
  { id: 'cat1', name: 'Raw Materials' },
  { id: 'cat2', name: 'Finished Goods' },
  { id: 'cat3', name: 'Packaging' },
  { id: 'cat4', name: 'Spare Parts' },
  { id: 'cat5', name: 'Office Supplies' },
];

export const SEED_WAREHOUSES = [
  { id: 'wh1', name: 'Main Warehouse', code: 'WH-MAIN', address: '123 Industrial Ave, Block A' },
  { id: 'wh2', name: 'Production Floor', code: 'WH-PROD', address: '123 Industrial Ave, Block B' },
  { id: 'wh3', name: 'Distribution Center', code: 'WH-DIST', address: '456 Logistics Rd' },
];

export const SEED_PRODUCTS = [
  { id: 'p1', name: 'Steel Rods', sku: 'STL-001', categoryId: 'cat1', uom: 'kg', stock: { wh1: 250, wh2: 30 }, reorderLevel: 50 },
  { id: 'p2', name: 'Aluminum Sheets', sku: 'ALM-002', categoryId: 'cat1', uom: 'pcs', stock: { wh1: 120, wh3: 45 }, reorderLevel: 30 },
  { id: 'p3', name: 'Office Chairs', sku: 'CHR-003', categoryId: 'cat2', uom: 'pcs', stock: { wh1: 80, wh3: 15 }, reorderLevel: 20 },
  { id: 'p4', name: 'Cardboard Boxes (Large)', sku: 'BOX-004', categoryId: 'cat3', uom: 'pcs', stock: { wh1: 500, wh3: 200 }, reorderLevel: 100 },
  { id: 'p5', name: 'Bearing Assembly', sku: 'BRG-005', categoryId: 'cat4', uom: 'pcs', stock: { wh1: 15, wh2: 5 }, reorderLevel: 25 },
  { id: 'p6', name: 'Copper Wire', sku: 'COP-006', categoryId: 'cat1', uom: 'meters', stock: { wh1: 600 }, reorderLevel: 100 },
  { id: 'p7', name: 'Standing Desks', sku: 'DSK-007', categoryId: 'cat2', uom: 'pcs', stock: { wh3: 35 }, reorderLevel: 10 },
  { id: 'p8', name: 'Bubble Wrap Roll', sku: 'BWR-008', categoryId: 'cat3', uom: 'rolls', stock: { wh1: 0 }, reorderLevel: 15 },
];

export const STATUSES = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];

export const MOVEMENT_TYPES = ['Receipt', 'Delivery', 'Transfer', 'Adjustment'];

export function initializeData() {
  if (!loadData('initialized')) {
    saveData('products', SEED_PRODUCTS);
    saveData('categories', SEED_CATEGORIES);
    saveData('warehouses', SEED_WAREHOUSES);
    saveData('receipts', []);
    saveData('deliveries', []);
    saveData('transfers', []);
    saveData('adjustments', []);
    saveData('movements', []);
    saveData('initialized', true);
  }
}

export function getTotalStock(product) {
  if (!product.stock) return 0;
  return Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
}

export function getStockStatus(product) {
  const total = getTotalStock(product);
  if (total === 0) return 'out-of-stock';
  if (product.reorderLevel && total <= product.reorderLevel) return 'low-stock';
  return 'in-stock';
}
