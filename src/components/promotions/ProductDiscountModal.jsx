import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { setProductDiscount, getProductDiscounts, updateProductDiscountStatus } from '../../utils/api';

const ProductDiscountModal = ({ onClose, products, promotions }) => {
  const [productDiscounts, setProductDiscounts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProductDiscounts = async () => {
    try {
      setLoading(true);
      const data = await getProductDiscounts();
      console.log('Fetched product discounts:', data);
      setProductDiscounts(data);
    } catch (error) {
      console.error('Error fetching product discounts:', error);
      toast.error('Failed to load product discounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDiscounts();
  }, []);

  const handleAddProductDiscount = async () => {
    if (!selectedProduct || !selectedPromotion) {
      toast.error('Please select both a product and a promotion');
      return;
    }

    try {
      const productDiscountData = {
        ProductId: parseInt(selectedProduct),
        PromotionId: parseInt(selectedPromotion)
      };

      console.log('Adding product discount:', productDiscountData);
      await setProductDiscount(productDiscountData);
      
      // Fetch lại data sau khi thêm thành công
      await fetchProductDiscounts();
      
      setSelectedProduct('');
      setSelectedPromotion('');
      toast.success('Product discount added successfully!');
    } catch (error) {
      console.error('Error adding product discount:', error);
      toast.error(`Failed to add product discount: ${error.message || 'Unknown error'}`);
    }
  };

  const handleToggleStatus = async (discount) => {
    try {
      const statusData = {
        ProductId: discount.ProductId,
        PromotionId: discount.PromotionId,
        IsActive: !discount.IsActive
      };

      console.log('Updating status with:', statusData);
      await updateProductDiscountStatus(statusData);
      
      setProductDiscounts(prev =>
        prev.map(d =>
          d.ProductId === discount.ProductId && d.PromotionId === discount.PromotionId
            ? { ...d, IsActive: !d.IsActive }
            : d
        )
      );
      
      toast.success(`Discount ${!discount.IsActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating discount status:', error);
      toast.error(`Failed to update status: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">Manage Product Discounts</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Add New Discount Section */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-black mb-4">Add New Product Discount</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full bg-gray-100 text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a product</option>
                  {products
                  .filter((product) => product.IsActive)
                  .map((product) => (
                    <option key={product.ProductId} value={product.ProductId}>
                      {product.ProductName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Select Promotion <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPromotion}
                  onChange={(e) => setSelectedPromotion(e.target.value)}
                  className="w-full bg-gray-100 text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a promotion</option>
                  {promotions.map((promotion) => (
                    <option key={promotion.PromotionId} value={promotion.PromotionId}>
                      {promotion.Name || promotion.PromotionName} ({promotion.DiscountPercent}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAddProductDiscount}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                Add Discount
              </button>
            </div>
          </div>

          {/* Existing Discounts Section */}
          <div>
            <h3 className="text-lg font-medium text-black mb-4">Existing Product Discounts</h3>

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading product discounts...</p>
              </div>
            ) : productDiscounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Promotion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Discount %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productDiscounts.map((discount) => {
                      const product = products.find(p => p.ProductId === discount.ProductId);
                      const promotion = promotions.find(p => p.PromotionId === discount.PromotionId);
                      return (
                        <tr key={discount.ProductDiscountId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {product ? product.ProductName : 'Unknown Product'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {promotion ? (promotion.Name || promotion.PromotionName) : 'Unknown Promotion'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {discount.DiscountPercent !== null && discount.DiscountPercent !== undefined 
                              ? `${discount.DiscountPercent}%` 
                              : promotion 
                                ? `${promotion.DiscountPercent}% (Default)` 
                                : '0%'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${discount.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {discount.IsActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            <button
                              onClick={() => handleToggleStatus(discount)}
                              className={`text-sm px-2 py-1 rounded ${
                                discount.IsActive
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {discount.IsActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-100 rounded-lg">
                <p className="text-gray-600">No product discounts found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDiscountModal;
