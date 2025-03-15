import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, PlusCircle, Power, Tag } from 'lucide-react';
import { toast } from 'react-toastify';

import CreatePromotionModal from './CreatePromotionModal';
import EditPromotionModal from './EditPromotionModal';
import ProductDiscountModal from './ProductDiscountModal';

import {
  createPromotion,
  updatePromotion,
  deletePromotion,
  fetchProducts,
  deactivatePromotion
} from '../../utils/api';

const PromotionsTable = ({ promotions }) => {
  // -----------------------------------
  // 1) State
  // -----------------------------------
  const [localPromotions, setLocalPromotions] = useState([]);
  const [displayedPromotions, setDisplayedPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [products, setProducts] = useState([]);

  // Edit promotion
  const [editPromotionState, setEditPromotion] = useState(null);

  // Create promotion
  const [newPromotion, setNewPromotion] = useState({
    PromotionName: '',
    DiscountPercent: 0,
    StartDate: '',
    EndDate: '',
    PromotionType: 0,
  });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);      // create promotion
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProductDiscountModalOpen, setIsProductDiscountModalOpen] = useState(false);

  // -----------------------------------
  // 2) Effects
  // -----------------------------------
  // Fetch products for selection
  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  // Map promotions to localPromotions
  useEffect(() => {
    setLocalPromotions(promotions);
  }, [promotions]);

  // Handle search
  useEffect(() => {
    if (!localPromotions) return;

    const term = searchTerm.toLowerCase();
    let filtered = [...localPromotions];
    
    if (term) {
      filtered = localPromotions.filter(
        (promotion) =>
          promotion.Name.toLowerCase().includes(term) ||
          promotion.DiscountPercent.toString().includes(term)
      );
    }
    
    setFilteredPromotions(filtered);
    setCurrentPage(1);
  }, [searchTerm, localPromotions]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (!filteredPromotions) return;
    
    let sortablePromotions = [...filteredPromotions];
    
    if (sortConfig.key) {
      sortablePromotions.sort((a, b) => {
        if (sortConfig.key === 'StartDate' || sortConfig.key === 'EndDate') {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          
          if (sortConfig.direction === 'ascending') {
            return dateA - dateB;
          } else {
            return dateB - dateA;
          }
        } else if (sortConfig.key === 'DiscountPercent') {
          const discountA = parseFloat(a[sortConfig.key]);
          const discountB = parseFloat(b[sortConfig.key]);
          
          if (sortConfig.direction === 'ascending') {
            return discountA - discountB;
          } else {
            return discountB - discountA;
          }
        }
        
        return 0;
      });
    }
    
    // Calculate pagination
    const indexOfLastPromotion = currentPage * productsPerPage;
    const indexOfFirstPromotion = indexOfLastPromotion - productsPerPage;
    const currentPromotions = sortablePromotions.slice(
      indexOfFirstPromotion,
      indexOfLastPromotion
    );
    
    setDisplayedPromotions(currentPromotions);
  }, [filteredPromotions, currentPage, productsPerPage, sortConfig]);

  // Get sort direction icon
  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  // Get promotion type display text
  const getPromotionTypeText = (type) => {
    switch (parseInt(type)) {
      case 1: return 'Product Discount';
      case 2: return 'Order Discount';
      default: return 'Unknown';
    }
  };

  // Get promotion type badge color
  const getPromotionTypeBadgeColor = (type) => {
    switch (parseInt(type)) {
      case 1: return 'bg-blue-900 text-blue-300';
      case 2: return 'bg-green-900 text-green-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  // Get promotion status
  const getPromotionStatus = (promotion) => {
    // Check if promotion has an IsActive property
    if (promotion.hasOwnProperty('IsActive')) {
      return promotion.IsActive;
    }
    
    // If no IsActive property, check dates
    const now = new Date();
    const startDate = new Date(promotion.StartDate);
    const endDate = new Date(promotion.EndDate);
    
    return startDate <= now && now <= endDate;
  };

  // Get promotion status badge
  const getPromotionStatusBadge = (promotion) => {
    const isActive = getPromotionStatus(promotion);
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${
        isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  // -----------------------------------
  // 3) Handlers
  // -----------------------------------
  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(filteredPromotions.length / productsPerPage)) return;
    setCurrentPage(page);
  };

  // Delete promotion
  const handleDelete = async (promotionId) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await deletePromotion(promotionId);
        setLocalPromotions((prev) => prev.filter((p) => p.PromotionId !== promotionId));
        toast.success('Promotion deleted successfully!');
      } catch (error) {
        console.error('Failed to delete promotion:', error);
        toast.error('Error deleting promotion!');
      }
    }
  };

  // Deactivate promotion
  const handleDeactivate = async (id) => {
    try {
      await deactivatePromotion(id);
      
      // Update the local state to reflect the deactivation
      setLocalPromotions((prev) => 
        prev.map((p) => 
          p.PromotionId === id 
            ? { ...p, IsActive: false } 
            : p
        )
      );
      
      toast.success('Promotion deactivated successfully!');
    } catch (error) {
      console.error('Failed to deactivate promotion:', error);
      toast.error(`Failed to deactivate promotion: ${error.message || 'Unknown error'}`);
    }
  };

  // Open Edit modal
  const handleOpenEditModal = (promotion) => {
    setEditPromotion({
      ...promotion,
      StartDate: new Date(promotion.StartDate).toISOString().split('T')[0],
      EndDate: new Date(promotion.EndDate).toISOString().split('T')[0]
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleEdit = async () => {
    if (!editPromotionState) return;
    if (
      !editPromotionState.PromotionName ||
      !editPromotionState.StartDate ||
      !editPromotionState.EndDate ||
      !editPromotionState.PromotionType ||
      editPromotionState.DiscountPercent < 0
    ) {
      toast.error(
        'Please fill in all required fields: Promotion Name, Start Date, End Date, Promotion Type, and Discount Percentage'
      );
      return;
    }

    try {
      const updated = await updatePromotion(editPromotionState.PromotionId, editPromotionState);

      // Update localPromotions
      setLocalPromotions((prev) => prev.map((p) => (p.PromotionId === updated.PromotionId ? updated : p)));
      toast.success('Promotion updated successfully!');

      // Reset
      setIsEditModalOpen(false);
      setEditPromotion(null);
    } catch (error) {
      console.error('Failed to update promotion:', error);
      toast.error(`Failed to update promotion: ${error.message || 'Unknown error'}`);
    }
  };

  // Submit Create promotion
  const handleAddPromotion = async () => {
    if (!newPromotion.PromotionName || !newPromotion.StartDate || !newPromotion.EndDate || !newPromotion.PromotionType) {
      toast.error('Please fill in all required fields: Promotion Name, Start Date, End Date, and Promotion Type');
      return;
    }
    try {
      const created = await createPromotion(newPromotion);
      setLocalPromotions((prev) => [created, ...prev]);
      setIsModalOpen(false);

      // Reset form
      setNewPromotion({
        PromotionName: '',
        DiscountPercent: 0,
        StartDate: '',
        EndDate: '',
        PromotionType: 1,
        ApplicableProducts: []
      });
      toast.success('New promotion added successfully!');
    } catch (error) {
      toast.error('Failed to add promotion:', error);
    }
  };

  // Open Product Discount Modal
  const handleOpenProductDiscountModal = () => {
    setIsProductDiscountModalOpen(true);
  };

  // -----------------------------------
  // 4) Render
  // -----------------------------------
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(Math.ceil(filteredPromotions.length / productsPerPage), startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key="page-1"
          onClick={() => handlePageChange(1)}
          className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="px-2 py-2">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={`page-${i}`}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < Math.ceil(filteredPromotions.length / productsPerPage)) {
      if (endPage < Math.ceil(filteredPromotions.length / productsPerPage) - 1) {
        pages.push(<span key="end-ellipsis" className="px-2 py-2">...</span>);
      }
      pages.push(
        <button
          key={`page-${Math.ceil(filteredPromotions.length / productsPerPage)}`}
          onClick={() => handlePageChange(Math.ceil(filteredPromotions.length / productsPerPage))}
          className={`px-4 py-2 rounded-lg ${currentPage === Math.ceil(filteredPromotions.length / productsPerPage) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          {Math.ceil(filteredPromotions.length / productsPerPage)}
        </button>
      );
    }
    return pages;
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* --- Edit Modal --- */}
      {isEditModalOpen && editPromotionState && (
        <EditPromotionModal
          editPromotionState={editPromotionState}
          setEditPromotion={setEditPromotion}
          products={products}
          handleEdit={handleEdit}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* --- Header (Search & Buttons) --- */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Promotions</h2>
        <div className="flex gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or description..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          {/* Product Discount Button */}
          <button
            className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            onClick={handleOpenProductDiscountModal}
          >
            <Tag size={18} className="mr-2" />
            <span>Product Discounts</span>
          </button>

          {/* Add Promotion */}
          <button
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={18} />
            Add Promotion
          </button>
        </div>
      </div>

      {/* --- Modal Create Promotion --- */}
      {isModalOpen && (
        <CreatePromotionModal
          newPromotion={newPromotion}
          setNewPromotion={setNewPromotion}
          products={products}
          handleAddPromotion={handleAddPromotion}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* --- Product Discount Modal --- */}
      {isProductDiscountModalOpen && (
        <ProductDiscountModal
          onClose={() => setIsProductDiscountModalOpen(false)}
          products={products}
          promotions={localPromotions.filter(p => p.PromotionType === 1)} // Only pass Product Discount type promotions
        />
      )}

      {/* --- Table Promotions --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Name
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase cursor-pointer hover:text-gray-300"
                onClick={() => requestSort('DiscountPercent')}
              >
                Discount % {getSortDirectionIcon('DiscountPercent')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase cursor-pointer hover:text-gray-300"
                onClick={() => requestSort('StartDate')}
              >
                Start Date {getSortDirectionIcon('StartDate')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase cursor-pointer hover:text-gray-300"
                onClick={() => requestSort('EndDate')}
              >
                End Date {getSortDirectionIcon('EndDate')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {displayedPromotions.map((promotion, index) => (
              <motion.tr
                key={promotion.PromotionId || index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {promotion.Name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {promotion.DiscountPercent}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(promotion.StartDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(promotion.EndDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <span className={`px-2 py-1 rounded-full text-xs ${getPromotionTypeBadgeColor(promotion.PromotionType)}`}>
                    {getPromotionTypeText(promotion.PromotionType)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {getPromotionStatusBadge(promotion)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {/* Edit Button */}
                  <button
                    className="text-indigo-400 hover:text-indigo-300 mr-2"
                    onClick={() => handleOpenEditModal(promotion)}
                    title="Edit promotion"
                  >
                    <Edit size={18} />
                  </button>
                  
                  {/* Deactivate Button */}
                  <button
                    className="text-yellow-400 hover:text-yellow-300 mr-2"
                    onClick={() => handleDeactivate(promotion.PromotionId)}
                    title="Deactivate promotion"
                  >
                    <Power size={18} />
                  </button>
                  
                  {/* Delete Button */}
                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(promotion.PromotionId)}
                    title="Delete promotion"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Pagination --- */}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 mx-2 rounded-lg ${currentPage === 1
            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
            : 'bg-gray-700 text-white'
            }`}
        >
          Previous
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredPromotions.length / productsPerPage)}
          className={`px-4 py-2 mx-2 rounded-lg ${currentPage === Math.ceil(filteredPromotions.length / productsPerPage)
            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
            : 'bg-gray-700 text-white'
            }`}
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

export default PromotionsTable;
