import { createContext, useContext, useReducer, useEffect } from 'react';
import { loadData, saveData, generateId, generateOperationRef, initializeData, getTotalStock } from '../data/store';

const AppContext = createContext(null);

const KEYS = ['products', 'categories', 'warehouses', 'locations', 'receipts', 'deliveries', 'adjustments', 'movements'];

function loadState() {
  initializeData();
  const state = {};
  KEYS.forEach(k => { state[k] = loadData(k) || []; });
  return state;
}

function getWarehouseCode(warehouses, warehouseId) {
  const wh = warehouses.find(w => w.id === warehouseId);
  return wh ? wh.code : 'WH';
}

function reducer(state, action) {
  switch (action.type) {
    // Products
    case 'ADD_PRODUCT': {
      const product = { ...action.payload, id: generateId() };
      return { ...state, products: [...state.products, product] };
    }
    case 'UPDATE_PRODUCT': {
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p),
      };
    }
    case 'DELETE_PRODUCT': {
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };
    }

    // Categories
    case 'ADD_CATEGORY': {
      return { ...state, categories: [...state.categories, { id: generateId(), ...action.payload }] };
    }
    case 'UPDATE_CATEGORY': {
      return {
        ...state,
        categories: state.categories.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c),
      };
    }
    case 'DELETE_CATEGORY': {
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
    }

    // Warehouses
    case 'ADD_WAREHOUSE': {
      return { ...state, warehouses: [...state.warehouses, { id: generateId(), ...action.payload }] };
    }
    case 'UPDATE_WAREHOUSE': {
      return {
        ...state,
        warehouses: state.warehouses.map(w => w.id === action.payload.id ? { ...w, ...action.payload } : w),
      };
    }
    case 'DELETE_WAREHOUSE': {
      return { ...state, warehouses: state.warehouses.filter(w => w.id !== action.payload) };
    }

    // Locations
    case 'ADD_LOCATION': {
      return { ...state, locations: [...state.locations, { id: generateId(), ...action.payload }] };
    }
    case 'UPDATE_LOCATION': {
      return {
        ...state,
        locations: state.locations.map(l => l.id === action.payload.id ? { ...l, ...action.payload } : l),
      };
    }
    case 'DELETE_LOCATION': {
      return { ...state, locations: state.locations.filter(l => l.id !== action.payload) };
    }

    // Receipts - WH/IN/xxxx format, Draft > Ready > Done
    case 'ADD_RECEIPT': {
      const whCode = getWarehouseCode(state.warehouses, action.payload.warehouseId);
      const existingRefs = state.receipts.map(r => r.ref);
      const ref = generateOperationRef(whCode, 'IN', existingRefs);
      const receipt = {
        id: generateId(),
        ref,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      return { ...state, receipts: [...state.receipts, receipt] };
    }
    case 'UPDATE_RECEIPT': {
      return {
        ...state,
        receipts: state.receipts.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r),
      };
    }
    // Move Draft -> Ready (TODO button)
    case 'READY_RECEIPT': {
      return {
        ...state,
        receipts: state.receipts.map(r => r.id === action.payload && r.status === 'Draft' ? { ...r, status: 'Ready' } : r),
      };
    }
    // Move Ready -> Done (Validate button) and update stock
    case 'VALIDATE_RECEIPT': {
      const receipt = state.receipts.find(r => r.id === action.payload);
      if (!receipt || receipt.status !== 'Ready') return state;
      const products = [...state.products];
      const movements = [...state.movements];
      receipt.items.forEach(item => {
        const pIdx = products.findIndex(p => p.id === item.productId);
        if (pIdx !== -1) {
          const stock = { ...products[pIdx].stock };
          stock[receipt.warehouseId] = (stock[receipt.warehouseId] || 0) + item.quantity;
          products[pIdx] = { ...products[pIdx], stock };
          movements.push({
            id: generateId(),
            type: 'Receipt',
            ref: receipt.ref,
            productId: item.productId,
            productName: products[pIdx].name,
            from: 'Vendor',
            to: receipt.locationId || receipt.warehouseId,
            quantity: item.quantity,
            date: new Date().toISOString(),
          });
        }
      });
      return {
        ...state,
        products,
        movements,
        receipts: state.receipts.map(r => r.id === action.payload ? { ...r, status: 'Done' } : r),
      };
    }

    // Deliveries - WH/OUT/xxxx format, Draft > Waiting > Ready > Done
    case 'ADD_DELIVERY': {
      const whCode = getWarehouseCode(state.warehouses, action.payload.warehouseId);
      const existingRefs = state.deliveries.map(d => d.ref);
      const ref = generateOperationRef(whCode, 'OUT', existingRefs);
      const delivery = {
        id: generateId(),
        ref,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      return { ...state, deliveries: [...state.deliveries, delivery] };
    }
    case 'UPDATE_DELIVERY': {
      return {
        ...state,
        deliveries: state.deliveries.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d),
      };
    }
    // Check stock - if any product out of stock, move to Waiting, else Ready
    case 'CHECK_DELIVERY': {
      const delivery = state.deliveries.find(d => d.id === action.payload);
      if (!delivery || delivery.status !== 'Draft') return state;
      let hasOutOfStock = false;
      delivery.items.forEach(item => {
        const p = state.products.find(pr => pr.id === item.productId);
        if (!p || (p.stock[delivery.warehouseId] || 0) < item.quantity) {
          hasOutOfStock = true;
        }
      });
      const newStatus = hasOutOfStock ? 'Waiting' : 'Ready';
      return {
        ...state,
        deliveries: state.deliveries.map(d => d.id === action.payload ? { ...d, status: newStatus } : d),
      };
    }
    case 'READY_DELIVERY': {
      return {
        ...state,
        deliveries: state.deliveries.map(d => d.id === action.payload && d.status === 'Waiting' ? { ...d, status: 'Ready' } : d),
      };
    }
    case 'VALIDATE_DELIVERY': {
      const delivery = state.deliveries.find(d => d.id === action.payload);
      if (!delivery || delivery.status !== 'Ready') return state;
      const products = [...state.products];
      const movements = [...state.movements];
      let canDeliver = true;
      delivery.items.forEach(item => {
        const p = products.find(pr => pr.id === item.productId);
        if (!p || (p.stock[delivery.warehouseId] || 0) < item.quantity) {
          canDeliver = false;
        }
      });
      if (!canDeliver) return state;
      delivery.items.forEach(item => {
        const pIdx = products.findIndex(p => p.id === item.productId);
        if (pIdx !== -1) {
          const stock = { ...products[pIdx].stock };
          stock[delivery.warehouseId] = (stock[delivery.warehouseId] || 0) - item.quantity;
          products[pIdx] = { ...products[pIdx], stock };
          movements.push({
            id: generateId(),
            type: 'Delivery',
            ref: delivery.ref,
            productId: item.productId,
            productName: products[pIdx].name,
            from: delivery.locationId || delivery.warehouseId,
            to: 'Vendor',
            quantity: item.quantity,
            date: new Date().toISOString(),
          });
        }
      });
      return {
        ...state,
        products,
        movements,
        deliveries: state.deliveries.map(d => d.id === action.payload ? { ...d, status: 'Done' } : d),
      };
    }

    // Adjustments
    case 'ADD_ADJUSTMENT': {
      const adj = action.payload;
      const products = [...state.products];
      const movements = [...state.movements];
      const pIdx = products.findIndex(p => p.id === adj.productId);
      if (pIdx !== -1) {
        const stock = { ...products[pIdx].stock };
        const oldQty = stock[adj.warehouseId] || 0;
        const diff = adj.countedQty - oldQty;
        stock[adj.warehouseId] = adj.countedQty;
        products[pIdx] = { ...products[pIdx], stock };
        const adjustment = {
          id: generateId(),
          ref: `ADJ-${String(state.adjustments.length + 1).padStart(4, '0')}`,
          productId: adj.productId,
          productName: products[pIdx].name,
          warehouseId: adj.warehouseId,
          oldQty,
          newQty: adj.countedQty,
          difference: diff,
          reason: adj.reason || '',
          date: new Date().toISOString(),
          status: 'Done',
        };
        movements.push({
          id: generateId(),
          type: 'Adjustment',
          ref: adjustment.ref,
          productId: adj.productId,
          productName: products[pIdx].name,
          from: adj.warehouseId,
          to: adj.warehouseId,
          quantity: diff,
          date: new Date().toISOString(),
        });
        return {
          ...state,
          products,
          movements,
          adjustments: [...state.adjustments, adjustment],
        };
      }
      return state;
    }

    // Update stock directly from Stock page
    case 'UPDATE_STOCK': {
      const { productId, warehouseId, newQty } = action.payload;
      return {
        ...state,
        products: state.products.map(p => {
          if (p.id !== productId) return p;
          const stock = { ...p.stock };
          stock[warehouseId] = newQty;
          return { ...p, stock };
        }),
      };
    }

    case 'CANCEL_RECEIPT':
      return { ...state, receipts: state.receipts.map(r => r.id === action.payload ? { ...r, status: 'Canceled' } : r) };
    case 'CANCEL_DELIVERY':
      return { ...state, deliveries: state.deliveries.map(d => d.id === action.payload ? { ...d, status: 'Canceled' } : d) };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    KEYS.forEach(k => saveData(k, state[k]));
  }, [state]);

  const getProduct = (id) => state.products.find(p => p.id === id);
  const getWarehouse = (id) => state.warehouses.find(w => w.id === id);
  const getCategory = (id) => state.categories.find(c => c.id === id);
  const getLocation = (id) => state.locations.find(l => l.id === id);
  const getWarehouseName = (id) => {
    const w = getWarehouse(id);
    return w ? w.name : id || '—';
  };
  const getLocationName = (id) => {
    const l = getLocation(id);
    return l ? l.name : id || '—';
  };

  const getLowStockProducts = () => state.products.filter(p => {
    const total = getTotalStock(p);
    return p.reorderLevel && total <= p.reorderLevel && total > 0;
  });

  const getOutOfStockProducts = () => state.products.filter(p => getTotalStock(p) === 0);

  return (
    <AppContext.Provider value={{
      ...state,
      dispatch,
      getProduct,
      getWarehouse,
      getCategory,
      getLocation,
      getWarehouseName,
      getLocationName,
      getLowStockProducts,
      getOutOfStockProducts,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
