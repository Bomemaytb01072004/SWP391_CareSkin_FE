// api.js
const apiBaseURL = 'http://careskinbeauty.shop:4456';
const apiURLcustomers = `${apiBaseURL}/api/Customer`;
const apiURLproducts = `${apiBaseURL}/api/Product`;
const apiURLorders = `${apiBaseURL}/api/Order/history`;
const apiURLcategories = `${apiBaseURL}/api/Product/categories`;
const apiURLBrands = `${apiBaseURL}/api/Brand`;
const apiURLSkinTypeProduct = `${apiBaseURL}/api/SkinType`;
const apiURLDeleteUsage = `${apiBaseURL}/api/Product/usage`;
const apiURLDeleteSkinType = `${apiBaseURL}/api/Product/skin-type`;
const apiURLDeleteVariation = `${apiBaseURL}/api/Product/variation`;
const apiURLDeleteMainIngredient = `${apiBaseURL}/api/Product/main-ingredient`;
const apiURLDeleteMainDetailIngredient = `${apiBaseURL}/api/Product/detail-ingredient`;
const apiURLPromotions = `${apiBaseURL}/api/Promotion`;
const apiURLBlogs = `${apiBaseURL}/api/BlogNews`;
const apiURLQuizzes = `${apiBaseURL}/api/Quiz`;
const apiURLSkinTypes = `${apiBaseURL}/api/SkinType`;

// Import cache utilities
import { getCache, setCache } from './cacheUtils';

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

// Fetch categories from active products
export async function fetchCategoriesFromActiveProducts() {
  // Check cache first
  const cachedCategories = getCache('activeCategories');
  if (cachedCategories) {
    return cachedCategories;
  }

  try {
    // First fetch all products
    const response = await fetch(apiURLproducts);
    if (!response.ok) throw new Error('Error fetching products');

    const products = await response.json();

    // Filter for active products only
    const activeProducts = products.filter((product) => product.IsActive);

    // Extract categories from active products
    const categoriesFromActive = activeProducts.map(
      (product) => product.Category
    );

    // Cache the categories for 10 minutes
    setCache('activeCategories', categoriesFromActive, 10);

    return categoriesFromActive;
  } catch (error) {
    console.error('Error fetching categories from active products', error);
    throw error;
  }
}

// Fetch only active products (optimized version for ProductsPage)
export async function fetchActiveProductsWithDetails() {
  // Check cache first
  const cachedProducts = getCache('activeProducts');
  if (cachedProducts) {
    return cachedProducts;
  }

  try {
    const response = await fetch(`${apiURLproducts}?isActive=true`);
    if (!response.ok) throw new Error('Error fetching active products');
    const products = await response.json();

    // Cache the products for 5 minutes
    setCache('activeProducts', products, 5);

    return products;
  } catch (error) {
    console.error('Error fetching active products:', error);
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
    const formData = new FormData();

    formData.append('Name', brandData.Name);

    if (brandData.PictureFile instanceof File) {
      formData.append('PictureFile', brandData.PictureFile);
    } else {
      formData.append('PictureFile', brandData.PictureFile);
    }

    const response = await fetch(apiURLBrands, {
      method: 'POST',
      body: formData,
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

export async function updateBrand(id, brandData) {
  try {
    const formData = new FormData();

    formData.append('Name', brandData.Name);
    // Không gửi IsActive vì API không hỗ trợ

    if (brandData.PictureFile instanceof File) {
      formData.append('PictureFile', brandData.PictureFile);
    }

    const response = await fetch(`${apiURLBrands}/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) throw new Error('Error updating brand');
    return await response.json();
  } catch (error) {
    console.error('Error updating brand:', error);
    throw error;
  }
}

export async function deleteBrand(id) {
  try {
    const response = await fetch(`${apiURLBrands}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete brand');
    }
    return true;
  } catch (error) {
    console.error('Error deleting brand:', error);
    throw error;
  }
}

/* ===============================
        SKIN TYPE PRODUCT API
================================== */

export async function fetchSkinTypeProduct() {
  // Check cache first
  const cachedSkinTypes = getCache('skinTypes');
  if (cachedSkinTypes) {
    return cachedSkinTypes;
  }

  try {
    const response = await fetch(apiURLSkinTypeProduct);
    if (!response.ok) throw new Error('Error fetching skin type');
    const skinTypes = await response.json();

    // Cache the skin types for 30 minutes (changes less frequently)
    setCache('skinTypes', skinTypes, 30);

    return skinTypes;
  } catch (error) {
    console.error('Error fetching skin type', error);
    throw error;
  }
}

export async function fetchActiveProducts() {
  try {
    const response = await fetch(`${apiURLproducts}/active`);
    if (!response.ok) throw new Error('Error fetching active products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching active products:', error);
    throw error;
  }
}

export async function fetchInactiveProducts() {
  try {
    const response = await fetch(`${apiURLproducts}/inactive`);
    if (!response.ok) throw new Error('Error fetching inactive products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching inactive products:', error);
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
      if (v.ProductForSkinTypeId) {
        formData.append(
          `ProductForSkinTypes[${i}].ProductForSkinTypeId`,
          v.ProductForSkinTypeId
        );
      }
      formData.append(`ProductForSkinTypes[${i}].SkinTypeId`, v.SkinTypeId);
    });

    productData.Variations.forEach((v, i) => {
      if (v.ProductVariationId) {
        formData.append(
          `Variations[${i}].ProductVariationId`,
          v.ProductVariationId
        );
      }
      formData.append(`Variations[${i}].Ml`, v.Ml);
      formData.append(`Variations[${i}].Price`, v.Price);
    });

    productData.MainIngredients.forEach((v, i) => {
      if (v.ProductMainIngredientId) {
        formData.append(
          `MainIngredients[${i}].ProductMainIngredientId`,
          v.ProductMainIngredientId
        );
      }
      formData.append(`MainIngredients[${i}].IngredientName`, v.IngredientName);
      formData.append(`MainIngredients[${i}].Description`, v.Description);
    });

    productData.DetailIngredients.forEach((v, i) => {
      if (v.ProductDetailIngredientId) {
        formData.append(
          `DetailIngredients[${i}].ProductDetailIngredientId`,
          v.ProductDetailIngredientId
        );
      }
      formData.append(
        `DetailIngredients[${i}].IngredientName`,
        v.IngredientName
      );
    });

    productData.Usages.forEach((v, i) => {
      if (v.ProductUsageId) {
        formData.append(`Usages[${i}].ProductUsageId`, v.ProductUsageId);
      }
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
export async function updateProduct(productId, updatedData) {
  try {
    const formData = new FormData();

    // Các trường cơ bản
    formData.append('ProductName', updatedData.ProductName);
    formData.append('Description', updatedData.Description);
    formData.append('Category', updatedData.Category);
    formData.append('BrandId', updatedData.BrandId);

    // Ảnh chính (PictureFile)
    if (updatedData.PictureFile instanceof File) {
      formData.append('PictureFile', updatedData.PictureFile);
    }

    // Mảng ID ảnh cần xóa (AdditionalPicturesToDelete)
    if (
      updatedData.AdditionalPicturesToDelete &&
      updatedData.AdditionalPicturesToDelete.length > 0
    ) {
      updatedData.AdditionalPicturesToDelete.forEach((pictureId) => {
        formData.append('AdditionalPicturesToDelete', pictureId);
      });
    }

    // Mảng file ảnh phụ mới (NewAdditionalPictures)
    if (
      updatedData.AdditionalPicturesFile &&
      updatedData.AdditionalPicturesFile.length > 0
    ) {
      updatedData.AdditionalPicturesFile.forEach((file) => {
        if (file instanceof File && file.size > 0) {
          formData.append('NewAdditionalPictures', file);
        }
      });
    }

    // Mảng ID các ProductForSkinTypes cần xóa
    if (
      updatedData.ProductForSkinTypesToDelete &&
      updatedData.ProductForSkinTypesToDelete.length > 0
    ) {
      updatedData.ProductForSkinTypesToDelete.forEach((id) => {
        formData.append('ProductForSkinTypesToDelete', id);
      });
    }

    // Mảng ProductForSkinTypes
    if (
      updatedData.ProductForSkinTypes &&
      updatedData.ProductForSkinTypes.length > 0
    ) {
      updatedData.ProductForSkinTypes.forEach((v, i) => {
        if (v.ProductForSkinTypeId) {
          formData.append(
            `ProductForSkinTypes[${i}].ProductForSkinTypeId`,
            v.ProductForSkinTypeId
          );
        }
        formData.append(`ProductForSkinTypes[${i}].SkinTypeId`, v.SkinTypeId);
      });
    }

    // Mảng ID các Variations cần xóa
    if (
      updatedData.VariationsToDelete &&
      updatedData.VariationsToDelete.length > 0
    ) {
      updatedData.VariationsToDelete.forEach((id) => {
        formData.append('VariationsToDelete', id);
      });
    }

    // Mảng Variations
    if (updatedData.Variations && updatedData.Variations.length > 0) {
      updatedData.Variations.forEach((v, i) => {
        if (v.ProductVariationId) {
          formData.append(
            `Variations[${i}].ProductVariationId`,
            v.ProductVariationId
          );
        }
        formData.append(`Variations[${i}].Ml`, v.Ml);
        formData.append(`Variations[${i}].Price`, v.Price);
      });
    }

    // Mảng ID các MainIngredients cần xóa
    if (
      updatedData.MainIngredientsToDelete &&
      updatedData.MainIngredientsToDelete.length > 0
    ) {
      updatedData.MainIngredientsToDelete.forEach((id) => {
        formData.append('MainIngredientsToDelete', id);
      });
    }

    // Mảng MainIngredients
    if (updatedData.MainIngredients && updatedData.MainIngredients.length > 0) {
      updatedData.MainIngredients.forEach((v, i) => {
        if (v.ProductMainIngredientId) {
          formData.append(
            `MainIngredients[${i}].ProductMainIngredientId`,
            v.ProductMainIngredientId
          );
        }
        formData.append(
          `MainIngredients[${i}].IngredientName`,
          v.IngredientName
        );
        formData.append(`MainIngredients[${i}].Description`, v.Description);
      });
    }

    // Mảng ID các DetailIngredients cần xóa
    if (
      updatedData.DetailIngredientsToDelete &&
      updatedData.DetailIngredientsToDelete.length > 0
    ) {
      updatedData.DetailIngredientsToDelete.forEach((id) => {
        formData.append('DetailIngredientsToDelete', id);
      });
    }

    // Mảng DetailIngredients
    if (
      updatedData.DetailIngredients &&
      updatedData.DetailIngredients.length > 0
    ) {
      updatedData.DetailIngredients.forEach((v, i) => {
        if (v.ProductDetailIngredientId) {
          formData.append(
            `DetailIngredients[${i}].ProductDetailIngredientId`,
            v.ProductDetailIngredientId
          );
        }
        formData.append(
          `DetailIngredients[${i}].IngredientName`,
          v.IngredientName
        );
      });
    }

    // Mảng ID các Usages cần xóa
    if (updatedData.UsagesToDelete && updatedData.UsagesToDelete.length > 0) {
      updatedData.UsagesToDelete.forEach((id) => {
        formData.append('UsagesToDelete', id);
      });
    }

    // Mảng Usages
    if (updatedData.Usages && updatedData.Usages.length > 0) {
      updatedData.Usages.forEach((v, i) => {
        if (v.ProductUsageId) {
          formData.append(`Usages[${i}].ProductUsageId`, v.ProductUsageId);
        }
        formData.append(`Usages[${i}].Step`, v.Step);
        formData.append(`Usages[${i}].Instruction`, v.Instruction);
      });
    }

    // In ra dữ liệu gửi đi để kiểm tra
    console.log('FormData gửi đi:');
    for (let pair of formData.entries()) {
      console.log(
        pair[0] +
          ': ' +
          (pair[1] instanceof File ? 'File: ' + pair[1].name : pair[1])
      );
    }

    // Gửi request PUT
    const response = await fetch(`${apiURLproducts}/${productId}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      // Thử đọc lỗi từ server
      let errorMessage = 'Error updating product';
      let responseText = '';

      try {
        responseText = await response.text();
        console.log('Response text:', responseText);

        try {
          // Thử chuyển thành JSON nếu có thể
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData || errorMessage;
        } catch (jsonError) {
          // Nếu không phải JSON, sử dụng text
          errorMessage = responseText || `Server error: ${response.status}`;
        }
      } catch (textError) {
        errorMessage = `Failed to read error response: ${textError.message}`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
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

    // Kiểm tra content-type để xác định cách đọc dữ liệu
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json(); // Nếu là JSON thì parse
    } else {
      return await response.text(); // Nếu là text thì đọc dưới dạng text
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Delete a product usage
export async function deleteProductUsage(id) {
  try {
    const response = await fetch(`${apiURLDeleteUsage}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete product usage');
    }
    return true;
  } catch (error) {
    console.error('Error deleting product usage:', error);
    throw error;
  }
}

// Delete a product skin type
export async function deleteProductSkinType(id) {
  try {
    const response = await fetch(`${apiURLDeleteSkinType}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 'Failed to delete product skin type'
      );
    }
    return true;
  } catch (error) {
    console.error('Error deleting product skin type:', error);
    throw error;
  }
}

// Delete a product variation
export async function deleteProductVariation(id) {
  try {
    const response = await fetch(`${apiURLDeleteVariation}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 'Failed to delete product variation'
      );
    }
    return true;
  } catch (error) {
    console.error('Error deleting product variation:', error);
    throw error;
  }
}

// Delete a product main ingredient
export async function deleteProductMainIngredient(id) {
  try {
    const response = await fetch(`${apiURLDeleteMainIngredient}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 'Failed to delete product main ingredient'
      );
    }
    return true;
  } catch (error) {
    console.error('Error deleting product main ingredient:', error);
    throw error;
  }
}

// Delete a product detail ingredient
export async function deleteProductDetailIngredient(id) {
  try {
    const response = await fetch(`${apiURLDeleteMainDetailIngredient}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 'Failed to delete product detail ingredient'
      );
    }
    return true;
  } catch (error) {
    console.error('Error deleting product detail ingredient:', error);
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
/**
 * Update the status of an order
 * @param {string} orderId - The ID of the order
 * @param {number} newStatusId - The new status ID to be set
 */
export async function updateOrderStatus(orderId, newStatusId) {
  try {
    console.log('Updating Order:', orderId);
    console.log('Sending OrderStatusId as:', newStatusId);

    const response = await fetch(
      `http://careskinbeauty.shop:4456/api/Order/${orderId}/status`,
      {
        method: 'PUT',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStatusId),
      }
    );

    console.log('Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed: ${errorText || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to update order status:', error);
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

/* ===============================
        PROMOTIONS API
================================== */
// Fetch all promotions
export async function fetchPromotions() {
  try {
    const response = await fetch(apiURLPromotions);
    if (!response.ok) throw new Error('Error fetching promotions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching promotions:', error);
    throw error;
  }
}

// Fetch active promotions
export async function fetchActivePromotions() {
  try {
    const response = await fetch(`${apiURLPromotions}/active`);
    if (!response.ok) throw new Error('Error fetching active promotions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    throw error;
  }
}

// Fetch only promotions where PromotionType = 2
export async function fetchAvailablePromotions() {
  try {
    const response = await fetch(apiURLPromotionsActive);
    if (!response.ok) throw new Error('Error fetching promotions');

    const promotions = await response.json();

    // Filter promotions to only include PromotionType = 2
    return promotions.filter((promo) => promo.PromotionType === 2);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    throw error;
  }
}

// Fetch promotion by ID
export async function fetchPromotionById(id) {
  try {
    const response = await fetch(`${apiURLPromotions}/${id}`);
    if (!response.ok) throw new Error('Error fetching promotion by ID');
    return await response.json();
  } catch (error) {
    console.error('Error fetching promotion by ID:', error);
    throw error;
  }
}

// Create a new promotion
export async function createPromotion(promotionData) {
  try {
    const response = await fetch(apiURLPromotions, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promotionData),
    });
    if (!response.ok) throw new Error('Error creating promotion');
    return await response.json();
  } catch (error) {
    console.error('Error creating promotion:', error);
    throw error;
  }
}

// Update a promotion
export async function updatePromotion(id, updatedData) {
  try {
    const response = await fetch(`${apiURLPromotions}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error('Error updating promotion');
    return await response.json();
  } catch (error) {
    console.error('Error updating promotion:', error);
    throw error;
  }
}

// Delete a promotion
export async function deletePromotion(id) {
  try {
    const response = await fetch(`${apiURLPromotions}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting promotion');
    return true;
  } catch (error) {
    console.error('Error deleting promotion:', error);
    throw error;
  }
}

// Set product discount
export async function setProductDiscount(productDiscountData) {
  try {
    const response = await fetch(`${apiURLPromotions}/set-product-discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productDiscountData),
    });
    if (!response.ok) throw new Error('Error setting product discount');
    return await response.json();
  } catch (error) {
    console.error('Error setting product discount:', error);
    throw error;
  }
}

// Get product discounts
export async function getProductDiscounts() {
  try {
    const response = await fetch(`${apiURLPromotions}/product-discounts`);
    if (!response.ok) throw new Error('Error fetching product discounts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching product discounts:', error);
    throw error;
  }
}

// Update product discount status
export async function updateProductDiscountStatus(statusData) {
  try {
    const response = await fetch(
      `${apiBaseURL}/api/Promotion/product-discount-status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ProductId: statusData.ProductId,
          PromotionId: statusData.PromotionId,
          IsActive: statusData.IsActive,
        }),
      }
    );
    if (!response.ok) throw new Error('Error updating product discount status');
    return await response.json();
  } catch (error) {
    console.error('Error updating product discount status:', error);
    throw error;
  }
}

// Deactivate promotion
export async function deactivatePromotion(id) {
  try {
    const response = await fetch(`${apiURLPromotions}/${id}/deactivate`, {
      method: 'PUT',
    });
    if (!response.ok) throw new Error('Error deactivating promotion');
    return await response.json();
  } catch (error) {
    console.error('Error deactivating promotion:', error);
    throw error;
  }
}

/* ===============================
        BLOGS API
================================== */
// Fetch all blogs
export async function fetchBlogs() {
  try {
    const response = await fetch(apiURLBlogs);
    if (!response.ok) throw new Error('Error fetching blogs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
}

// Fetch blog by ID
export async function fetchBlogById(id) {
  try {
    const response = await fetch(`${apiURLBlogs}/${id}`);
    if (!response.ok) throw new Error('Error fetching blog by ID');
    return await response.json();
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    throw error;
  }
}

// Create a new blog
export async function createBlog(blogData) {
  try {
    const formData = new FormData();

    // Add blog data to formData
    formData.append('Title', blogData.Title);
    formData.append('Content', blogData.Content);

    // Handle the image file if present
    if (blogData.PictureFile instanceof File) {
      formData.append('PictureFile', blogData.PictureFile);
    }

    const response = await fetch(apiURLBlogs, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create blog');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
}

// Update a blog
export async function updateBlog(id, blogData) {
  try {
    const formData = new FormData();

    // Add blog data to formData
    formData.append('Title', blogData.Title);
    formData.append('Content', blogData.Content);

    // Handle the image file if present
    if (blogData.PictureFile instanceof File) {
      formData.append('PictureFile', blogData.PictureFile);
    }

    const response = await fetch(`${apiURLBlogs}/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update blog');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
}

// Delete a blog
export async function deleteBlog(id) {
  try {
    const response = await fetch(`${apiURLBlogs}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete blog');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
}

/* ===============================
        QUIZ API
================================== */

// Fetch all quizzes
export async function fetchQuizzes() {
  try {
    const response = await fetch(apiURLQuizzes);
    if (!response.ok) throw new Error('Error fetching quizzes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
}

// Fetch active quizzes
export async function fetchActiveQuizzes() {
  try {
    const response = await fetch(`${apiURLQuizzes}/active`);
    if (!response.ok) throw new Error('Error fetching active quizzes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching active quizzes:', error);
    throw error;
  }
}

// Fetch inactive quizzes
export async function fetchInactiveQuizzes() {
  try {
    const response = await fetch(`${apiURLQuizzes}/inactive`);
    if (!response.ok) throw new Error('Error fetching inactive quizzes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching inactive quizzes:', error);
    throw error;
  }
}

// Fetch quiz by ID
export async function fetchQuizById(id) {
  try {
    const response = await fetch(`${apiURLQuizzes}/${id}`);
    if (!response.ok) throw new Error('Error fetching quiz by ID');
    return await response.json();
  } catch (error) {
    console.error('Error fetching quiz by ID:', error);
    throw error;
  }
}

// Create a new quiz
export async function createQuiz(quizData) {
  try {
    const response = await fetch(apiURLQuizzes, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error creating quiz');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
}

// Update a quiz
export async function updateQuiz(id, quizData) {
  try {
    const response = await fetch(`${apiURLQuizzes}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating quiz');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating quiz:', error);
    throw error;
  }
}

// Delete a quiz
export async function deleteQuiz(id) {
  try {
    const response = await fetch(`${apiURLQuizzes}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error deleting quiz');
    }

    return true;
  } catch (error) {
    console.error('Error deleting quiz:', error);
    throw error;
  }
}

/* ===============================
        SKIN TYPE API
================================== */

// Fetch all skin types
export async function fetchSkinTypes() {
  try {
    const response = await fetch(apiURLSkinTypes);
    if (!response.ok) throw new Error('Error fetching skin types');
    return await response.json();
  } catch (error) {
    console.error('Error fetching skin types:', error);
    throw error;
  }
}

// Fetch active skin types
export async function fetchActiveSkinTypes() {
  try {
    const response = await fetch(`${apiURLSkinTypes}/active`);
    if (!response.ok) throw new Error('Error fetching active skin types');
    return await response.json();
  } catch (error) {
    console.error('Error fetching active skin types:', error);
    throw error;
  }
}

// Fetch inactive skin types
export async function fetchInactiveSkinTypes() {
  try {
    const response = await fetch(`${apiURLSkinTypes}/inactive`);
    if (!response.ok) throw new Error('Error fetching inactive skin types');
    return await response.json();
  } catch (error) {
    console.error('Error fetching inactive skin types:', error);
    throw error;
  }
}

// Fetch skin type by id
export async function fetchSkinTypeById(id) {
  try {
    const response = await fetch(`${apiURLSkinTypes}/${id}`);
    if (!response.ok) throw new Error(`Error fetching skin type with id ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching skin type with id ${id}:`, error);
    throw error;
  }
}

// Create skin type
export async function createSkinType(skinTypeData) {
  try {
    const response = await fetch(apiURLSkinTypes, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skinTypeData),
    });
    if (!response.ok) throw new Error('Error creating skin type');
    return await response.json();
  } catch (error) {
    console.error('Error creating skin type:', error);
    throw error;
  }
}

// Update skin type
export async function updateSkinType(id, skinTypeData) {
  try {
    const response = await fetch(`${apiURLSkinTypes}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skinTypeData),
    });
    if (!response.ok) throw new Error(`Error updating skin type with id ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error updating skin type with id ${id}:`, error);
    throw error;
  }
}

// Delete skin type
export async function deleteSkinType(id) {
  try {
    const response = await fetch(`${apiURLSkinTypes}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Error deleting skin type with id ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error deleting skin type with id ${id}:`, error);
    throw error;
  }
}

/* ===============================
        USERS API
================================== */

// Fetch all users
export async function fetchUsers() {
  try {
    const response = await fetch(apiURLcustomers);
    if (!response.ok) throw new Error('Error fetching users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Fetch user by ID
export async function fetchUserById(id) {
  try {
    const response = await fetch(`${apiURLcustomers}/${id}`);
    if (!response.ok) throw new Error('Error fetching user');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Create new user
export async function createUser(userData) {
  try {
    const response = await fetch(apiURLcustomers, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Error creating user');
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user
export async function updateUser(id, userData) {
  try {
    const response = await fetch(`${apiURLcustomers}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Error updating user');
    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Delete user
export async function deleteUser(id) {
  try {
    const response = await fetch(`${apiURLcustomers}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting user');
    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Toggle user status (active/inactive)
export async function toggleUserStatus(id, isActive) {
  try {
    const response = await fetch(`${apiURLcustomers}/toggle-status/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    if (!response.ok) throw new Error('Error toggling user status');
    return await response.json();
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
}

export default {
  fetchCustomers,
  fetchCustomerById,
  createCustomer,
  fetchProducts,
  fetchProductById,
  fetchCategories,
  fetchBrands,
  createBrand,
  fetchSkinTypeProduct,
  fetchActiveProducts,
  fetchInactiveProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductUsage,
  deleteProductSkinType,
  deleteProductVariation,
  deleteProductMainIngredient,
  deleteProductDetailIngredient,
  fetchOrders,
  fetchOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  fetchPromotions,
  fetchActivePromotions,
  fetchAvailablePromotions,
  fetchPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  setProductDiscount,
  getProductDiscounts,
  updateProductDiscountStatus,
  deactivatePromotion,
  fetchBlogs,
  fetchBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  fetchQuizzes,
  fetchActiveQuizzes,
  fetchInactiveQuizzes,
  fetchQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  fetchSkinTypes,
  fetchActiveSkinTypes,
  fetchInactiveSkinTypes,
  fetchSkinTypeById,
  createSkinType,
  updateSkinType,
  deleteSkinType,
  fetchCategoriesFromActiveProducts,
  fetchActiveProductsWithDetails,
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
};
