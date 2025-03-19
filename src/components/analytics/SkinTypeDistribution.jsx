import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dữ liệu tĩnh cho phân phối loại da
const skinTypeDataSets = {
  week: [
    { name: 'Dry', value: 25 },
    { name: 'Oily', value: 30 },
    { name: 'Combination', value: 35 },
    { name: 'Sensitive', value: 10 },
  ],
  month: [
    { name: 'Dry', value: 30 },
    { name: 'Oily', value: 25 },
    { name: 'Combination', value: 35 },
    { name: 'Sensitive', value: 10 },
  ],
  quarter: [
    { name: 'Dry', value: 28 },
    { name: 'Oily', value: 27 },
    { name: 'Combination', value: 32 },
    { name: 'Sensitive', value: 13 },
  ],
  year: [
    { name: 'Dry', value: 26 },
    { name: 'Oily', value: 29 },
    { name: 'Combination', value: 33 },
    { name: 'Sensitive', value: 12 },
  ],
  all: [
    { name: 'Dry', value: 27 },
    { name: 'Oily', value: 28 },
    { name: 'Combination', value: 34 },
    { name: 'Sensitive', value: 11 },
  ],
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const SkinTypeDistribution = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const skinTypeData = skinTypeDataSets[selectedTimeRange];

  const handleTimeRangeChange = (e) => {
    setSelectedTimeRange(e.target.value);
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Phân phối Loại Da</h2>
        <select
          className="bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedTimeRange}
          onChange={handleTimeRangeChange}
        >
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
          <option value="quarter">Quý này</option>
          <option value="year">Năm nay</option>
          <option value="all">Tất cả</option>
        </select>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={skinTypeData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {skinTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4B5563',
              }}
              itemStyle={{ color: '#E5E7EB' }}
              formatter={(value) => [`${value} người dùng`, 'Số lượng']}
            />
            <Legend formatter={(value) => <span style={{ color: '#E5E7EB' }}>{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4">
        <p className="text-gray-400 text-sm">
          Biểu đồ này thể hiện phân bố loại da của người dùng từ kết quả bài quiz.
          {selectedTimeRange !== 'all' && ' Lọc theo khoảng thời gian để xem sự thay đổi trong xu hướng.'}
        </p>
      </div>
    </motion.div>
  );
};

export default SkinTypeDistribution;
