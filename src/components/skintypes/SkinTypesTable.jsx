import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, PlusCircle, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

import CreateSkinTypeModal from './CreateSkinTypeModal';
import EditSkinTypeModal from './EditSkinTypeModal';
import ViewSkinTypeModal from './ViewSkinTypeModal';
import PaginationAdmin from '../Pagination/PaginationAdmin';

import {
  createSkinType,
  updateSkinType,
  deleteSkinType,
} from '../../utils/api';

const SkinTypesTable = ({ skinTypes, refetchSkinTypes }) => {
  // -----------------------------------
  // 1) State
  // -----------------------------------
  const [localSkinTypes, setLocalSkinTypes] = useState([]);
  const [displayedSkinTypes, setDisplayedSkinTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [skinTypesPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filteredSkinTypes, setFilteredSkinTypes] = useState([]);

  // Edit SkinType
  const [editSkinTypeState, setEditSkinType] = useState(null);
  const [viewSkinTypeState, setViewSkinType] = useState(null);

  // Create SkinType
  const [newSkinType, setNewSkinType] = useState({
    TypeName: '',
    MinScore: 0,
    MaxScore: 0,
    Description: '',
    IsActive: true
  });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);       // create skin type
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // edit skin type
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // view skin type

  // -----------------------------------
  // 2) Effects
  // -----------------------------------
  // Map skinTypes to localSkinTypes
  useEffect(() => {
    if (skinTypes) {
      setLocalSkinTypes(skinTypes);
    }
  }, [skinTypes]);

  // Handle search
  useEffect(() => {
    if (!localSkinTypes) return;

    const term = searchTerm.toLowerCase();
    let filtered = [...localSkinTypes];

    if (term) {
      filtered = localSkinTypes.filter(
        (skinType) =>
          skinType.TypeName.toLowerCase().includes(term) ||
          (skinType.Description && skinType.Description.toLowerCase().includes(term))
      );
    }

    setFilteredSkinTypes(filtered);
    setCurrentPage(1);
  }, [searchTerm, localSkinTypes]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (!filteredSkinTypes || filteredSkinTypes.length === 0) return;

    let sortableSkinTypes = [...filteredSkinTypes];

    if (sortConfig.key) {
      sortableSkinTypes.sort((a, b) => {
        if (sortConfig.key === 'TypeName') {
          const valueA = (a[sortConfig.key] || '').toLowerCase();
          const valueB = (b[sortConfig.key] || '').toLowerCase();

          if (sortConfig.direction === 'ascending') {
            return valueA.localeCompare(valueB);
          } else {
            return valueB.localeCompare(valueA);
          }
        } else if (sortConfig.key === 'MinScore' || sortConfig.key === 'MaxScore') {
          const valueA = a[sortConfig.key] || 0;
          const valueB = b[sortConfig.key] || 0;

          if (sortConfig.direction === 'ascending') {
            return valueA - valueB;
          } else {
            return valueB - valueA;
          }
        }

        return 0;
      });
    }

    // Calculate pagination
    const indexOfLastSkinType = currentPage * skinTypesPerPage;
    const indexOfFirstSkinType = indexOfLastSkinType - skinTypesPerPage;
    const currentSkinTypes = sortableSkinTypes.slice(
      indexOfFirstSkinType,
      indexOfLastSkinType
    );
    const totalPages = filteredSkinTypes ? Math.ceil(filteredSkinTypes.length / skinTypesPerPage) : 0;

    setDisplayedSkinTypes(currentSkinTypes);
  }, [filteredSkinTypes, currentPage, skinTypesPerPage, sortConfig]);

  // Get sort direction icon
  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  // -----------------------------------
  // 3) Handlers
  // -----------------------------------
  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(filteredSkinTypes.length / skinTypesPerPage)) return;
    setCurrentPage(page);
  };

  // Toggle skin type active status
  const handleToggleActive = async (skinType) => {
    try {
      const updatedSkinType = { ...skinType, IsActive: !skinType.IsActive };
      await updateSkinType(skinType.SkinTypeId, updatedSkinType);

      // Update local state
      setLocalSkinTypes(prev =>
        prev.map(st => st.SkinTypeId === skinType.SkinTypeId ? { ...st, IsActive: !st.IsActive } : st)
      );

      toast.success(`Skin type ${updatedSkinType.IsActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle skin type status:', error);
      toast.error('Error updating skin type status!');
    }
  };

  // Delete skin type
  const handleDelete = async (skinTypeId) => {
    if (window.confirm('Are you sure you want to delete this skin type?')) {
      try {
        await deleteSkinType(skinTypeId);
        setLocalSkinTypes((prev) => prev.filter((st) => st.SkinTypeId !== skinTypeId));
        toast.success('Skin type deleted successfully!');
      } catch (error) {
        console.error('Failed to delete skin type:', error);
        toast.error('Error deleting skin type!');
      }
    }
  };

  // Open Edit modal
  const handleOpenEditModal = (skinType) => {
    setEditSkinType({
      ...skinType
    });
    setIsEditModalOpen(true);
  };

  // Open View modal
  const handleOpenViewModal = (skinType) => {
    setViewSkinType(skinType);
    setIsViewModalOpen(true);
  };

  // Submit Edit
  const handleEdit = async () => {
    if (!editSkinTypeState) return;
    if (
      !editSkinTypeState.TypeName ||
      editSkinTypeState.MinScore === undefined ||
      editSkinTypeState.MaxScore === undefined ||
      !editSkinTypeState.Description
    ) {
      toast.error(
        'Please fill in all required fields: Type Name, Min Score, Max Score, and Description'
      );
      return;
    }

    if (editSkinTypeState.MinScore >= editSkinTypeState.MaxScore) {
      toast.error('Min Score must be less than Max Score');
      return;
    }

    try {
      const updated = await updateSkinType(editSkinTypeState.SkinTypeId, editSkinTypeState);

      // Update localSkinTypes
      setLocalSkinTypes((prev) =>
        prev.map((skinType) => (skinType.SkinTypeId === updated.SkinTypeId ? updated : skinType))
      );

      setIsEditModalOpen(false);
      toast.success('Skin type updated successfully!');

      // Refresh the skin types data
      if (refetchSkinTypes) {
        refetchSkinTypes();
      }
    } catch (error) {
      console.error('Failed to update skin type:', error);
      toast.error('Error updating skin type!');
    }
  };

  // Add a new skin type
  const handleAddSkinType = async () => {
    if (
      !newSkinType.TypeName ||
      newSkinType.MinScore === undefined ||
      newSkinType.MaxScore === undefined ||
      !newSkinType.Description
    ) {
      toast.error('Please fill in all required fields: Type Name, Min Score, Max Score, and Description');
      return;
    }

    if (newSkinType.MinScore >= newSkinType.MaxScore) {
      toast.error('Min Score must be less than Max Score');
      return;
    }

    try {
      const createdSkinType = await createSkinType(newSkinType);
      setLocalSkinTypes((prev) => [createdSkinType, ...prev]);
      
      setCurrentPage(1);
      
      setNewSkinType({
        TypeName: '',
        MinScore: 0,
        MaxScore: 0,
        Description: '',
        IsActive: true
      });
      
      setIsModalOpen(false);
      toast.success('Skin type created successfully!');
      
      // Refresh the skin types data
      if (refetchSkinTypes) {
        refetchSkinTypes();
      }
    } catch (error) {
      console.error('Failed to create skin type:', error);
      toast.error('Error creating skin type!');
    }
  };

  // -----------------------------------
  // 4) Render Table
  // -----------------------------------
  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={18} />
          <input
            type="text"
            placeholder="Search skin types..."
            className="w-full bg-gray-100 text-black pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Add Skin Type Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle size={18} />
          <span>Add New Skin Type</span>
        </motion.button>
      </div>

      {/* Skin Types Table */}
      <div className="overflow-hidden rounded-xl border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y bg-white">
            <thead className="bg-white">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('TypeName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Type Name</span>
                    <span>{getSortDirectionIcon('TypeName')}</span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('MinScore')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Min Score</span>
                    <span>{getSortDirectionIcon('MinScore')}</span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('MaxScore')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Max Score</span>
                    <span>{getSortDirectionIcon('MaxScore')}</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedSkinTypes && displayedSkinTypes.length > 0 ? (
                displayedSkinTypes.map((skinType) => (
                  <tr key={skinType.SkinTypeId} className="hover:bg-gray-100 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {skinType.TypeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {skinType.MinScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {skinType.MaxScore}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      {skinType.Description ?
                        (skinType.Description.length > 50 ?
                          `${skinType.Description.substring(0, 50)}...` :
                          skinType.Description) :
                        'No description'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex justify-center">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${skinType.IsActive ? 'bg-green-800 text-green-100' : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {skinType.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          className="text-blue-600 hover:text-blue-400 p-1 rounded-full hover:bg-gray-200 transition"
                          onClick={() => handleOpenViewModal(skinType)}
                          title="View skin type"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="text-yellow-400 hover:text-yellow-300"
                          onClick={() => handleOpenEditModal(skinType)}
                          title="Edit skin type"
                        >
                          <Edit size={18} />
                        </button>
                        {/* <button
                          className={`${skinType.IsActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                          onClick={() => handleToggleActive(skinType)}
                          title={skinType.IsActive ? 'Deactivate skin type' : 'Activate skin type'}
                        >
                          <Power size={18} />
                        </button> */}
                        <button
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDelete(skinType.SkinTypeId)}
                          title="Delete skin type"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-black">
                    {searchTerm ? 'No skin types found matching your search.' : 'No skin types available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredSkinTypes && filteredSkinTypes.length > skinTypesPerPage && (
          <div className="flex justify-center">
            <PaginationAdmin
              currentPage={currentPage}
              totalPages={Math.ceil(filteredSkinTypes.length / skinTypesPerPage)}
              onPageChange={handlePageChange}
              theme="blue"
              maxVisiblePages={5}
            />
          </div>
        )}
      </div>

      {/* Pagination */}


      {/* Create Skin Type Modal */}
      {isModalOpen && (
        <CreateSkinTypeModal
          newSkinType={newSkinType}
          setNewSkinType={setNewSkinType}
          handleAddSkinType={handleAddSkinType}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Edit Skin Type Modal */}
      {isEditModalOpen && (
        <EditSkinTypeModal
          editSkinTypeState={editSkinTypeState}
          setEditSkinType={setEditSkinType}
          handleEdit={handleEdit}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* View Skin Type Modal */}
      {isViewModalOpen && (
        <ViewSkinTypeModal
          skinType={viewSkinTypeState}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
};

export default SkinTypesTable;
