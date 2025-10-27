// API Service for VinylVerse Backend

const API_BASE_URL = 'https://qqoneoafu7.execute-api.us-east-2.amazonaws.com/dev';

// Helper function to handle fetch requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Product API calls
export const productAPI = {
  // GET all products
  getProducts: async () => {
    try {
      return await apiRequest('/products');
    } catch (error) {
      // Fallback mock data for testing while API is being set up
      console.warn('API call failed, using mock data:', error);
      return [
        {
          id: '1',
          name: 'Pink Floyd - The Dark Side of the Moon',
          price: 24.99,
          description: 'Original 1973 pressing'
        },
        {
          id: '2', 
          name: 'The Beatles - Abbey Road',
          price: 22.99,
          description: 'Anniversary Edition LP'
        },
        {
          id: '3',
          name: 'Prince - Purple Rain',
          price: 29.99,
          description: 'Limited Edition 40th Anniversary'
        },
        {
          id: '4',
          name: 'Michael Jackson - Thriller',
          price: 19.99,
          description: '25th Anniversary Edition'
        }
      ];
    }
  },
  
  // GET single product by ID
  getProduct: async (productId) => {
    return await apiRequest(`/products/${productId}`);
  }
};

// Order API calls
export const orderAPI = {
  // POST create new order
  createOrder: async (orderData) => {
    return await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
  
  // GET order by ID
  getOrder: async (orderId) => {
    return await apiRequest(`/orders/${orderId}`);
  },
  
  // GET all orders (if needed)
  getOrders: async () => {
    return await apiRequest('/orders');
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