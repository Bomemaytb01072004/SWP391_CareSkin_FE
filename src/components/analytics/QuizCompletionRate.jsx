import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dữ liệu tĩnh về tỉ lệ hoàn thành quiz
const quizDataSets = {
  week: [
    { date: 'T2', started: 42, completed: 35 },
    { date: 'T3', started: 38, completed: 28 },
    { date: 'T4', started: 45, completed: 37 },
    { date: 'T5', started: 39, completed: 31 },
    { date: 'T6', started: 52, completed: 41 },
    { date: 'T7', started: 64, completed: 49 },
    { date: 'CN', started: 58, completed: 45 },
  ],
  month: [
    { date: 'Tuần 1', started: 210, completed: 165 },
    { date: 'Tuần 2', started: 245, completed: 190 },
    { date: 'Tuần 3', started: 263, completed: 207 },
    { date: 'Tuần 4', started: 287, completed: 232 },
  ],
  quarter: [
    { date: 'Tháng 1', started: 987, completed: 784 },
    { date: 'Tháng 2', started: 1142, completed: 912 },
    { date: 'Tháng 3', started: 1256, completed: 1017 },
  ],
  year: [
    { date: 'Quý 1', started: 3385, completed: 2713 },
    { date: 'Quý 2', started: 3876, completed: 3157 },
    { date: 'Quý 3', started: 4225, completed: 3476 },
    { date: 'Quý 4', started: 4532, completed: 3743 },
  ],
};

const QuizCompletionRate = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const quizData = quizDataSets[selectedTimeRange];

  // Tính toán tỷ lệ hoàn thành quiz (phần trăm)
  const totalStarted = quizData.reduce((acc, curr) => acc + curr.started, 0);
  const totalCompleted = quizData.reduce((acc, curr) => acc + curr.completed, 0);
  const completionRatePercentage = totalStarted > 0 
    ? Math.round((totalCompleted / totalStarted) * 100) 
    : 0;

  const handleTimeRangeChange = (e) => {
    setSelectedTimeRange(e.target.value);
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Tỷ lệ Hoàn Thành Quiz</h2>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-4">
          <p className="text-gray-400 text-sm">Đã Bắt Đầu</p>
          <p className="text-2xl font-bold text-blue-400">{totalStarted}</p>
        </div>
        <div className="bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-4">
          <p className="text-gray-400 text-sm">Đã Hoàn Thành</p>
          <p className="text-2xl font-bold text-green-400">{totalCompleted}</p>
        </div>
        <div className="bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-4">
          <p className="text-gray-400 text-sm">Tỷ Lệ</p>
          <p className="text-2xl font-bold text-purple-400">{completionRatePercentage}%</p>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart
            data={quizData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#9CA3AF' }} />
            <YAxis tick={{ fill: '#9CA3AF' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4B5563',
              }}
              itemStyle={{ color: '#E5E7EB' }}
              formatter={(value) => [`${value}`, '']}
            />
            <Area
              type="monotone"
              dataKey="started"
              name="Đã Bắt Đầu"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F660"
            />
            <Area
              type="monotone"
              dataKey="completed"
              name="Đã Hoàn Thành"
              stackId="2"
              stroke="#10B981"
              fill="#10B98160"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4">
        <p className="text-gray-400 text-sm">
          Biểu đồ này thể hiện số lượng quiz đã bắt đầu và đã hoàn thành theo thời gian.
          Tỷ lệ hoàn thành cao có thể chỉ ra rằng người dùng thấy quiz hấp dẫn và có giá trị.
        </p>
      </div>
    </motion.div>
  );
};

export default QuizCompletionRate;
