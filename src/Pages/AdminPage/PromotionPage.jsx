import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import { ToastContainer } from 'react-toastify';

import { Gift, Percent, Calendar, TrendingUp } from "lucide-react";

import PromotionsTable from "../../components/promotions/PromotionsTable";
import { fetchPromotions } from "../../utils/api";

const PromotionPageAdmin = () => {
  const [filterStatus, setFilterStatus] = useState("all");

  const {
    data: promotions,
    isLoading: promotionsLoading,
    error: promotionsError,
    refetch: refetchPromotions,
  } = useQuery({
    queryKey: ["promotions"],
    queryFn: fetchPromotions,
  });

  if (promotionsLoading) return <div>Loading...</div>;
  if (promotionsError) return <div>Error fetching data</div>;

  const totalPromotions = promotions.length;
  const activePromotions = promotions.filter(promo => {
    if (promo.hasOwnProperty('IsActive')) {
      return promo.IsActive;
    }

    const now = new Date();
    const startDate = new Date(promo.StartDate);
    const endDate = new Date(promo.EndDate);

    return startDate <= now && now <= endDate;
  }).length;
  const upcomingPromotions = promotions.filter(promo => {
    const startDate = new Date(promo.StartDate);
    const today = new Date();
    return startDate > today;
  }).length;

  const avgDiscount = promotions.length > 0
    ? Math.round(promotions.reduce((sum, promo) => sum + (promo.DiscountPercent || 0), 0) / promotions.length)
    : 0;

  const filteredPromotions = filterStatus === "all"
    ? promotions
    : promotions.filter(quiz =>
      filterStatus === "active" ? quiz.IsActive : !quiz.IsActive
    );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex-1 overflow-auto relative bg-white text-black">
        <Header title="Promotions" />

        <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <StatCard name="Total Promotions" icon={Gift} value={totalPromotions} color="#6366F1" />
            <StatCard name="Active Promotions" icon={TrendingUp} value={activePromotions} color="#10B981" />
            <StatCard name="Upcoming Promotions" icon={Calendar} value={upcomingPromotions} color="#F59E0B" />
            <StatCard name="Avg. Discount" icon={Percent} value={`${avgDiscount}%`} color="#EF4444" />
          </motion.div>

          <div className="flex space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === "all"
                ? "bg-purple-300 text-black"
                : "bg-gray-300 text-black hover:bg-gray-100"
                }`}
              onClick={() => setFilterStatus("all")}
            >
              All Promotions
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === "active"
                ? "bg-green-600 text-white"
                : "bg-gray-300 text-black hover:bg-gray-100"
                }`}
              onClick={() => setFilterStatus("active")}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === "inactive"
                ? "bg-red-100 text-red-800"
                : "bg-gray-300 text-black hover:bg-gray-100"
                }`}
              onClick={() => setFilterStatus("inactive")}
            >
              Inactive
            </button>
          </div>

          <PromotionsTable promotions={filteredPromotions} refetchPromotions={refetchPromotions} />
        </main>
      </div>
    </>
  );
};
export default PromotionPageAdmin;
