import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useState, useEffect } from 'react';
import { calculateSalesStats } from '../../utils/apiSales';
import { toast } from 'react-toastify';

const SalesOverviewChart = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('This Month');
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allSalesData, setAllSalesData] = useState({
    weekly: [],
    monthly: [],
    quarterly: [],
    yearly: [],
  });
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setIsLoading(true);
        const stats = await calculateSalesStats();

        setAllSalesData({
          weekly: stats.weeklyData.map((item) => ({
            name: item.day,
            sales: item.sales,
            tooltipValue: new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(item.sales),
          })),
          monthly: stats.monthlyData.map((item) => ({
            name: item.month,
            sales: item.sales,
            tooltipValue: new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(item.sales),
          })),
          quarterly: stats.quarterlyData.map((item) => ({
            name: item.quarter,
            sales: item.sales,
            tooltipValue: new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(item.sales),
          })),
          yearly: stats.yearlyData.map((item) => ({
            name: item.year,
            sales: item.sales,
            tooltipValue: new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(item.sales),
          })),
        });

        setTotalRevenue(stats.totalRevenue);
        // Set default view to monthly
        setSalesData(
          stats.monthlyData.map((item) => ({
            name: item.month,
            sales: item.sales,
            tooltipValue: new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(item.sales),
          }))
        );
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        toast.error('Failed to load sales data');
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  useEffect(() => {
    // Update chart data when time range changes
    switch (selectedTimeRange) {
      case 'This Week':
        setSalesData(allSalesData.weekly);
        break;
      case 'This Month':
        setSalesData(allSalesData.monthly);
        break;
      case 'This Quarter':
        setSalesData(allSalesData.quarterly);
        break;
      case 'This Year':
        setSalesData(allSalesData.yearly);
        break;
      default:
        setSalesData(allSalesData.monthly);
    }
  }, [selectedTimeRange, allSalesData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">{payload[0].payload.tooltipValue}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="bg-white shadow-lg rounded-xl p-6 border border-gray-300 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-black">Sales Overview</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total Revenue:{' '}
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(totalRevenue)}
          </p>
        </div>

        <select
          className="bg-white text-black rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
        >
          <option>This Week</option>
          <option>This Month</option>
          <option>This Quarter</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="w-full h-80">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="ml-2 text-gray-600">Loading sales data...</p>
          </div>
        ) : salesData.length > 0 ? (
          <ResponsiveContainer>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                tick={{ fill: '#374151' }}
                tickLine={{ stroke: '#6B7280' }}
              />
              <YAxis
                stroke="#6B7280"
                tick={{ fill: '#374151' }}
                tickLine={{ stroke: '#6B7280' }}
                tickFormatter={(value) =>
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(value)
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#8B5CF6"
                fill="url(#salesGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No sales data available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SalesOverviewChart;
