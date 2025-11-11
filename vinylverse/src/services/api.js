// API Service for VinylVerse Backend

const API_BASE_URL = 'https://qqoneoafu7.execute-api.us-east-2.amazonaws.com/dev';
// Allow overriding the inventory endpoint from environment (e.g., a new DB-backed inventory Lambda)
const INVENTORY_URL = process.env.REACT_APP_INVENTORY_URL || '/inventory-management/inventory';

// Helper function to handle fetch requests
const apiRequest = async (endpoint, options = {}) => {
  // Support absolute URLs; otherwise prefix with API base
  const url = /^https?:\/\//.test(endpoint) ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    const text = await response.text();

    // Try to parse JSON, but fall back to text when the server returns plain text (confirmation id)
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }

    if (!response.ok) {
      // include response body (if any) in the error for better diagnostics
      const err = new Error(`HTTP ${response.status} ${response.statusText}`);
      err.status = response.status;
      err.body = data;
      throw err;
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Product API calls
export const productAPI = {
  // GET all products from inventory management microservice
  getProducts: async () => {
    try {
  const resp = await apiRequest(INVENTORY_URL);

      // API may return different shapes (array or object with items/data). normalize to an array of products
      let items = [];
      if (Array.isArray(resp)) items = resp;
      else if (resp && Array.isArray(resp.items)) items = resp.items;
      else if (resp && Array.isArray(resp.data)) items = resp.data;
      else if (resp && typeof resp === 'object') {
        // try to find first array property
        const arr = Object.values(resp).find(v => Array.isArray(v));
        if (arr) items = arr;
      }

      // normalize fields to a consistent shape used by the UI
      const normalized = items.map(p => ({
        id: p.ITEM_ID ?? p.id ?? p.itemId ?? p.ITEM_NUMBER ?? p.sku ?? String(p.ITEM_ID ?? p.id ?? p.itemId ?? ''),
        name: p.NAME ?? p.name ?? p.title ?? '',
        price: p.PRICE ?? p.price ?? p.unit_price ?? p.UNIT_PRICE ?? 0,
        description: p.DESCRIPTION ?? p.description ?? '',
        availableQuantity: p.AVAILABLE_QUANTITY ?? p.available_quantity ?? p.availableQuantity ?? p.qty ?? 0
      }));

      if (normalized.length) return normalized;

      // If we reach here, the response didn't include recognizable inventory; log for diagnostics
      console.warn('Inventory API returned empty or unrecognized shape:', resp);

      // If API returned nothing useful, fall through to fallback below
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
    }

    // Fallback mock data for testing while API is being set up
    return [
      {
        id: '1',
        name: 'Pink ew - The Dark Side of the Moon',
        price: 24.99,
        description: 'Original 1973 pressing',
        availableQuantity: 0
      },
      {
        id: '2', 
        name: 'The Beatles - Abbey Road',
        price: 22.99,
        description: 'Anniversary Edition LP',
        availableQuantity: 0
      },
      {
        id: '3',
        name: 'Prince - Purple Rain',
        price: 29.99,
        description: 'Limited Edition 40th Anniversary',
        availableQuantity: 0
      },
      {
        id: '4',
        name: 'Michael Jackson - Thriller',
        price: 19.99,
        description: '25th Anniversary Edition',
        availableQuantity: 0
      }
    ];
  },
  
  // GET single product by ID from inventory management microservice
  getProduct: async (productId) => {
    return await apiRequest(`/inventory-management/inventory/items/${productId}`);
  },
  
  // GET products by name (optional query parameter)
  getProductsByName: async (itemName) => {
    return await apiRequest(`/inventory-management/inventory/items?name=${itemName}`);
  }
};

// Order API calls
export const orderAPI = {
  // POST create new order to order processing microservice
  createOrder: async (orderData) => {
    return await apiRequest('/order-processing/order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
  
  // GET order by ID from order processing microservice
  getOrder: async (orderId) => {
    return await apiRequest(`/order-processing/order/${orderId}`);
  },
  
  // GET all orders from order processing microservice (if needed)
  getOrders: async () => {
    return await apiRequest('/order-processing/order');
  }
};

// Customer API calls (if needed)
export const customerAPI = {
  // POST create customer
  createCustomer: async (customerData) => {
    return await apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }
};

const apiService = {
  productAPI,
  orderAPI,
  customerAPI,
};

export default apiService;