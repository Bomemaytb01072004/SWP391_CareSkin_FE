// api.js
const apiURL = "https://679897e2be2191d708b02aab.mockapi.io/api/products/Products";

export async function fetchProducts() {
  try {
    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error("Error fetching products");
    }
    const data = await response.json();
    return data; 
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function fetchProductById(id) {
  try {
    const response = await fetch(`${apiURL}/${id}`);
    if (!response.ok) {
      throw new Error("Error fetching product by id");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching product by id:", error);
    throw error;
  }
}
const apiURLCustomer = "https://679897e2be2191d708b02aab.mockapi.io/api/products/Customers";

export async function fetchCustomers() {
    try {
        const res = await fetch(apiURLCustomer);
        if(!res.ok) {
            throw new Error("Error fetching customers");
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching customers");
        throw error;
    }
}
