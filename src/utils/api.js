// api.js
const apiURLcustomers = 'http://careskinbeauty.shop:4456/api/Customer';
const apiURLproducts = 'http://careskinbeauty.shop:4456/api/Product';
const apiURLorders = 'http://careskinbeauty.shop:4456/api/Order/history';
const apiURLcategories =
  'http://careskinbeauty.shop:4456/api/Product/categories';
const apiURLBrands = 'http://careskinbeauty.shop:4456/api/Brand';
const apiURLSkinTypeProduct = 'http://careskinbeauty.shop:4456/api/SkinType';

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
// Fetch categories
export async function fetchCategories() {
  try {
    const response = await fetch(apiURLcategories);
    if (!response.ok) throw new Error('Error fetching categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories', error);
    throw error;
  }
}

/* ===============================
        BRAND API
================================== */

export async function fetchBrands() {
  try {
    const response = await fetch(apiURLBrands);
    if (!response.ok) throw new Error('Error fetching brands');
    return await response.json();
  } catch (error) {
    console.error('Error fetching brands', error);
    throw error;
  }
}

// utils/api.js
export async function createBrand(brandData) {
  try {
    // formData đã bao gồm Name và PictureFile
    const response = await fetch(apiURLBrands, {
      method: 'POST',
      body: formData, // Gửi formData trực tiếp
    });
    if (!response.ok) {
      throw new Error('Failed to create brand');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating brand:', error);
    throw error;
  }
}

/* ===============================
        SKIN TYPE PRODUCT API
================================== */

export async function fetchSkinTypeProduct() {
  try {
    const response = await fetch(apiURLSkinTypeProduct);
    if (!response.ok) throw new Error('Error fetching skin type');
    return await response.json();
  } catch (error) {
    console.error('Error fetching skin type', error);
    throw error;
  }
}

// Create a new product
export async function createProduct(productData) {
  try {
    const formData = new FormData();

    formData.append('ProductName', productData.ProductName);
    formData.append('Description', productData.Description);
    formData.append('Category', productData.Category);
    formData.append('BrandId', productData.BrandId);

    if (productData.PictureFile instanceof File) {
      formData.append('PictureFile', productData.PictureFile);
    } else {
      formData.append('PictureFile', productData.PictureFile);
    }

    if (
      productData.AdditionalPictures &&
      productData.AdditionalPictures.length > 0
    ) {
      productData.AdditionalPictures.forEach((file) => {
        formData.append('AdditionalPictures', file);
        // Hoặc nếu backend yêu cầu "AdditionalPictures[]" thì:
        // formData.append("AdditionalPictures[]", file);
      });
    }

    productData.ProductForSkinTypes.forEach((v, i) => {
      formData.append(`ProductForSkinTypes[${i}].SkinTypeId`, v.SkinTypeId);
    });

    productData.Variations.forEach((v, i) => {
      formData.append(`Variations[${i}].Ml`, v.Ml);
      formData.append(`Variations[${i}].Price`, v.Price);
    });
    productData.MainIngredients.forEach((v, i) => {
      formData.append(`MainIngredients[${i}].IngredientName`, v.IngredientName);
      formData.append(`MainIngredients[${i}].Description`, v.Description);
    });
    productData.DetailIngredients.forEach((v, i) => {
      formData.append(
        `DetailIngredients[${i}].IngredientName`,
        v.IngredientName
      );
    });
    productData.Usages.forEach((v, i) => {
      formData.append(`Usages[${i}].Step`, v.Step);
      formData.append(`Usages[${i}].Instruction`, v.Instruction);
    });

    const response = await fetch(apiURLproducts, {
      method: 'POST',
      body: formData,
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
  const formData = new FormData();

  formData.append('ProductName', updatedData.ProductName);
  formData.append('Description', updatedData.Description);
  formData.append('Category', updatedData.Category);
  formData.append('BrandName', updatedData.BrandName);

  if (updatedData.PictureUrl instanceof File) {
    formData.append('PictureUrl', updatedData.PictureUrl);
  } else {
    formData.append('PictureUrl', updatedData.PictureUrl);
  }

  formData.append('Variations', JSON.stringify(updatedData.Variations));
  formData.append(
    'MainIngredients',
    JSON.stringify(updatedData.MainIngredients)
  );
  formData.append(
    'DetailIngredients',
    JSON.stringify(updatedData.DetailIngredients)
  );
  formData.append('Usages', JSON.stringify(updatedData.Usages));

  try {
    const response = await fetch(`${apiURLproducts}/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Error updating product');
    }
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
