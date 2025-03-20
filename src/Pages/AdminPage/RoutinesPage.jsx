import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { Layers, CheckCircle, XCircle, Calendar } from "lucide-react";

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
      <ToastContainer position="top-right" autoClose={3000} />

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
            <StatCard name="Total Routines" icon={Layers} value={totalRoutines} color="#6366F1" />
            <StatCard name="Active Routines" icon={CheckCircle} value={activeRoutines} color="#10B981" />
            <StatCard name="Inactive Routines" icon={XCircle} value={inactiveRoutines} color="#EF4444" />
            <StatCard name="Routines with Steps" icon={Calendar} value={routinesWithSteps} color="#F59E0B" />
          </motion.div>

          {/* Routines Table */}
          <RoutinesTable
            routines={routines}
            onCreate={handleCreateRoutine}
            onEdit={handleEditRoutine}
            onView={handleViewRoutine}
            refetchRoutines={fetchRoutinesData}
          />
        </main>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <RoutineModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          onSave={fetchRoutinesData}
          onCreate={handleCreateRoutine}
          routine={selectedRoutine}
          isEditing={false}
        />
      )}

      {showEditModal && (
        <RoutineModal
          isOpen={showEditModal}
          onClose={handleCloseModal}
          onSave={fetchRoutinesData}
          routine={selectedRoutine}
          isEditing={true}
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