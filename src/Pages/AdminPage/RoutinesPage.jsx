import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { Layers, CheckCircle, XCircle, Calendar } from "lucide-react";
import 'react-toastify/dist/ReactToastify.css';

import Header from "../../components/common/Header";
import StatCard from "../../components/common/StatCard";
import RoutinesTable from "../../components/routines/RoutinesTable";
import RoutineModal from "../../components/routines/RoutineModal";
import ViewRoutineModal from "../../components/routines/ViewRoutineModal";
import { fetchRoutines } from "../../utils/apiOfRoutine";

const RoutinesPage = () => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState(null);

  const fetchRoutinesData = async () => {
    setLoading(true);
    try {
      const data = await fetchRoutines();
      setRoutines(data);
    } catch (error) {
      console.error("Error fetching routines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutinesData();
  }, []);

  const handleCreateRoutine = () => {
    setSelectedRoutine(null);
    setShowCreateModal(true);
  };

  const handleEditRoutine = (routine) => {
    setSelectedRoutine(routine);
    setShowEditModal(true);
  };

  const handleViewRoutine = (routine) => {
    setSelectedRoutineId(routine.RoutineId);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedRoutine(null);
    setSelectedRoutineId(null);
  };


  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [filteredRoutines, setFilteredRoutines] = useState([]);

  useEffect(() => {
    if (!routines) return;

    const sortedBrands = [...routines].sort((a, b) => b.RoutineId - a.RoutineId);

    if (activeFilter === 'all') {
      setFilteredRoutines(sortedBrands);
    } else if (activeFilter === 'active') {
      setFilteredRoutines(sortedBrands.filter(routine => routine.IsActive));
    } else if (activeFilter === 'inactive') {
      setFilteredRoutines(sortedBrands.filter(routine => !routine.IsActive));
    }
  }, [routines, activeFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalRoutines = routines.length;
  const activeRoutines = routines.filter((routine) => routine.IsActive).length;
  const inactiveRoutines = totalRoutines - activeRoutines;
  const routinesWithSteps = routines.filter((routine) => routine.RoutineStepDTOs && routine.RoutineStepDTOs.length > 0).length;

  return (
    <>
      <ToastContainer />  

      <div className="flex-1 overflow-auto relative bg-white text-black">
        <Header title="Skin Care Routines" />

        <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
          {/* Stat Cards */}
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <StatCard name="Total Routines" icon={Layers} value={totalRoutines} color="#6366F1" onClick={() => setActiveFilter('all')} />
            <StatCard name="Active Routines" icon={CheckCircle} value={activeRoutines} color="#10B981" onClick={() => setActiveFilter('active')} />
            <StatCard name="Inactive Routines" icon={XCircle} value={inactiveRoutines} color="#EF4444" onClick={() => setActiveFilter('inactive')} />
            <StatCard name="Routines with Steps" icon={Calendar} value={routinesWithSteps} color="#F59E0B" />
          </motion.div>
          <div className="flex space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === "all"
                ? "bg-purple-300 text-black"
                : "bg-gray-300 text-black hover:bg-gray-100"
                }`}
              onClick={() => setActiveFilter("all")}
            >
              All Routines
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === "active"
                ? "bg-green-600 text-white"
                : "bg-gray-300 text-black hover:bg-gray-100"
                }`}
              onClick={() => setActiveFilter("active")}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === "inactive"
                ? "bg-red-100 text-red-800"
                : "bg-gray-300 text-black hover:bg-gray-100"
                }`}
              onClick={() => setActiveFilter("inactive")}
            >
              Inactive
            </button>
          </div>

          <RoutinesTable
            routines={filteredRoutines}
            onCreate={handleCreateRoutine}
            onEdit={handleEditRoutine}
            onView={handleViewRoutine}
            refetchRoutines={fetchRoutinesData}
          />
        </main>
      </div>

      {showCreateModal && (
        <RoutineModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          refetchRoutines={fetchRoutinesData}
          routine={selectedRoutine}
        />
      )}

      {showEditModal && (
        <RoutineModal
          isOpen={showEditModal}
          onClose={handleCloseModal}
          refetchRoutines={fetchRoutinesData}
          routine={selectedRoutine}
        />
      )}

      {showViewModal && (
        <ViewRoutineModal
          isOpen={showViewModal}
          onClose={handleCloseModal}
          onUpdate={fetchRoutinesData}
          routineId={selectedRoutineId}
        />
      )}
    </>
  );
};

export default RoutinesPage;