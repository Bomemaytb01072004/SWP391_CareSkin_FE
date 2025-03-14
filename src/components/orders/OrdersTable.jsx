import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye } from 'lucide-react';
import { fetchOrders } from '../../utils/api';

const OrdersTable = ({ setOrderStats, setViewingOrder, setOrderDetails }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingOrder, setEditingOrder] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'orderId',
    direction: 'desc',
  });
  const ordersPerPage = 8;

  useEffect(() => {
    const getOrders = async () => {
      try {
        const data = await fetchOrders();
        //OrderStats
        const totalOrders = data.length;
        const pendingOrders = data.filter(
          (order) => order.OrderStatusId === 1
        ).length;
        const completedOrders = data.filter(
          (order) => order.OrderStatusId === 4
        ).length;
        const totalRevenue = data.reduce(
          (acc, order) =>
            acc +
            (order.TotalPriceSale > 0
              ? order.TotalPriceSale
              : order.TotalPrice),
          0
        );
        const formattedOrders = data
          .map((order) => ({
            orderId: order.OrderId,
            customerId: order.CustomerId,
            customer: order.Name || 'Unknown',
            phone: order.Phone || '',
            address: order.Address || '',
            promotionId: order.PromotionId || '',
            total:
              order.TotalPriceSale > 0
                ? order.TotalPriceSale
                : order.TotalPrice,
            status: order.OrderStatusName,
            statusId: order.OrderStatusId,
            date: order.OrderDate,
          }))
          .sort((a, b) => b.orderId - a.orderId);
        setOrders(formattedOrders);
        setFilteredOrders(formattedOrders);
        setOrderStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
        });
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };
    getOrders();
  }, [setOrderStats]); // Recalculate when orders change
  const updateOrderStatus = async (orderId, newStatusId) => {
    try {
      console.log('Updating Order:', orderId);
      console.log('Sending OrderStatusId as:', newStatusId);

      const response = await fetch(
        `http://careskinbeauty.shop:4456/api/Order/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            Accept: '*/*', // Allowing any type of response
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newStatusId), // Send just the number, not an object
        }
      );

      console.log('Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed: ${errorText || response.statusText}`);
      }

      setFilteredOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                statusId: newStatusId,
                status: Object.keys(statusClasses)[newStatusId - 1],
              }
            : order
        )
      );
      setEditingOrder(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const cancelOrder = (orderId) => {
    updateOrderStatus(orderId, 5);
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        `http://careskinbeauty.shop:4456/api/Order/${orderId}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch order details: ${response.statusText}`
        );
      }
      const data = await response.json();
      setOrderDetails(data);
      setViewingOrder(orderId);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };
  const statusClasses = {
    Pending: 'bg-yellow-100 text-yellow-800',
    'Out Of Delivery': 'bg-blue-100 text-blue-800',
    Paid: 'bg-green-100 text-green-800',
    Done: 'bg-gray-100 text-gray-800',
    Cancel: 'bg-red-100 text-red-800',
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = orders.filter(
      (order) =>
        order.customer.toLowerCase().includes(term) || order.date.includes(term)
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      if (key === 'total') {
        return direction === 'asc' ? a.total - b.total : b.total - a.total;
      } else if (key === 'date') {
        return direction === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (typeof a[key] === 'string') {
        return direction === 'asc'
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      } else {
        return direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
      }
    });
    setFilteredOrders(sortedOrders);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2 py-2">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2 py-2">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Order List</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Date or Customer"
            className="bg-gray-700 text-white placeholder-gray-400 placeholder-opacity-70 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              {[
                'orderId',
                'customerId',
                'customer',
                'total',
                'status',
                'date',
              ].map((key) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort(key)}
                >
                  {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {currentOrders.map((order) => (
              <motion.tr
                key={order.orderId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {order.orderId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {order.customerId}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {order.customer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  ${(order.total ?? 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {editingOrder === order.orderId ? (
                    <div className="flex items-center gap-2">
                      <select
                        className="bg-gray-700 text-white p-1 rounded"
                        defaultValue={order.statusId}
                        onChange={(e) =>
                          updateOrderStatus(
                            order.orderId,
                            Number(e.target.value)
                          )
                        }
                      >
                        {Object.entries(statusClasses).map(
                          ([key, value], index) => (
                            <option key={key} value={index + 1}>
                              {key}
                            </option>
                          )
                        )}
                      </select>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        onClick={() => setEditingOrder(null)} // Cancel action
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[order.status] || 'bg-gray-500 text-white'}`}
                      onClick={() => setEditingOrder(order.orderId)}
                    >
                      {order.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {order.date}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300 flex gap-2">
                  <button
                    className="text-indigo-400 hover:text-indigo-300"
                    onClick={() => fetchOrderDetails(order.orderId)}
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className="text-yellow-400 hover:text-yellow-300 text-xs"
                    onClick={() => setEditingOrder(order.orderId)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={() => cancelOrder(order.orderId)}
                  >
                    Delete
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 mx-2 rounded-lg ${
            currentPage === 1
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
              : 'bg-gray-700 text-white'
          }`}
        >
          Previous
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 mx-2 rounded-lg ${
            currentPage === totalPages
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
              : 'bg-gray-700 text-white'
          }`}
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

export default OrdersTable;
