import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { setProductDiscount, getProductDiscounts, updateProductDiscountStatus } from '../../utils/api';

const ProductDiscountModal = ({ onClose, products, promotions }) => {
  const [productDiscounts, setProductDiscounts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDiscounts = async () => {
      try {
        setLoading(true);
        const data = await getProductDiscounts();
        setProductDiscounts(data);
      } catch (error) {
        console.error('Error fetching product discounts:', error);
        toast.error('Failed to load product discounts');
      } finally {
        setLoading(false);
      }
    };

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

      const result = await setProductDiscount(productDiscountData);
      
      setProductDiscounts(prev => [...prev, result]);
      
      setSelectedProduct('');
      setSelectedPromotion('');
      setDiscountPercent(0);
      
      toast.success('Product discount added successfully!');
    } catch (error) {
      console.error('Error adding product discount:', error);
      toast.error(`Failed to add product discount: ${error.message || 'Unknown error'}`);
    }
  };

  const handleToggleStatus = async (discountId, currentStatus) => {
    try {
      const statusData = {
        ProductDiscountId: discountId,
        IsActive: !currentStatus
      };

      await updateProductDiscountStatus(statusData);
      
      setProductDiscounts(prev => 
        prev.map(discount => 
          discount.ProductDiscountId === discountId 
            ? { ...discount, IsActive: !currentStatus } 
            : discount
        )
      );
      
      toast.success(`Discount ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating discount status:', error);
      toast.error(`Failed to update status: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Manage Product Discounts</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Add New Product Discount</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.ProductId} value={product.ProductId}>
                      {product.ProductName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Select Promotion <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPromotion}
                  onChange={(e) => setSelectedPromotion(e.target.value)}
                  className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a promotion</option>
                  {promotions
                    .filter(promo => promo.PromotionType === 1) 
                    .map((promotion) => (
                      <option key={promotion.PromotionId} value={promotion.PromotionId}>
                        {promotion.PromotionName} ({promotion.DiscountPercent}%)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Discount Percentage (Optional)
              </label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty to use promotion's default percentage"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-400 mt-1">
                If left empty, the promotion's default discount percentage will be used
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAddProductDiscount}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Add Discount
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">Existing Product Discounts</h3>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="mt-2 text-gray-300">Loading product discounts...</p>
              </div>
            ) : productDiscounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Promotion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Discount %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {productDiscounts.map((discount) => {
                      const product = products.find(p => p.ProductId === discount.ProductId);
                      const promotion = promotions.find(p => p.PromotionId === discount.PromotionId);
                      
                      return (
                        <tr key={discount.ProductDiscountId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {product ? product.ProductName : 'Unknown Product'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {promotion ? promotion.Name : 'Unknown Promotion'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {discount.DiscountPercent || (promotion ? promotion.DiscountPercent : 0)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              discount.IsActive 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-red-900 text-red-300'
                            }`}>
                              {discount.IsActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <button
                              onClick={() => handleToggleStatus(discount.ProductDiscountId, discount.IsActive)}
                              className={`px-3 py-1 rounded-md text-xs font-medium ${
                                discount.IsActive
                                  ? 'bg-red-900 text-red-300 hover:bg-red-800'
                                  : 'bg-green-900 text-green-300 hover:bg-green-800'
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
              <div className="text-center py-8 bg-gray-700 rounded-lg">
                <p className="text-gray-400">No product discounts found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDiscountModal;
