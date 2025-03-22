import { useState, useEffect } from "react";
import { calculateSalesStats } from "../../utils/apiSales";
import { toast } from "react-toastify";
import SalesOverviewChart from "./SalesOverviewChart";
import StatCards from "./StatCards";

const SalesAnalytics = () => {
  const [salesStats, setSalesStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const stats = await calculateSalesStats();
        setSalesStats(stats);
      } catch (error) {
        console.error("Error fetching sales statistics:", error);
        toast.error("Failed to load sales statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Loading sales analytics...</p>
      </div>
    );
  }

  if (!salesStats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No sales data available</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <StatCards stats={salesStats} />
      <SalesOverviewChart />
    </div>
  );
};

export default SalesAnalytics;
