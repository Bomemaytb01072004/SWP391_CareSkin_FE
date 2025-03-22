import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import { ToastContainer } from 'react-toastify';

import { CheckCircle2, XCircle, Database, ScrollText } from "lucide-react";

import SkinTypesTable from "../../components/skintypes/SkinTypesTable";
import { fetchSkinTypes } from "../../utils/api";

const SkinTypesPage = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  
  const {
    data: skinTypes,
    isLoading: skinTypesLoading,
    error: skinTypesError,
    refetch: refetchSkinTypes
  } = useQuery({
    queryKey: ["skinTypes"],
    queryFn: fetchSkinTypes,
  });

  if (skinTypesLoading) return <div>Loading...</div>;
  if (skinTypesError) return <div>Error fetching data</div>;

  const filteredSkinTypes = filterStatus === "all" 
    ? skinTypes 
    : skinTypes.filter(skinType => 
        filterStatus === "active" ? skinType.IsActive : !skinType.IsActive
      );

  // Calculate stats for the cards
  const totalSkinTypes = skinTypes.length;
  const activeSkinTypes = skinTypes.filter(skinType => skinType.IsActive).length;
  const inactiveSkinTypes = totalSkinTypes - activeSkinTypes;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className='flex-1 overflow-auto relative bg-white'>
        <Header title='Skin Types' />

        <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
          {/* STATS */}
          <motion.div
            className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <StatCard name='Total Skin Types' icon={Database} value={totalSkinTypes} color='#8B5CF6' />
            <StatCard name='Active' icon={CheckCircle2} value={activeSkinTypes} color='#10B981' />
            <StatCard name='Inactive' icon={XCircle} value={inactiveSkinTypes} color='#F59E0B' />
            <StatCard name='Usage in Products' icon={ScrollText} value="--" color='#3B82F6' />
          </motion.div>

          {/* Filter Controls */}
          <div className="flex space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "all"
                  ? "bg-purple-300 text-black"
                  : "bg-gray-300 text-black hover:bg-gray-100"
              }`}
              onClick={() => setFilterStatus("all")}
            >
              All Skin Types
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-black hover:bg-gray-100"
              }`}
              onClick={() => setFilterStatus("active")}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "inactive"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-300 text-black hover:bg-gray-100"
              }`}
              onClick={() => setFilterStatus("inactive")}
            >
              Inactive
            </button>
          </div>

          {/* Skin Types Table */}
          <SkinTypesTable skinTypes={filteredSkinTypes} refetchSkinTypes={refetchSkinTypes} />
        </main>
      </div>
    </>
  );
};

export default SkinTypesPage;