import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, PlusCircle, Power, Tag } from 'lucide-react';
import { toast } from 'react-toastify';

import CreatePromotionModal from './CreatePromotionModal';
import EditPromotionModal from './EditPromotionModal';
import ProductDiscountModal from './ProductDiscountModal';
import PaginationAdmin from '../Pagination/PaginationAdmin';

import {
  createPromotion,
  updatePromotion,
  deletePromotion,
  fetchProducts,
  deactivatePromotion
} from '../../utils/api';

const PromotionsTable = ({ promotions, refetchPromotions }) => {
  const [localPromotions, setLocalPromotions] = useState([]);
  const [displayedPromotions, setDisplayedPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [products, setProducts] = useState([]);

  const [editPromotionState, setEditPromotion] = useState(null);

  const [newPromotion, setNewPromotion] = useState({
    PromotionName: '',
    DiscountPercent: 0,
    StartDate: '',
    EndDate: '',
    PromotionType: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);      // create promotion
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProductDiscountModalOpen, setIsProductDiscountModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  useEffect(() => {
    if (promotions && promotions.length > 0) {
      // Sắp xếp theo ID giảm dần (giả sử ID lớn hơn = mới hơn)
      const sortedPromotions = [...promotions].sort((a, b) => b.PromotionId - a.PromotionId);
      setLocalPromotions(sortedPromotions);
    }
  }, [promotions]);

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

          return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        } else if (sortConfig.key === 'DiscountPercent') {
          const discountA = parseFloat(a[sortConfig.key]);
          const discountB = parseFloat(b[sortConfig.key]);

          return sortConfig.direction === 'ascending' ? discountA - discountB : discountB - discountA;
        }
        return 0;
      });
    } else {
      // Sắp xếp mặc định theo ID giảm dần nếu không có sort config
      sortablePromotions.sort((a, b) => b.PromotionId - a.PromotionId);
    }

    // Calculate pagination
    const indexOfLastPromotion = currentPage * productsPerPage;
    const indexOfFirstPromotion = indexOfLastPromotion - productsPerPage;
    const currentPromotions = sortablePromotions.slice(indexOfFirstPromotion, indexOfLastPromotion);

    setDisplayedPromotions(currentPromotions);
  }, [filteredPromotions, currentPage, productsPerPage, sortConfig]);

  // Get sort direction icon
  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) return null;
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

  const getPromotionTypeBadgeColor = (type) => {
    switch (parseInt(type)) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getPromotionStatus = (promotion) => {
    if (promotion.hasOwnProperty('IsActive')) {
      return promotion.IsActive;
    }
    const now = new Date();
    const startDate = new Date(promotion.StartDate);
    const endDate = new Date(promotion.EndDate);
    return startDate <= now && now <= endDate;
  };

  const getPromotionStatusBadge = (promotion) => {
    const isActive = getPromotionStatus(promotion);
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(filteredPromotions.length / productsPerPage)) return;
    setCurrentPage(page);
  };

  const handleDelete = async (promotionId) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await deletePromotion(promotionId);
        setLocalPromotions((prev) => prev.filter((p) => p.PromotionId !== promotionId));
        toast.success('Promotion deleted successfully!');
        refetchPromotions();
      } catch (error) {
        console.error('Failed to delete promotion:', error);
        toast.error('Error deleting promotion!');
      }
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await deactivatePromotion(id);
      setLocalPromotions((prev) =>
        prev.map((p) => (p.PromotionId === id ? { ...p, IsActive: false } : p))
      );
      toast.success('Promotion deactivated successfully!');
      refetchPromotions();
    } catch (error) {
      console.error('Failed to deactivate promotion:', error);
      toast.error(`Failed to deactivate promotion: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEditClick = (promotion) => {
    // Make sure we have all required fields with correct types
    const editState = {
      ...promotion,
      PromotionId: promotion.PromotionId,
      Name: promotion.Name || promotion.PromotionName,
      PromotionType: Number(promotion.PromotionType),
      DiscountPercent: Number(promotion.DiscountPercent),
      StartDate: promotion.StartDate,
      EndDate: promotion.EndDate,
      ApplicableProducts: promotion.ApplicableProducts || []
    };

    console.log('Opening edit modal with state:', editState);
    setEditPromotion(editState);
    setIsEditModalOpen(true);
  };

  const handleEdit = async () => {
    if (!editPromotionState) return;

    // Log the current state for debugging
    console.log('Editing promotion with state:', editPromotionState);

    if (
      !editPromotionState.Name ||
      !editPromotionState.StartDate ||
      !editPromotionState.EndDate ||
      !editPromotionState.PromotionType ||
      editPromotionState.DiscountPercent < 0
    ) {
      toast.error('Please fill in all required fields: Promotion Name, Start Date, End Date, Promotion Type, and Discount Percentage');
      return;
    }

    try {
      // Prepare the data for the API
      const promotionData = {
        ...editPromotionState,
        PromotionName: editPromotionState.Name, // Map Name to PromotionName for API
      };

      const updated = await updatePromotion(editPromotionState.PromotionId, promotionData);
      setLocalPromotions((prev) => prev.map((p) => (p.PromotionId === updated.PromotionId ? updated : p)));
      toast.success('Promotion updated successfully!');
      setIsEditModalOpen(false);
      setEditPromotion(null);
      refetchPromotions();
    } catch (error) {
      console.error('Failed to update promotion:', error);
      toast.error(`Failed to update promotion: ${error.message || 'Unknown error'}`);
    }
  };

  const handleAddPromotion = async () => {
    if (!newPromotion.PromotionName || !newPromotion.StartDate || !newPromotion.EndDate || !newPromotion.PromotionType) {
      toast.error('Please fill in all required fields: Promotion Name, Start Date, End Date, and Promotion Type');
      return;
    }
    try {
      const created = await createPromotion(newPromotion);
      
      setLocalPromotions((prev) => [created, ...prev]);
      
      setIsModalOpen(false);
      setNewPromotion({
        PromotionName: '',
        DiscountPercent: 0,
        StartDate: '',
        EndDate: '',
        PromotionType: 1,
        ApplicableProducts: []
      });
      
      setCurrentPage(1);
      
      setSortConfig({ key: null, direction: 'ascending' });
      
      toast.success('New promotion added successfully!');
      
      // Chỉ fetch lại khi thực sự cần thiết
      // refetchPromotions(); // Comment dòng này lại
    } catch (error) {
      toast.error('Failed to add promotion:', error);
    }
  };

  const handleOpenProductDiscountModal = () => {
    setIsProductDiscountModalOpen(true);
  };

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
          className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-blue-300 text-black' : 'bg-gray-200 text-black'}`}
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
          className={`px-4 py-2 rounded-lg ${currentPage === i ? 'bg-blue-300 text-black' : 'bg-gray-200 text-black'}`}
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
          className={`px-4 py-2 rounded-lg ${currentPage === Math.ceil(filteredPromotions.length / productsPerPage) ? 'bg-blue-300 text-black' : 'bg-gray-200 text-black'}`}
        >
          {Math.ceil(filteredPromotions.length / productsPerPage)}
        </button>
      );
    }
    return pages;
  };

  return (
    <motion.div
      className="bg-white shadow-lg rounded-xl p-6 border border-gray-300 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {isEditModalOpen && editPromotionState && (
        <EditPromotionModal
          editPromotionState={editPromotionState}
          setEditPromotion={setEditPromotion}
          handleEdit={handleEdit}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">Promotions</h2>
        <div className="flex gap-4">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search by name or description..."
              className="w-full bg-gray-100 text-black placeholder-gray-500 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
          </div>

          <button
            className="flex items-center bg-purple-300 hover:bg-purple-400 text-black px-4 py-2 rounded-lg"
            onClick={handleOpenProductDiscountModal}
          >
            <Tag size={18} className="mr-2" />
            <span>Product Discounts</span>
          </button>

          <button
            className="flex items-center gap-2 bg-green-300 text-black px-4 py-2 rounded-lg hover:bg-green-400"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={18} />
            Add Promotion
          </button>
        </div>
      </div>

      {isModalOpen && (
        <CreatePromotionModal
          newPromotion={newPromotion}
          setNewPromotion={setNewPromotion}
          handleAddPromotion={handleAddPromotion}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isProductDiscountModalOpen && (
        <ProductDiscountModal
          onClose={() => setIsProductDiscountModalOpen(false)}
          products={products}
          promotions={localPromotions.filter(p => p.PromotionType === 1 && p.IsActive)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                Name
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-black uppercase cursor-pointer hover:text-gray-700"
                onClick={() => requestSort('DiscountPercent')}
              >
                Discount % {getSortDirectionIcon('DiscountPercent')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-black uppercase cursor-pointer hover:text-gray-700"
                onClick={() => requestSort('StartDate')}
              >
                Start Date {getSortDirectionIcon('StartDate')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-black uppercase cursor-pointer hover:text-gray-700"
                onClick={() => requestSort('EndDate')}
              >
                End Date {getSortDirectionIcon('EndDate')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-300">
            {displayedPromotions.map((promotion, index) => (
              <motion.tr
                key={promotion.PromotionId || index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                  {promotion.Name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {promotion.DiscountPercent}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {new Date(promotion.StartDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {new Date(promotion.EndDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  <span className={`px-2 py-1 rounded-full text-xs ${getPromotionTypeBadgeColor(promotion.PromotionType)}`}>
                    {getPromotionTypeText(promotion.PromotionType)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {getPromotionStatusBadge(promotion)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  <button
                    className="text-indigo-600 hover:text-indigo-500 mr-2"
                    onClick={() => handleEditClick(promotion)}
                    title="Edit promotion"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="text-yellow-600 hover:text-yellow-500 mr-2"
                    onClick={() => handleDeactivate(promotion.PromotionId)}
                    title="Deactivate promotion"
                  >
                    <Power size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-300 flex justify-center">
        <PaginationAdmin
          currentPage={currentPage}
          totalPages={Math.ceil(filteredPromotions.length / productsPerPage)}
          onPageChange={handlePageChange}
          theme="blue"
          maxVisiblePages={5}
        />
      </div>
    </motion.div>
  );
};

export default PromotionsTable;
