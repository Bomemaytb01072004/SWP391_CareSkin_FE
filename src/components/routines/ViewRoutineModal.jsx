import React, { useState, useEffect } from 'react';
import { X, Plus, ArrowDownCircle, ArrowUpCircle, Trash, Save, ShoppingBag, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchRoutineById,
  fetchRoutineStepsByRoutineId,
  fetchRoutineProductsByStepId,
  updateRoutineStep,
  createRoutineStep,
  deleteRoutineStep,
  createRoutineProduct,
  deleteRoutineProduct,
  updateRoutineProduct
} from '../../utils/apiOfRoutine';
import { fetchProducts } from '../../utils/api';

const ViewRoutineModal = ({ isOpen, onClose, routineId, refetchRoutines }) => {
  const [routine, setRoutine] = useState(null);
  const [steps, setSteps] = useState([]);
  const [products, setProducts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);

  const [editStepId, setEditStepId] = useState(null);
  const [editStepData, setEditStepData] = useState({ StepName: '', Description: '' });

  const [showAddStepForm, setShowAddStepForm] = useState(false);
  const [newStep, setNewStep] = useState({
    StepNumber: 1,
    StepName: '',
    Description: ''
  });

  const [showAddProductForm, setShowAddProductForm] = useState({});
  const [newProduct, setNewProduct] = useState({
    ProductId: '',
    Description: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (!isOpen || !routineId) return;

      setIsLoading(true);
      try {
        // Fetch routine details with steps and products
        const routineData = await fetchRoutineById(routineId);
        setRoutine(routineData);

        if (routineData.RoutineStepDTOs && Array.isArray(routineData.RoutineStepDTOs)) {
          // Sort steps by order
          const sortedSteps = [...routineData.RoutineStepDTOs].sort((a, b) => a.StepOrder - b.StepOrder);
          setSteps(sortedSteps);

          // Process products from routine steps
          const productsObj = {};
          sortedSteps.forEach(step => {
            if (step.RoutineProducts && Array.isArray(step.RoutineProducts)) {
              // Map product details from nested structure
              const mappedProducts = step.RoutineProducts.map(rp => ({
                RoutineProductId: rp.RoutineProductId,
                RoutineStepId: rp.RoutineStepId,
                ProductId: rp.ProductId,
                Description: rp.Description || '',
                ProductName: rp.Product?.ProductName || 'Unknown Product',
                ProductImageUrl: rp.Product?.PictureUrl || '',
                ProductCategory: rp.Product?.Category || ''
              }));
              productsObj[step.RoutineStepId] = mappedProducts;
            } else {
              productsObj[step.RoutineStepId] = [];
            }
          });
          setProducts(productsObj);
        } else {
          // Fallback to separate API calls if RoutineStepDTOs is not available
          const stepsData = await fetchRoutineStepsByRoutineId(routineId);
          const sortedSteps = stepsData.sort((a, b) => a.StepOrder - b.StepOrder);
          setSteps(sortedSteps);

          // Initialize products state
          const productsObj = {};
          await Promise.all(
            sortedSteps.map(async (step) => {
              const stepProducts = await fetchRoutineProductsByStepId(step.RoutineStepId);
              productsObj[step.RoutineStepId] = stepProducts;
            })
          );
          setProducts(productsObj);
        }

        const handleEditStep = (step) => {
          setEditStepId(step.RoutineStepId);
          setEditStepData({
            StepName: step.StepName || '',
            Description: step.Description || ''
          });
        };

        // Fetch all products for selection
        const allProductsData = await fetchProducts();
        setAllProducts(allProductsData);

        // Calculate next step number
        if (steps.length > 0) {
          const maxStepNumber = Math.max(...steps.map(s => s.StepNumber || s.StepOrder));
          setNewStep(prev => ({ ...prev, StepNumber: maxStepNumber + 1 }));
        } else {
          setNewStep(prev => ({ ...prev, StepNumber: 1 }));
        }
      } catch (error) {
        console.error('Error loading routine data:', error);
        toast.error('Failed to load routine details');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, routineId]);

  const handleAddStep = async () => {
    if (!newStep.StepName) {
      toast.error('Step name is required');
      return;
    }

    try {
      console.log('Adding step with number:', newStep.StepNumber);
      const stepData = {
        RoutineId: routineId,
        StepOrder: newStep.StepNumber,
        StepName: newStep.StepName,
        Description: newStep.Description
      };

      await createRoutineStep(stepData);
      toast.success('Step added successfully');

      // Refresh steps
      const stepsData = await fetchRoutineStepsByRoutineId(routineId);
      const sortedSteps = stepsData.sort((a, b) => a.StepOrder - b.StepOrder);
      setSteps(sortedSteps);

      // Reset form
      setNewStep({
        StepNumber: sortedSteps.length > 0 ? Math.max(...sortedSteps.map(s => s.StepOrder)) + 1 : 1,
        StepName: '',
        Description: ''
      });
      setShowAddStepForm(false);
    } catch (error) {
      console.error('Error adding step:', error);
      toast.error('Failed to add step');
    }
  };

  const handleDeleteStep = async (stepId) => {
    if (!window.confirm('Are you sure you want to delete this step? All products in this step will also be deleted.')) {
      return;
    }

    try {
      await deleteRoutineStep(stepId);
      toast.success('Step deleted successfully');

      // Refresh steps
      const stepsData = await fetchRoutineStepsByRoutineId(routineId);
      const sortedSteps = stepsData.sort((a, b) => a.StepOrder - b.StepOrder);
      setSteps(sortedSteps);

      // Update products state
      const updatedProducts = { ...products };
      delete updatedProducts[stepId];
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error('Failed to delete step');
    }
  };

  const handleMoveStep = async (stepId, direction) => {
    const currentIndex = steps.findIndex(step => step.RoutineStepId === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    try {
      const stepToMove = steps[currentIndex];
      const otherStep = steps[newIndex];

      // Lưu lại StepOrder ban đầu
      const stepToMoveOrder = stepToMove.StepOrder;
      const otherStepOrder = otherStep.StepOrder;

      // 1. Đổi stepToMove sang giá trị tạm để không trùng StepOrder
      await updateRoutineStep(stepToMove.RoutineStepId, {
        ...stepToMove,
        StepOrder: 999999,
      });

      // 2. Cho otherStep lấy StepOrder cũ của stepToMove
      await updateRoutineStep(otherStep.RoutineStepId, {
        ...otherStep,
        StepOrder: stepToMoveOrder,
      });

      // 3. Cuối cùng, cho stepToMove lấy StepOrder cũ của otherStep
      await updateRoutineStep(stepToMove.RoutineStepId, {
        ...stepToMove,
        StepOrder: otherStepOrder,
      });

      // Refresh steps
      const stepsData = await fetchRoutineStepsByRoutineId(routineId);
      const sortedSteps = stepsData.sort((a, b) => a.StepOrder - b.StepOrder);
      setSteps(sortedSteps);

      toast.success("Step moved successfully!");

    } catch (error) {
      console.error('Error moving step:', error);
      toast.error('Failed to move step');
    }
  };


  const handleAddProduct = async (stepId) => {
    if (!newProduct.ProductId) {
      toast.error('Please select a product');
      return;
    }

    try {
      const productData = {
        RoutineStepId: stepId,
        ProductId: newProduct.ProductId,
        Description: newProduct.Description
      };

      await createRoutineProduct(productData);
      toast.success('Product added successfully');

      // Refresh products for this step
      const stepProducts = await fetchRoutineProductsByStepId(stepId);
      setProducts(prev => ({
        ...prev,
        [stepId]: stepProducts
      }));

      // Reset form
      setNewProduct({
        ProductId: '',
        Description: ''
      });
      setShowAddProductForm(prev => ({
        ...prev,
        [stepId]: false
      }));
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId, stepId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteRoutineProduct(productId);
      toast.success('Product deleted successfully');

      // Refresh products for this step
      const stepProducts = await fetchRoutineProductsByStepId(stepId);
      setProducts(prev => ({
        ...prev,
        [stepId]: stepProducts
      }));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white text-black rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-300 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold">
            {isLoading ? 'Loading Routine...' : `Routine: ${routine?.RoutineName}`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black"
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (


          <div className="p-6 space-y-6">
            {/* Routine Details */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="text-lg font-medium mb-3">Routine Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Name:</p>
                  <p className="text-black">{routine?.RoutineName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Period:</p>
                  <p className="text-black capitalize">{routine?.RoutinePeriod}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Skin Type:</p>
                  <p className="text-black">{routine?.SkinTypeName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Status:</p>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs ${routine?.IsActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                      {routine?.IsActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                {routine?.Description && (
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-gray-600 text-sm">Description:</p>
                    <p className="text-black">{routine?.Description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Steps Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Routine Steps</h4>
                <button
                  onClick={() => setShowAddStepForm(!showAddStepForm)}
                  className="flex items-center px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm"
                >
                  <Plus size={16} className="mr-1" />
                  Add Step
                </button>
              </div>

              {/* Add Step Form */}
              {showAddStepForm && (
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <h5 className="text-md font-medium mb-3">Add New Step</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Step Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newStep.StepNumber}
                        onChange={(e) => setNewStep({ ...newStep, StepNumber: parseInt(e.target.value, 10) })}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Step Name *
                      </label>
                      <input
                        type="text"
                        value={newStep.StepName}
                        onChange={(e) => setNewStep({ ...newStep, StepName: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="Enter step name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newStep.Description}
                        onChange={(e) => setNewStep({ ...newStep, Description: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black h-20"
                        placeholder="Enter step description"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddStepForm(false)}
                        className="px-3 py-1 bg-gray-300 text-black rounded-md mr-2 hover:bg-gray-200 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddStep}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-500 flex items-center text-sm"
                      >
                        <Save size={14} className="mr-1" />
                        Add Step
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Steps List */}
              {steps.length === 0 ? (
                <div className="text-center py-8 bg-gray-100 rounded-lg">
                  <p className="text-gray-600">No steps added yet. Add your first step to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={step.RoutineStepId} className="bg-gray-100 rounded-lg overflow-hidden">
                      <div className="bg-gray-200 p-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-2">
                            {step.StepNumber || step.StepOrder}
                          </span>
                          {editStepId === step.RoutineStepId ? (
                            <input
                              type="text"
                              value={editStepData.StepName}
                              onChange={(e) =>
                                setEditStepData((prev) => ({
                                  ...prev,
                                  StepName: e.target.value,
                                }))
                              }
                              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none"
                              placeholder="Enter step name"
                            />
                          ) : (
                            <h5 className="font-medium">{step.StepName}</h5>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          {editStepId === step.RoutineStepId ? (
                            <>
                              <button
                                onClick={async () => {
                                  try {
                                    await updateRoutineStep(step.RoutineStepId, {
                                      StepName: editStepData.StepName,
                                      Description: editStepData.Description,
                                      StepOrder: step.StepOrder,
                                    });
                                    toast.success("Step updated successfully!");
                                    const stepsData = await fetchRoutineStepsByRoutineId(routineId);
                                    const sortedSteps = stepsData.sort((a, b) => a.StepOrder - b.StepOrder);
                                    setSteps(sortedSteps);
                                    setEditStepId(null);
                                  } catch (error) {
                                    console.error("Error updating step:", error);
                                    toast.error("Failed to update step");
                                  }
                                }}
                                className="p-1 rounded text-green-500 hover:bg-gray-300"
                                title="Save Edit"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={() => setEditStepId(null)}
                                className="p-1 rounded text-gray-500 hover:bg-gray-300"
                                title="Cancel Edit"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditStepId(step.RoutineStepId);
                                  setEditStepData({
                                    StepName: step.StepName || "",
                                    Description: step.Description || "",
                                  });
                                }}
                                className="p-1 rounded text-yellow-500 hover:bg-gray-300"
                                title="Edit Step"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleMoveStep(step.RoutineStepId, 'up')}
                                disabled={index === 0}
                                className={`p-1 rounded ${index === 0 ? 'text-gray-500 cursor-not-allowed' : 'text-blue-400 hover:bg-gray-300'}`}
                                title="Move Up"
                              >
                                <ArrowUpCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleMoveStep(step.RoutineStepId, 'down')}
                                disabled={index === steps.length - 1}
                                className={`p-1 rounded ${index === steps.length - 1 ? 'text-gray-500 cursor-not-allowed' : 'text-blue-400 hover:bg-gray-300'}`}
                                title="Move Down"
                              >
                                <ArrowDownCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteStep(step.RoutineStepId)}
                                className="p-1 rounded text-red-400 hover:bg-gray-300"
                                title="Delete Step"
                              >
                                <Trash size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {editStepId === step.RoutineStepId ? (
                        <div className="p-4">
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Description:
                          </label>
                          <textarea
                            value={editStepData.Description}
                            onChange={(e) =>
                              setEditStepData((prev) => ({
                                ...prev,
                                Description: e.target.value,
                              }))
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none"
                            placeholder="Enter step description"
                          />
                        </div>
                      ) : (
                        step.Description && (
                          <div className="p-4">
                            <div className="mb-4">
                              <p className="text-gray-600 text-sm">Description:</p>
                              <p className="text-black">{step.Description}</p>
                            </div>
                          </div>
                        )
                      )}
                      {/* Phần Products: giữ nguyên chức năng cũ */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h6 className="text-sm font-medium text-gray-600 ml-6">Products in this step</h6>
                          <button
                            onClick={() => setShowAddProductForm(prev => ({ ...prev, [step.RoutineStepId]: !prev[step.RoutineStepId] }))}
                            className="flex items-center px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                          >
                            <Plus size={12} className="mr-1" />
                            Add Product
                          </button>
                        </div>
                        {showAddProductForm[step.RoutineStepId] && (
                          <div className="bg-gray-200 p-3 rounded-lg mb-3">
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Select Product *
                                </label>
                                <select
                                  value={newProduct.ProductId}
                                  onChange={(e) => setNewProduct({ ...newProduct, ProductId: e.target.value })}
                                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                                  required
                                >
                                  <option value="">Select a product</option>
                                  {allProducts
                                  .filter((product) => product.IsActive)
                                  .map((product) => (
                                    <option key={product.ProductId} value={product.ProductId}>
                                      {product.ProductName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Usage Instructions
                                </label>
                                <textarea
                                  value={newProduct.Description}
                                  onChange={(e) => setNewProduct({ ...newProduct, Description: e.target.value })}
                                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm h-16"
                                  placeholder="Optional instructions for using this product"
                                />
                              </div>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setShowAddProductForm(prev => ({ ...prev, [step.RoutineStepId]: false }))}
                                  className="px-3 py-1 bg-gray-300 text-black rounded-md mr-2 hover:bg-gray-200 text-xs"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddProduct(step.RoutineStepId)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-500 flex items-center text-xs"
                                >
                                  <Save size={12} className="mr-1" />
                                  Add Product
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {products[step.RoutineStepId]?.length > 0 ? (
                          <div className="space-y-2">
                            {products[step.RoutineStepId].map((product) => (
                              <div key={product.RoutineProductId} className="flex justify-between items-center p-2 bg-gray-200 rounded">
                                <div className="flex items-center">
                                  <ShoppingBag size={14} className="text-indigo-400 mr-2" />
                                  <div>
                                    <p className="text-sm font-medium">{product.ProductName || product.Product?.ProductName}</p>
                                    {product.Description && (
                                      <p className="text-xs text-gray-600">{product.Description}</p>
                                    )}
                                    {product.Product && (
                                      <div className="mt-2 flex items-center">
                                        {product.Product.PictureUrl && (
                                          <img
                                            src={product.Product.PictureUrl || product.ProductImageUrl}
                                            alt={product.Product.ProductName || product.ProductName}
                                            className="h-10 w-10 object-cover rounded mr-2"
                                          />
                                        )}
                                        <div>
                                          <p className="text-xs text-green-600">{product.Product.Category || product.ProductCategory}</p>
                                          {product.Product.Variations && product.Product.Variations.length > 0 && (
                                            <p className="text-xs text-gray-600">
                                              {product.Product.Variations.length} variations available
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteProduct(product.RoutineProductId, step.RoutineStepId)}
                                  className="p-1 rounded text-red-400 hover:bg-gray-300"
                                  title="Remove Product"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600 italic">No products added to this step yet</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-4 border-t border-gray-300">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewRoutineModal;
