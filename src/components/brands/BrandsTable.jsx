import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import EditBrandModal from './EditBrandModal';
import PaginationAdmin from '../Pagination/PaginationAdmin';

const BrandsTable = ({ brands, refetchBrands, updateBrand, deleteBrand }) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const brandsPerPage = 8;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [previewUrlEdit, setPreviewUrlEdit] = useState(null);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    // Sort the brands by BrandId in descending order (newest first)
    const sorted = [...brands].sort((a, b) => b.BrandId - a.BrandId);
    // Then filter by the search term
    const filtered = sorted.filter(
      (brand) => brand.Name.toLowerCase().includes(term)
    );
    setFilteredBrands(filtered);
    setCurrentPage(1);
  }, [searchTerm, brands]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(filteredBrands.length / brandsPerPage);
  const indexOfLastBrand = currentPage * brandsPerPage;
  const indexOfFirstBrand = indexOfLastBrand - brandsPerPage;
  const displayedBrands = filteredBrands.slice(indexOfFirstBrand, indexOfLastBrand);

  const handleDelete = (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        deleteBrand(brandId);
        // Xóa brand thành công
        toast.success('Brand deleted successfully!');
        if (refetchBrands) {
          refetchBrands();
        }
      } catch (error) {
        console.error('Error deleting brand:', error);
        toast.error('Failed to delete brand!');
      }
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand({
      BrandId: brand.BrandId,
      Name: brand.Name,
      PictureUrl: brand.PictureUrl,
      IsActive: brand.IsActive
    });
    setPreviewUrlEdit(brand.PictureUrl);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingBrand.Name) {
      toast.error('Please enter the brand name');
      return;
    }

    try {
      // Chỉ gửi những trường được hỗ trợ bởi API
      const brandDataToUpdate = {
        BrandId: editingBrand.BrandId,
        Name: editingBrand.Name,
        PictureFile: editingBrand.PictureFile
      };

      await updateBrand(editingBrand.BrandId, brandDataToUpdate);
      toast.success('Brand updated successfully!');
      setIsEditModalOpen(false);
      setEditingBrand(null);
      setPreviewUrlEdit(null);

      if (refetchBrands) {
        refetchBrands();
      }
    } catch (error) {
      console.error('Error updating brand:', error);
      toast.error(`Failed to update brand: ${error.message || 'Unknown error'}`);
    }
  };

  const getBrandStatusBadge = (brand) => {
    const isActive = !!brand.IsActive;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${isActive ? "bg-green-700 text-white" : "bg-red-800 text-white"
          }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">All Brands</h2>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search brands..."
              className="pl-10 pr-4 py-2 border text-gray-800 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Brand
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Image
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedBrands.length > 0 ? (
                displayedBrands.map((brand) => (
                  <motion.tr
                    key={brand.BrandId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {brand.Name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {brand.PictureUrl && (
                        <img
                          src={brand.PictureUrl}
                          alt={brand.Name}
                          className="h-16 w-auto object-contain"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-900">
                      {getBrandStatusBadge(brand)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.BrandId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No brands found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <PaginationAdmin
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            theme="blue"
            maxVisiblePages={5}
          />
        )}

      </div>

      {isEditModalOpen && (
        <EditBrandModal
          editingBrand={editingBrand}
          setEditingBrand={setEditingBrand}
          previewUrlEdit={previewUrlEdit}
          setPreviewUrlEdit={setPreviewUrlEdit}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingBrand(null);
            setPreviewUrlEdit(null);
          }}
          handleUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default BrandsTable;
