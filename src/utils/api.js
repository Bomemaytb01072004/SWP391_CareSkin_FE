// api.js
const apiURL = "http://careskinbeauty.shop:4456/api/Product";

const apiURLcustomers =
  'https://679897e2be2191d708b02aab.mockapi.io/api/products/Customers';
const apiURLproducts =
  'https://679897e2be2191d708b02aab.mockapi.io/api/products/Products';
const apiURLorders =
  'https://67b44f76392f4aa94faa49b5.mockapi.io/api/order/order';

/* ===============================
        CUSTOMERS API
================================== */
// Fetch all customers
export async function fetchCustomers() {
  try {
    const response = await fetch(apiURLcustomers);
    if (!response.ok) throw new Error('Error fetching customers');
    return await response.json();
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

// Fetch customer by ID
export async function fetchCustomerById(id) {
  try {
    const response = await fetch(`${apiURLcustomers}/${id}`);
    if (!response.ok) throw new Error('Error fetching customer by ID');
    return await response.json();
  } catch (error) {
    console.error('Error fetching customer by ID:', error);
    throw error;
  }
}

// Create a new customer
export async function createCustomer(customerData) {
  try {
    const response = await fetch(apiURLcustomers, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (!response.ok) throw new Error('Error creating customer');
    return await response.json();
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

/* ===============================
        PRODUCTS API
================================== */
// Fetch all products
export async function fetchProducts() {
  try {
    const response = await fetch(apiURLproducts);
    if (!response.ok) throw new Error('Error fetching products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Fetch product by ID
export async function fetchProductById(id) {
  try {
    const response = await fetch(`${apiURLproducts}/${id}`);
    if (!response.ok) throw new Error('Error fetching product by ID');
    return await response.json();
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
}

// Create a new product
export async function createProduct(productData) {
  try {
    const response = await fetch(apiURLproducts, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Error creating product');
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Update a product
export async function updateProduct(id, updatedData) {
  try {
    const response = await fetch(`${apiURLproducts}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error('Error updating product');
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Delete a product
export async function deleteProduct(id) {
  try {
    const response = await fetch(`${apiURLproducts}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting product');
    return await response.json();
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

/* ===============================
        ORDERS API
================================== */
// Fetch all orders
export async function fetchOrders() {
  try {
    const response = await fetch(apiURLorders);
    if (!response.ok) throw new Error('Error fetching orders');
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

// Fetch order by ID
export async function fetchOrderById(id) {
  try {
    const response = await fetch(`${apiURLorders}/${id}`);
    if (!response.ok) throw new Error('Error fetching order by ID');
    return await response.json();
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw error;
  }
}

// Create a new order
export async function createOrder(orderData) {
  try {
    const response = await fetch(apiURLorders, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) throw new Error('Error creating order');
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Update an order
export async function updateOrder(id, updatedData) {
  try {
    const response = await fetch(`${apiURLorders}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error('Error updating order');
    return await response.json();
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

// Delete an order
export async function deleteOrder(id) {
  try {
    const response = await fetch(`${apiURLorders}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error deleting order');
    return await response.json();
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}
