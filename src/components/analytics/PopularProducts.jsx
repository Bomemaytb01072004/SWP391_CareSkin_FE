import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dữ liệu tĩnh cho các sản phẩm phổ biến
const productDataSets = {
  week: [
    { name: 'Kem dưỡng ẩm', views: 352, purchases: 78 },
    { name: 'Serum Vitamin C', views: 317, purchases: 63 },
    { name: 'Sữa rửa mặt', views: 294, purchases: 82 },
    { name: 'Mặt nạ đất sét', views: 241, purchases: 44 },
    { name: 'Kem chống nắng', views: 226, purchases: 51 },
  ],
  month: [
    { name: 'Kem dưỡng ẩm', views: 1246, purchases: 312 },
    { name: 'Serum Vitamin C', views: 1098, purchases: 274 },
    { name: 'Sữa rửa mặt', views: 987, purchases: 342 },
    { name: 'Mặt nạ đất sét', views: 876, purchases: 187 },
    { name: 'Kem chống nắng', views: 743, purchases: 225 },
  ],
  quarter: [
    { name: 'Kem dưỡng ẩm', views: 3429, purchases: 867 },
    { name: 'Serum Vitamin C', views: 3187, purchases: 798 },
    { name: 'Sữa rửa mặt', views: 2875, purchases: 934 },
    { name: 'Mặt nạ đất sét', views: 2543, purchases: 476 },
    { name: 'Kem chống nắng', views: 2187, purchases: 599 },
  ],
  year: [
    { name: 'Kem dưỡng ẩm', views: 12874, purchases: 3254 },
    { name: 'Serum Vitamin C', views: 11932, purchases: 2987 },
    { name: 'Sữa rửa mặt', views: 10765, purchases: 3589 },
    { name: 'Mặt nạ đất sét', views: 9843, purchases: 1876 },
    { name: 'Kem chống nắng', views: 8754, purchases: 2232 },
  ],
};

const PopularProducts = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [productLimit, setProductLimit] = useState(5);
  const productData = productDataSets[selectedTimeRange];

  const handleTimeRangeChange = (e) => {
    setSelectedTimeRange(e.target.value);
  };

  const handleLimitChange = (e) => {
    setProductLimit(parseInt(e.target.value));
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Sản Phẩm Phổ Biến</h2>
        <div className="flex space-x-2">
          <select
            className="bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedTimeRange}
            onChange={handleTimeRangeChange}
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
          <select
            className="bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={productLimit}
            onChange={handleLimitChange}
          >
            <option value="3">Top 3</option>
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
          </select>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={productData.slice(0, productLimit)}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
            <YAxis tick={{ fill: '#9CA3AF' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4B5563',
              }}
              itemStyle={{ color: '#E5E7EB' }}
            />
            <Legend formatter={(value) => <span style={{ color: '#E5E7EB' }}>{value}</span>} />
            <Bar dataKey="views" name="Lượt xem" fill="#8884d8" />
            <Bar dataKey="purchases" name="Lượt mua" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4">
        <p className="text-gray-400 text-sm">
          Biểu đồ này cho thấy các sản phẩm phổ biến nhất, so sánh lượt xem và lượt mua. 
          Tỷ lệ chênh lệch cao giữa lượt xem và mua có thể chỉ ra cơ hội cải thiện mô tả sản phẩm hoặc giá cả.
        </p>
      </div>
    </motion.div>
  );
};

export default PopularProducts;
