import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, DollarSign, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import DailyOrders from '../../components/orders/DailyOrders';
import OrderDistribution from '../../components/orders/OrderDistribution';
import OrdersTable from '../../components/orders/OrdersTable';

const OrdersPage = () => {
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  // 🔹 Move modal state up here
  const [viewingOrder, setViewingOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editingOrderInfo, setEditingOrderInfo] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const statusClasses = {
    Pending: 'bg-yellow-100 text-yellow-800',
    'Out Of Delivery': 'bg-blue-100 text-blue-800',
    Paid: 'bg-green-100 text-green-800',
    Done: 'bg-gray-100 text-gray-800',
    Cancel: 'bg-red-100 text-red-800',
  };
  const [orderForm, setOrderForm] = useState({
    Name: '',
    Phone: '',
    Address: '',
    PromotionId: '',
  });
  const updateOrderInfo = async (orderId) => {
    try {
      const response = await fetch(
        `http://careskinbeauty.shop:4456/api/Order/${orderId}`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderForm),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed: ${errorText || response.statusText}`);
      }

      // Fetch updated order details after update
      const updatedOrderResponse = await fetch(
        `http://careskinbeauty.shop:4456/api/Order/${orderId}`
      );
      const updatedOrderData = await updatedOrderResponse.json();

      // ✅ Update main orders state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId ? { ...order, ...updatedOrderData } : order
        )
      );
      // 🔹 Update both the Orders Table & Order Details Modal
      setFilteredOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                customer: updatedOrderData.Name,
                phone: updatedOrderData.Phone,
                address: updatedOrderData.Address,
                promotionId: updatedOrderData.PromotionId,
              }
            : order
        )
      );

      // Update modal details if it's open
      if (viewingOrder === orderId) {
        setOrderDetails(updatedOrderData);
      }

      // Close the edit modal
      setEditingOrderInfo(null);
    } catch (error) {
      console.error('Failed to update order info:', error);
    }
  };

  return (
    <div className="flex-1 relative z-10 overflow-auto">
      <Header title={'Orders'} />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Total Orders"
            icon={ShoppingBag}
            value={orderStats.totalOrders}
            color="#6366F1"
          />

          <StatCard
            name="Pending Orders"
            icon={Clock}
            value={orderStats.pendingOrders}
            color="#F59E0B"
          />

          <StatCard
            name="Completed Orders"
            icon={CheckCircle}
            value={orderStats.completedOrders}
            color="#10B981"
          />

          <StatCard
            name="Total Revenue"
            icon={DollarSign}
            value={`$${orderStats.totalRevenue.toFixed(2)}`}
            color="#EF4444"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <DailyOrders />
          <OrderDistribution />
        </div>

        {/* Pass modal state & setter to OrdersTable */}
        <OrdersTable
          setOrderStats={setOrderStats}
          orders={orders}
          setOrders={setOrders}
          setViewingOrder={setViewingOrder}
          setOrderDetails={setOrderDetails}
        />
      </main>

      {/* 🔥 Move the modal here so it blurs the whole screen */}
      {viewingOrder && orderDetails && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-60 backdrop-blur-lg">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-[90%] max-w-2xl relative">
            {/* Close Button */}
            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
              onClick={() => {
                setViewingOrder(null);
                setEditingOrderInfo(null); // Close edit mode if active
              }}
            >
              ✖
            </button>

            {/* Modal Header */}
            <h2 className="text-xl font-semibold text-white text-center mb-4 border-b pb-2">
              Order Details
            </h2>

            {/* Order Info Section */}
            {!editingOrderInfo ? (
              <>
                <div className="text-gray-300 text-sm grid grid-cols-2 gap-4">
                  <p>
                    <strong>Order ID:</strong> {orderDetails.OrderId}
                  </p>
                  <p>
                    <strong>Customer:</strong> {orderDetails.Name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {orderDetails.Phone}
                  </p>
                  <p>
                    <strong>Address:</strong> {orderDetails.Address}
                  </p>
                  <p>
                    <strong>Order Date:</strong> {orderDetails.OrderDate}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full  ${statusClasses[orderDetails.OrderStatusName] || 'bg-gray-500 text-white'}`}
                    >
                      {orderDetails.OrderStatusName}
                    </span>
                  </p>

                  <p className="col-span-2">
                    <strong>Total Price:</strong> $
                    {(orderDetails.TotalPriceSale > 0
                      ? orderDetails.TotalPriceSale
                      : orderDetails.TotalPrice
                    ).toFixed(2)}
                  </p>
                </div>

                {/* Products List */}
                <h3 className="text-white mt-5 text-lg border-b pb-2">
                  Products
                </h3>
                <div className="max-h-64 overflow-y-auto mt-3 space-y-3 pr-2">
                  {orderDetails.OrderProducts.map((product) => (
                    <div
                      key={product.ProductId}
                      className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg shadow-md"
                    >
                      <img
                        src={product.PictureUrl}
                        alt={product.ProductName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="text-gray-300 flex-1">
                        <p className="text-sm font-semibold">
                          {product.ProductName}
                        </p>
                        <p className="text-xs">Quantity: {product.Quantity}</p>
                        <p className="text-xs">
                          Price: $
                          {(product.SalePrice > 0
                            ? product.SalePrice
                            : product.Price
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit Button */}
                <div className="flex justify-between items-center gap-3 mt-5">
                  <button
                    className="flex-1 px-6 py-3 rounded-md text-white font-medium bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-700"
                    onClick={() => {
                      setOrderForm({
                        Name: orderDetails.Name,
                        Phone: orderDetails.Phone,
                        Address: orderDetails.Address,
                        PromotionId: orderDetails.PromotionId || '',
                      });
                      setEditingOrderInfo(orderDetails.OrderId);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="flex-1 px-6 py-3 rounded-md text-white font-medium bg-gradient-to-r from-[#fd5c63] to-[#ff3b4a] hover:from-[#ff474f] hover:to-[#e84750] shadow-md hover:shadow-xl transition-all duration-300 ease-in-out border border-[#e63946]"
                    onClick={() => setViewingOrder(null)}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              /* EDIT MODE - Order Info Form */
              <div className="mt-4">
                <h2 className="text-lg text-white mb-4 text-center">
                  Edit Order Info
                </h2>

                <input
                  type="text"
                  placeholder="Name"
                  value={orderForm.Name}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, Name: e.target.value })
                  }
                  className="block p-2 mt-2 w-full bg-gray-700 text-white rounded"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={orderForm.Phone}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, Phone: e.target.value })
                  }
                  className="block p-2 mt-2 w-full bg-gray-700 text-white rounded"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={orderForm.Address}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, Address: e.target.value })
                  }
                  className="block p-2 mt-2 w-full bg-gray-700 text-white rounded"
                />

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    className="bg-gray-500 px-4 py-2 rounded text-white hover:bg-gray-600"
                    onClick={() => setEditingOrderInfo(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600"
                    onClick={() => updateOrderInfo(editingOrderInfo)}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
