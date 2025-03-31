// apiSales.js
import { fetchActiveProducts, fetchCategories } from './api';

const apiBaseURL = 'http://careskinbeauty.shop:4456';
const apiURLorders = 'http://careskinbeauty.shop:4456/api/Order/history';
const apiURLproducts = 'http://careskinbeauty.shop:4456/api/Product';

/* ===============================
        SALES API
================================== */
// Fetch all orders for sales analysis
export async function fetchOrdersForSales() {
  try {
    const response = await fetch(apiURLorders);
    if (!response.ok)
      throw new Error('Error fetching orders for sales analysis');
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders for sales analysis:', error);
    throw error;
  }
}

// Fetch all products for sales analysis
export async function fetchProductsForSales() {
  try {
    return await fetchActiveProducts();
  } catch (error) {
    console.error('Error fetching products for sales analysis:', error);
    throw error;
  }
}

// Helper function to calculate monthly sales
function calculateMonthlySales(orders) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const monthlySales = Array(12).fill(0);

  orders.forEach((order) => {
    const orderDate = new Date(order.OrderDate);
    const monthIndex = orderDate.getMonth();
    monthlySales[monthIndex] +=
      order.TotalPriceSale > 0 ? order.TotalPriceSale : order.TotalPrice;
  });

  return months.map((month, index) => ({
    month,
    sales: monthlySales[index],
  }));
}

// Helper function to calculate weekly sales (last 7 days)
function calculateWeeklySales(orders) {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const weeklySales = Array(7).fill(0);

  // Get current date
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  // Filter orders from the last 7 days
  const recentOrders = orders.filter((order) => {
    const orderDate = new Date(order.OrderDate);
    return orderDate >= oneWeekAgo && orderDate <= today;
  });

  // Calculate sales for each day of the week
  recentOrders.forEach((order) => {
    const orderDate = new Date(order.OrderDate);
    const dayIndex = orderDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
    weeklySales[dayIndex] +=
      order.TotalPriceSale > 0 ? order.TotalPriceSale : order.TotalPrice;
  });

  return days.map((day, index) => ({
    day,
    sales: weeklySales[index],
  }));
}

// Helper function to calculate quarterly sales
function calculateQuarterlySales(orders) {
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterlySales = Array(4).fill(0);

  orders.forEach((order) => {
    const orderDate = new Date(order.OrderDate);
    const month = orderDate.getMonth();
    const quarterIndex = Math.floor(month / 3); // 0-2 for Q1, 3-5 for Q2, etc.
    quarterlySales[quarterIndex] +=
      order.TotalPriceSale > 0 ? order.TotalPriceSale : order.TotalPrice;
  });

  return quarters.map((quarter, index) => ({
    quarter,
    sales: quarterlySales[index],
  }));
}

// Helper function to calculate yearly sales (last 5 years)
function calculateYearlySales(orders) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
  const yearlySales = Array(5).fill(0);

  orders.forEach((order) => {
    const orderDate = new Date(order.OrderDate);
    const orderYear = orderDate.getFullYear();
    const yearIndex = years.indexOf(orderYear);
    if (yearIndex !== -1) {
      yearlySales[yearIndex] +=
        order.TotalPriceSale > 0 ? order.TotalPriceSale : order.TotalPrice;
    }
  });

  return years.map((year, index) => ({
    year: year.toString(),
    sales: yearlySales[index],
  }));
}

// Helper function to calculate daily sales (last 7 days)
function calculateDailySales(orders) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailySales = Array(7).fill(0);

  // Get current date
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  // Filter orders from the last 7 days
  const recentOrders = orders.filter((order) => {
    const orderDate = new Date(order.OrderDate);
    return orderDate >= oneWeekAgo && orderDate <= today;
  });

  // Calculate sales for each day of the week
  recentOrders.forEach((order) => {
    const orderDate = new Date(order.OrderDate);
    const dayIndex = orderDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
    dailySales[dayIndex] +=
      order.TotalPriceSale > 0 ? order.TotalPriceSale : order.TotalPrice;
  });

  return days.map((day, index) => ({
    name: day,
    sales: dailySales[index],
  }));
}

// Helper function to calculate sales by category
async function calculateCategorySales(orders) {
  try {
    // Get all active products
    const products = await fetchProductsForSales();
    console.log('Active products fetched:', products.length);

    // Create a map of product ID to category
    const productCategories = {};
    products.forEach((product) => {
      if (product && product.ProductId && product.Category) {
        productCategories[product.ProductId] = product.Category;
      }
    });

    console.log(
      'Product categories map created:',
      Object.keys(productCategories).length
    );

    // Initialize category sales
    const categorySales = {};

    // Process each order
    orders.forEach((order) => {
      let hasProcessedProducts = false;

      // Check for OrderProducts (as seen in OrdersPage.jsx)
      if (order.OrderProducts && Array.isArray(order.OrderProducts)) {
        hasProcessedProducts = true;
        order.OrderProducts.forEach((product) => {
          if (product && product.ProductId) {
            const productId = product.ProductId;
            const category = productCategories[productId] || 'Other';
            const quantity = product.Quantity || 1;
            const price = product.Price || product.SalePrice || 0;
            const saleAmount = price * quantity;

            if (!categorySales[category]) {
              categorySales[category] = 0;
            }

            categorySales[category] += saleAmount;
          }
        });
      }

      // Check for OrderDetails alternative property
      else if (order.OrderDetails && Array.isArray(order.OrderDetails)) {
        hasProcessedProducts = true;
        order.OrderDetails.forEach((detail) => {
          if (detail && detail.ProductId) {
            const productId = detail.ProductId;
            const category = productCategories[productId] || 'Other';
            const quantity = detail.Quantity || 1;
            const price = detail.Price || detail.SalePrice || 0;
            const saleAmount = price * quantity;

            if (!categorySales[category]) {
              categorySales[category] = 0;
            }

            categorySales[category] += saleAmount;
          }
        });
      }

      // If no product details found, add to Other
      if (!hasProcessedProducts) {
        const saleAmount =
          order.TotalPriceSale > 0 ? order.TotalPriceSale : order.TotalPrice;

        if (!categorySales['Other']) {
          categorySales['Other'] = 0;
        }

        categorySales['Other'] += saleAmount;
      }
    });

    // Filter out categories with no sales and sort by value
    const result = Object.entries(categorySales)
      .filter(([_, value]) => value > 0)
      .map(([category, value]) => ({
        name: category,
        value: value,
      }))
      .sort((a, b) => b.value - a.value);

    // If no categories found, add a default one
    if (result.length === 0) {
      result.push({ name: 'No Sales Data', value: 0 });
    }

    console.log('Final category sales data:', result);
    return result;
  } catch (error) {
    console.error('Error calculating category sales:', error);
    // Return a default value if there's an error
    return [{ name: 'Error Loading Data', value: 0 }];
  }
}

// Calculate sales statistics
export async function calculateSalesStats() {
  try {
    const orders = await fetchOrdersForSales();
    console.log('Orders fetched for stats:', orders.length);

    // Total Revenue
    const totalRevenue = orders.reduce(
      (acc, order) =>
        acc +
        (order.TotalPriceSale > 0 ? order.TotalPriceSale : order.TotalPrice),
      0
    );

    // Average Order Value
    const averageOrderValue =
      orders.length > 0 ? totalRevenue / orders.length : 0;

    // Completed Orders Count
    const completedOrders = orders.filter(
      (order) => order.OrderStatusId === 3 || order.OrderStatusId === 4
    ).length;

    // Conversion Rate (assuming conversion rate is completed orders / total orders)
    const conversionRate =
      orders.length > 0 ? (completedOrders / orders.length) * 100 : 0;

    // Monthly Sales Data (for trend analysis)
    const monthlyData = calculateMonthlySales(orders);

    // Weekly Sales Data
    const weeklyData = calculateWeeklySales(orders);

    // Quarterly Sales Data
    const quarterlyData = calculateQuarterlySales(orders);

    // Yearly Sales Data
    const yearlyData = calculateYearlySales(orders);

    // Daily Sales Data (for trend analysis)
    const dailyData = calculateDailySales(orders);

    // Category Sales Data
    const categorySalesData = await calculateCategorySales(orders);

    return {
      totalRevenue,
      averageOrderValue,
      completedOrders,
      conversionRate,
      monthlyData,
      weeklyData,
      quarterlyData,
      yearlyData,
      dailyData,
      categorySalesData,
    };
  } catch (error) {
    console.error('Error calculating sales stats:', error);
    throw error;
  }
}

export default {
  fetchOrdersForSales,
  fetchProductsForSales,
  calculateSalesStats,
};
