import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { calculateSalesStats } from "../../utils/apiSales";

const SalesOverviewChart = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("This Month");
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allSalesData, setAllSalesData] = useState({
    weekly: [],
    monthly: [],
    quarterly: [],
    yearly: []
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setIsLoading(true);
        const stats = await calculateSalesStats();

        setAllSalesData({
          weekly: stats.weeklyData.map(item => ({ name: item.day, sales: item.sales })),
          monthly: stats.monthlyData,
          quarterly: stats.quarterlyData.map(item => ({ name: item.quarter, sales: item.sales })),
          yearly: stats.yearlyData.map(item => ({ name: item.year, sales: item.sales }))
        });

        // Set default view to monthly
        setSalesData(stats.monthlyData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  useEffect(() => {
    // Update chart data when time range changes
    switch (selectedTimeRange) {
      case "This Week":
        setSalesData(allSalesData.weekly);
        break;
      case "This Month":
        setSalesData(allSalesData.monthly);
        break;
      case "This Quarter":
        setSalesData(allSalesData.quarterly);
        break;
      case "This Year":
        setSalesData(allSalesData.yearly);
        break;
      default:
        setSalesData(allSalesData.monthly);
    }
  }, [selectedTimeRange, allSalesData]);

  return (
    <motion.div
      className="bg-white shadow-lg rounded-xl p-6 border border-gray-300 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-black">Sales Overview</h2>

        <select
          className="bg-white text-black rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
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
            <p className="text-black">Loading sales data...</p>
          </div>
        ) : (
          <ResponsiveContainer>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="name" stroke="#000" />
              <YAxis stroke="#000" />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(255,255,255,0)", borderColor: "#ccc" }}
                itemStyle={{ color: "#000" }}
                formatter={(value) => [`$${value.toFixed(2)}`, "Sales"]}
              />
              <Area type="monotone" dataKey="sales" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

export default SalesOverviewChart;
