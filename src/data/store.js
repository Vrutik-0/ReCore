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

// Generate auto-increment reference: <WarehouseCode>/<Operation>/<ID>
// e.g. WH/IN/0001 or WH/OUT/0002
export function generateOperationRef(warehouseCode, operation, existingRefs) {
  const prefix = `${warehouseCode}/${operation}/`;
  let maxId = 0;
  existingRefs.forEach(ref => {
    if (ref.startsWith(prefix)) {
      const num = parseInt(ref.slice(prefix.length), 10);
      if (num > maxId) maxId = num;
    }
  });
  const nextId = String(maxId + 1).padStart(4, '0');
  return `${prefix}${nextId}`;
}

export const SEED_CATEGORIES = [
  { id: 'cat1', name: 'Raw Materials' },
  { id: 'cat2', name: 'Finished Goods' },
  { id: 'cat3', name: 'Packaging' },
  { id: 'cat4', name: 'Spare Parts' },
  { id: 'cat5', name: 'Office Supplies' },
];

export const SEED_WAREHOUSES = [
  { id: 'wh1', name: 'Main Warehouse', code: 'WH', address: '123 Industrial Ave, Block A' },
  { id: 'wh2', name: 'Production Floor', code: 'PF', address: '123 Industrial Ave, Block B' },
  { id: 'wh3', name: 'Distribution Center', code: 'DC', address: '456 Logistics Rd' },
];

export const SEED_LOCATIONS = [
  { id: 'loc1', name: 'Stock Room 1', code: 'Stock1', warehouseId: 'wh1' },
  { id: 'loc2', name: 'Stock Room 2', code: 'Stock2', warehouseId: 'wh1' },
  { id: 'loc3', name: 'Production Area', code: 'ProdA', warehouseId: 'wh2' },
  { id: 'loc4', name: 'Dispatch Zone', code: 'Dspch', warehouseId: 'wh3' },
];

export const SEED_PRODUCTS = [
  { id: 'p1', name: 'Office Desk',      sku: 'DESK001', categoryId: 'cat2', uom: 'pcs',    unitCost: 8500,  stock: { wh1: 24, wh3: 6 },   reserved: { wh1: 4 }, reorderLevel: 10 },
  { id: 'p2', name: 'Conference Table', sku: 'TBL002',  categoryId: 'cat2', uom: 'pcs',    unitCost: 22000, stock: { wh1: 8 },             reserved: {},         reorderLevel: 3  },
  { id: 'p3', name: 'Ergonomic Chair',  sku: 'CHR003',  categoryId: 'cat2', uom: 'pcs',    unitCost: 6200,  stock: { wh1: 42, wh3: 18 },   reserved: { wh1: 5 }, reorderLevel: 15 },
  { id: 'p4', name: 'Steel Rods',       sku: 'STL004',  categoryId: 'cat1', uom: 'kg',     unitCost: 185,   stock: { wh1: 320, wh2: 80 },  reserved: {},         reorderLevel: 100},
  { id: 'p5', name: 'Copper Wire',      sku: 'COP005',  categoryId: 'cat1', uom: 'meters', unitCost: 95,    stock: { wh1: 850 },           reserved: {},         reorderLevel: 200},
  { id: 'p6', name: 'Cardboard Boxes',  sku: 'BOX006',  categoryId: 'cat3', uom: 'pcs',    unitCost: 45,    stock: { wh1: 600, wh3: 200 }, reserved: { wh3: 50 },reorderLevel: 150},
  { id: 'p7', name: 'Bubble Wrap Roll', sku: 'BWR007',  categoryId: 'cat3', uom: 'rolls',  unitCost: 380,   stock: { wh1: 0 },             reserved: {},         reorderLevel: 20 },
  { id: 'p8', name: 'Bearing Assembly', sku: 'BRG008',  categoryId: 'cat4', uom: 'pcs',    unitCost: 1200,  stock: { wh2: 18 },            reserved: {},         reorderLevel: 25 },
];

// Demo receipts: mix of statuses
// Today = 2026-03-14
export const SEED_RECEIPTS = [
  {
    id: 'rec1', ref: 'WH/IN/0001', status: 'Done',
    contact: 'Azure Interior', warehouseId: 'wh1', responsible: 'admin',
    scheduleDate: '2026-02-10', createdAt: '2026-02-08T09:00:00.000Z',
    items: [{ productId: 'p1', quantity: 10 }, { productId: 'p3', quantity: 20 }],
  },
  {
    id: 'rec2', ref: 'WH/IN/0002', status: 'Done',
    contact: 'Azure Interior', warehouseId: 'wh1', responsible: 'admin',
    scheduleDate: '2026-02-25', createdAt: '2026-02-22T10:30:00.000Z',
    items: [{ productId: 'p4', quantity: 200 }, { productId: 'p5', quantity: 500 }],
  },
  {
    id: 'rec3', ref: 'WH/IN/0003', status: 'Done',
    contact: 'Contoso Supplies', warehouseId: 'wh3', responsible: 'admin',
    scheduleDate: '2026-03-05', createdAt: '2026-03-03T08:00:00.000Z',
    items: [{ productId: 'p6', quantity: 300 }, { productId: 'p2', quantity: 5 }],
  },
  {
    id: 'rec4', ref: 'WH/IN/0004', status: 'Ready',
    contact: 'Fabrikam Inc', warehouseId: 'wh1', responsible: 'admin',
    scheduleDate: '2026-03-14', createdAt: '2026-03-12T11:00:00.000Z',
    items: [{ productId: 'p7', quantity: 30 }, { productId: 'p8', quantity: 20 }],
  },
  {
    id: 'rec5', ref: 'WH/IN/0005', status: 'Draft',
    contact: 'Global Supplies Co', warehouseId: 'wh1', responsible: 'admin',
    scheduleDate: '2026-03-10', createdAt: '2026-03-09T14:00:00.000Z',
    items: [{ productId: 'p1', quantity: 15 }],
  },
  {
    id: 'rec6', ref: 'WH/IN/0006', status: 'Draft',
    contact: 'SteelMart Ltd', warehouseId: 'wh2', responsible: 'admin',
    scheduleDate: '2026-03-20', createdAt: '2026-03-13T09:00:00.000Z',
    items: [{ productId: 'p4', quantity: 100 }, { productId: 'p8', quantity: 30 }],
  },
];

// Demo deliveries
export const SEED_DELIVERIES = [
  {
    id: 'del1', ref: 'WH/OUT/0001', status: 'Done',
    contact: 'Azure Interior', deliveryAddress: '45 Business Park, Suite 200', warehouseId: 'wh1', responsible: 'admin',
    scheduleDate: '2026-02-15', createdAt: '2026-02-13T10:00:00.000Z',
    items: [{ productId: 'p1', quantity: 5 }, { productId: 'p3', quantity: 10 }],
  },
  {
    id: 'del2', ref: 'WH/OUT/0002', status: 'Done',
    contact: 'Northwind Corp', deliveryAddress: '88 Commerce St, Floor 3', warehouseId: 'wh3', responsible: 'admin',
    scheduleDate: '2026-03-01', createdAt: '2026-02-27T09:00:00.000Z',
    items: [{ productId: 'p6', quantity: 100 }],
  },
  {
    id: 'del3', ref: 'WH/OUT/0003', status: 'Ready',
    contact: 'Contoso Ltd', deliveryAddress: '22 Main Ave, Warehouse B', warehouseId: 'wh1', responsible: 'admin',
    scheduleDate: '2026-03-14', createdAt: '2026-03-12T13:00:00.000Z',
    items: [{ productId: 'p1', quantity: 4 }, { productId: 'p2', quantity: 2 }],
  },
  {
    id: 'del4', ref: 'WH/OUT/0004', status: 'Waiting',
    contact: 'Timber Works', deliveryAddress: '7 Industrial Road', warehouseId: 'wh1', responsible: 'admin',
    scheduleDate: '2026-03-14', createdAt: '2026-03-11T15:00:00.000Z',
    items: [{ productId: 'p7', quantity: 15 }, { productId: 'p3', quantity: 8 }],
  },
  {
    id: 'del5', ref: 'WH/OUT/0005', status: 'Draft',
    contact: 'BlueSky Retail', deliveryAddress: '99 Market Street', warehouseId: 'wh3', responsible: 'admin',
    scheduleDate: '2026-03-09', createdAt: '2026-03-08T10:00:00.000Z',
    items: [{ productId: 'p6', quantity: 80 }],
  },
  {
    id: 'del6', ref: 'WH/OUT/0006', status: 'Draft',
    contact: 'Metro Furnishings', deliveryAddress: '34 Park Lane, Block C', warehouseId: 'wh1', responsible: 'admin',
    scheduleDate: '2026-03-18', createdAt: '2026-03-13T16:00:00.000Z',
    items: [{ productId: 'p1', quantity: 6 }, { productId: 'p3', quantity: 12 }],
  },
];

// Demo movements (corresponding to Done receipts/deliveries)
export const SEED_MOVEMENTS = [
  // From rec1
  { id: 'm1',  type: 'Receipt',  ref: 'WH/IN/0001',  productId: 'p1', productName: 'Office Desk',      from: 'Vendor',        to: 'WH/Stock1', quantity: 10,  date: '2026-02-10T09:30:00.000Z' },
  { id: 'm2',  type: 'Receipt',  ref: 'WH/IN/0001',  productId: 'p3', productName: 'Ergonomic Chair',   from: 'Vendor',        to: 'WH/Stock1', quantity: 20,  date: '2026-02-10T09:30:00.000Z' },
  // From rec2
  { id: 'm3',  type: 'Receipt',  ref: 'WH/IN/0002',  productId: 'p4', productName: 'Steel Rods',        from: 'Vendor',        to: 'WH/Stock1', quantity: 200, date: '2026-02-25T10:00:00.000Z' },
  { id: 'm4',  type: 'Receipt',  ref: 'WH/IN/0002',  productId: 'p5', productName: 'Copper Wire',       from: 'Vendor',        to: 'WH/Stock1', quantity: 500, date: '2026-02-25T10:00:00.000Z' },
  // From rec3
  { id: 'm5',  type: 'Receipt',  ref: 'WH/IN/0003',  productId: 'p6', productName: 'Cardboard Boxes',   from: 'Vendor',        to: 'DC/Dspch',  quantity: 300, date: '2026-03-05T08:30:00.000Z' },
  { id: 'm6',  type: 'Receipt',  ref: 'WH/IN/0003',  productId: 'p2', productName: 'Conference Table',  from: 'Vendor',        to: 'DC/Dspch',  quantity: 5,   date: '2026-03-05T08:30:00.000Z' },
  // From del1
  { id: 'm7',  type: 'Delivery', ref: 'WH/OUT/0001', productId: 'p1', productName: 'Office Desk',      from: 'WH/Stock1',     to: 'Vendor',    quantity: 5,   date: '2026-02-15T11:00:00.000Z' },
  { id: 'm8',  type: 'Delivery', ref: 'WH/OUT/0001', productId: 'p3', productName: 'Ergonomic Chair',  from: 'WH/Stock1',     to: 'Vendor',    quantity: 10,  date: '2026-02-15T11:00:00.000Z' },
  // From del2
  { id: 'm9',  type: 'Delivery', ref: 'WH/OUT/0002', productId: 'p6', productName: 'Cardboard Boxes',  from: 'DC/Dspch',      to: 'Vendor',    quantity: 100, date: '2026-03-01T09:30:00.000Z' },
  // Adjustment
  { id: 'm10', type: 'Adjustment', ref: 'ADJ-0001',  productId: 'p8', productName: 'Bearing Assembly', from: 'PF/ProdA',      to: 'PF/ProdA',  quantity: -3,  date: '2026-03-08T14:00:00.000Z' },
];

export const SEED_ADJUSTMENTS = [
  {
    id: 'adj1', ref: 'ADJ-0001',
    productId: 'p8', productName: 'Bearing Assembly',
    warehouseId: 'wh2', oldQty: 21, newQty: 18, difference: -3,
    reason: 'Damaged in transit', date: '2026-03-08T14:00:00.000Z', status: 'Done',
  },
];

export const RECEIPT_STATUSES = ['Draft', 'Ready', 'Done'];
export const DELIVERY_STATUSES = ['Draft', 'Waiting', 'Ready', 'Done'];
export const STATUSES = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];
export const MOVEMENT_TYPES = ['Receipt', 'Delivery', 'Adjustment'];

export function initializeData() {
  if (!loadData('initialized_v3')) {
    saveData('products',    SEED_PRODUCTS);
    saveData('categories',  SEED_CATEGORIES);
    saveData('warehouses',  SEED_WAREHOUSES);
    saveData('locations',   SEED_LOCATIONS);
    saveData('receipts',    SEED_RECEIPTS);
    saveData('deliveries',  SEED_DELIVERIES);
    saveData('adjustments', SEED_ADJUSTMENTS);
    saveData('movements',   SEED_MOVEMENTS);
    // Seed a demo user
    const existingUsers = loadData('users') || [];
    if (!existingUsers.find(u => u.loginId === 'admin')) {
      existingUsers.push({
        id: 'user_demo',
        loginId: 'admin',
        email: 'admin@demo.com',
        password: 'Admin@123',
        role: 'Inventory Manager',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
      saveData('users', existingUsers);
    }
    saveData('initialized_v3', true);
  }
}

export function getTotalStock(product) {
  if (!product.stock) return 0;
  return Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
}

export function getTotalReserved(product) {
  if (!product.reserved) return 0;
  return Object.values(product.reserved).reduce((sum, qty) => sum + qty, 0);
}

export function getFreeToUse(product) {
  return getTotalStock(product) - getTotalReserved(product);
}

export function getStockStatus(product) {
  const total = getTotalStock(product);
  if (total === 0) return 'out-of-stock';
  if (product.reorderLevel && total <= product.reorderLevel) return 'low-stock';
  return 'in-stock';
}
