import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Plus, Eye, Edit, Layers } from 'lucide-react';
import { fetchRoutines } from '../../utils/apiOfRoutine';
import RoutinesTable from '../../components/routines/RoutinesTable';
import RoutineModal from '../../components/routines/RoutineModal';
import ViewRoutineModal from '../../components/routines/ViewRoutineModal';

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
      console.log('Routines data:', data);
      if (Array.isArray(data)) {
        setRoutines(data);
      } else {
        console.error('Data received is not an array:', data);
        setRoutines([]);
      }
    } catch (error) {
      console.error('Error fetching routines:', error);
      toast.error('Failed to load routines. Please try again.');
      setRoutines([]);
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
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex-1 overflow-auto relative bg-gray-900 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Skin Care Routines</h1>
        </div>

        <main className="max-w-7xl mx-auto py-2 px-4 lg:px-8">
          {/* Header with Add Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-xl font-medium">Manage Routines</div>
            <button
              onClick={handleCreateRoutine}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center transition duration-200"
            >
              <Plus size={18} className="mr-1" />
              Add New Routine
            </button>
          </div>

          {/* Content */}
          <div>
            <RoutinesTable
              routines={routines}
              onEdit={handleEditRoutine}
              onView={handleViewRoutine}
              refetchRoutines={fetchRoutinesData}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <RoutineModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          onSave={fetchRoutinesData}
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