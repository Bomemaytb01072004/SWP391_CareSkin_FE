import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Edit, Trash2, Search, Eye, Layers, Plus } from 'lucide-react';
import { deleteRoutine } from '../../utils/apiOfRoutine';
import PaginationAdmin from '../Pagination/PaginationAdmin';

const RoutinesTable = ({ routines, onEdit, onView, onCreate, refetchRoutines }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRoutines, setFilteredRoutines] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const routinesPerPage = 8;

  useEffect(() => {
    const sorted = Array.isArray(routines) ? [...routines].sort((a, b) => b.RoutineId - a.RoutineId) : [];
    
    const term = searchTerm.toLowerCase();
    const filtered = sorted.filter(
      (routine) => 
        (routine.RoutineName && routine.RoutineName.toLowerCase().includes(term)) ||
        (routine.Description && routine.Description.toLowerCase().includes(term)) ||
        (routine.SkinTypeName && routine.SkinTypeName.toLowerCase().includes(term)) ||
        (routine.RoutinePeriod && routine.RoutinePeriod.toLowerCase().includes(term))
    );
    
    setFilteredRoutines(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, routines]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this routine?')) {
      return;
    }

    try {
      await deleteRoutine(id);
      toast.success('Routine deleted successfully');
      refetchRoutines();
    } catch (error) {
      console.error('Error deleting routine:', error);
      toast.error('Failed to delete routine');
    }
  };

  const getStatusBadge = (isActive) => (
    <span
      className={`px-2 py-1 rounded-full text-xs ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const totalPages = Math.ceil(filteredRoutines.length / routinesPerPage);
  const indexOfLastRoutine = currentPage * routinesPerPage;
  const indexOfFirstRoutine = indexOfLastRoutine - routinesPerPage;
  const displayedRoutines = filteredRoutines.slice(indexOfFirstRoutine, indexOfLastRoutine);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Search and Add Button */}
      <div className="p-4 border-b border-gray-300 flex items-center justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search routines..."
            className="pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
        </div>
        <button
          onClick={onCreate} // Gọi hàm onCreate khi nhấn nút
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center transition duration-200"
        >
          <Plus size={18} className="mr-1" />
          Add New Routine
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Period
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Skin Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Steps
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-300">
            {displayedRoutines.length > 0 ? (
              displayedRoutines.map((routine) => (
                <motion.tr 
                  key={routine.RoutineId} 
                  className="hover:bg-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                    {routine.RoutineName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black capitalize">
                    {routine.RoutinePeriod || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {routine.SkinTypeName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    <div className="flex items-center">
                      <Layers size={16} className="mr-2 text-blue-500" />
                      <span>
                        {routine.RoutineStepDTOs ? routine.RoutineStepDTOs.length : 0} steps
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {getStatusBadge(routine.IsActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onView(routine)}
                        className="text-blue-600 hover:text-blue-400 p-1 rounded-full hover:bg-gray-200 transition"
                        title="View & Edit Step Routine"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(routine)}
                        className="text-yellow-400 hover:text-yellow-300"
                        title="Edit Routine"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(routine.RoutineId)}
                        className="text-red-600 hover:text-red-400 p-1 rounded-full hover:bg-gray-200 transition"
                        title="Delete Routine"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-black">
                  No routines found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-300 flex justify-center">
          <PaginationAdmin
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            theme="blue"
            maxVisiblePages={5}
          />
        </div>
      )}
    </div>
  );
};

export default RoutinesTable;
