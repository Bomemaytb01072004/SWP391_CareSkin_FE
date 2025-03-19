import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Edit, Trash, Search, Eye, Layers } from 'lucide-react';
import { deleteRoutine } from '../../utils/apiOfRoutine';

const RoutinesTable = ({ routines, onEdit, onView, refetchRoutines }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRoutines, setFilteredRoutines] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const routinesPerPage = 8;

  useEffect(() => {
    // Sort routines by ID in descending order (newest first)
    const sorted = Array.isArray(routines) ? [...routines].sort((a, b) => b.RoutineId - a.RoutineId) : [];
    
    // Then filter by search term
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
        isActive ? 'bg-green-700 text-white' : 'bg-red-800 text-white'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const totalPages = Math.ceil(filteredRoutines.length / routinesPerPage);
  const indexOfLastRoutine = currentPage * routinesPerPage;
  const indexOfFirstRoutine = indexOfLastRoutine - routinesPerPage;
  const displayedRoutines = filteredRoutines.slice(indexOfFirstRoutine, indexOfLastRoutine);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key="page-1"
          onClick={() => handlePageChange(1)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          1
        </button>
      );

      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-1" className="px-4 py-2 text-gray-400">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={`page-${i}`}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-2" className="px-4 py-2 text-gray-400">
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={`page-${totalPages}`}
          onClick={() => handlePageChange(totalPages)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
      {/* Search and filter */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">All Routines</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search routines..."
            className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Period
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Skin Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Steps
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {displayedRoutines.length > 0 ? (
              displayedRoutines.map((routine) => (
                <motion.tr 
                  key={routine.RoutineId} 
                  className="hover:bg-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    {routine.RoutineName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                    {routine.RoutinePeriod || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {routine.SkinTypeName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center">
                      <Layers size={16} className="mr-2 text-blue-400" />
                      <span>
                        {routine.RoutineStepDTOs ? routine.RoutineStepDTOs.length : 0} steps
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {getStatusBadge(routine.IsActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onView(routine)}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded-full hover:bg-gray-700 transition"
                        title="View Routine"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(routine)}
                        className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-gray-700 transition"
                        title="Edit Routine"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(routine.RoutineId)}
                        className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-gray-700 transition"
                        title="Delete Routine"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                  No routines found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-700 flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RoutinesTable;
