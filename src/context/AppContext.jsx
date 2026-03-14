import { createContext, useContext, useReducer, useEffect } from 'react';
import { loadData, saveData, generateId, generateRef, initializeData, getTotalStock } from '../data/store';

const AppContext = createContext(null);

const KEYS = ['products', 'categories', 'warehouses', 'receipts', 'deliveries', 'transfers', 'adjustments', 'movements'];

function loadState() {
  initializeData();
  const state = {};
  KEYS.forEach(k => { state[k] = loadData(k) || []; });
  return state;
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

    // Receipts
    case 'ADD_RECEIPT': {
      const receipt = {
        id: generateId(),
        ref: generateRef('REC'),
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
    case 'VALIDATE_RECEIPT': {
      const receipt = state.receipts.find(r => r.id === action.payload);
      if (!receipt || receipt.status === 'Done') return state;
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
            warehouseFrom: null,
            warehouseTo: receipt.warehouseId,
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

    // Deliveries
    case 'ADD_DELIVERY': {
      const delivery = {
        id: generateId(),
        ref: generateRef('DEL'),
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
    case 'VALIDATE_DELIVERY': {
      const delivery = state.deliveries.find(d => d.id === action.payload);
      if (!delivery || delivery.status === 'Done') return state;
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
            warehouseFrom: delivery.warehouseId,
            warehouseTo: null,
            quantity: -item.quantity,
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

    // Transfers
    case 'ADD_TRANSFER': {
      const transfer = {
        id: generateId(),
        ref: generateRef('TRF'),
        status: 'Draft',
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      return { ...state, transfers: [...state.transfers, transfer] };
    }
    case 'VALIDATE_TRANSFER': {
      const transfer = state.transfers.find(t => t.id === action.payload);
      if (!transfer || transfer.status === 'Done') return state;
      const products = [...state.products];
      const movements = [...state.movements];
      transfer.items.forEach(item => {
        const pIdx = products.findIndex(p => p.id === item.productId);
        if (pIdx !== -1) {
          const stock = { ...products[pIdx].stock };
          stock[transfer.sourceWarehouseId] = (stock[transfer.sourceWarehouseId] || 0) - item.quantity;
          stock[transfer.destWarehouseId] = (stock[transfer.destWarehouseId] || 0) + item.quantity;
          products[pIdx] = { ...products[pIdx], stock };
          movements.push({
            id: generateId(),
            type: 'Transfer',
            ref: transfer.ref,
            productId: item.productId,
            productName: products[pIdx].name,
            warehouseFrom: transfer.sourceWarehouseId,
            warehouseTo: transfer.destWarehouseId,
            quantity: item.quantity,
            date: new Date().toISOString(),
          });
        }
      });
      return {
        ...state,
        products,
        movements,
        transfers: state.transfers.map(t => t.id === action.payload ? { ...t, status: 'Done' } : t),
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
          ref: generateRef('ADJ'),
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
          warehouseFrom: adj.warehouseId,
          warehouseTo: adj.warehouseId,
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

    case 'CANCEL_RECEIPT':
      return { ...state, receipts: state.receipts.map(r => r.id === action.payload ? { ...r, status: 'Canceled' } : r) };
    case 'CANCEL_DELIVERY':
      return { ...state, deliveries: state.deliveries.map(d => d.id === action.payload ? { ...d, status: 'Canceled' } : d) };
    case 'CANCEL_TRANSFER':
      return { ...state, transfers: state.transfers.map(t => t.id === action.payload ? { ...t, status: 'Canceled' } : t) };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  // Persist on every state change
  useEffect(() => {
    KEYS.forEach(k => saveData(k, state[k]));
  }, [state]);

  // Helper getters
  const getProduct = (id) => state.products.find(p => p.id === id);
  const getWarehouse = (id) => state.warehouses.find(w => w.id === id);
  const getCategory = (id) => state.categories.find(c => c.id === id);
  const getWarehouseName = (id) => {
    const w = getWarehouse(id);
    return w ? w.name : id || '—';
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
      getWarehouseName,
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
