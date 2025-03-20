import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';

import CreateProductModal from './CreateProductModal';
import EditProductModal from './EditProductModal';

import {
  createProduct,
  updateProduct,
  deleteProduct,
  fetchBrands,
  fetchSkinTypeProduct,
  deleteProductUsage,
  deleteProductSkinType,
  deleteProductVariation,
  deleteProductMainIngredient,
  deleteProductDetailIngredient,
} from '../../utils/api';

import CategoryDistributionChart from '../../components/overview/CategoryDistributionChart';
import SalesTrendChart from '../../components/products/SalesTrendChart';

const ProductsTable = ({ products, refetchProducts }) => {

  const [localProducts, setLocalProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const [editProductState, setEditProduct] = useState(null);
  const [previewUrlEdit, setPreviewUrlEdit] = useState(null);
  const [previewUrlAdditionalImagesEditState, setPreviewUrlAdditionalImagesEditState] = useState([]);

  const [brandList, setBrandList] = useState([]);
  const [brandNameInput, setBrandNameInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [brandNameInputEdit, setBrandNameInputEdit] = useState('');
  const [showBrandSuggestionsEdit, setShowBrandSuggestionsEdit] = useState(false);

  const [newProduct, setNewProduct] = useState({
    ProductName: '',
    Description: '',
    Category: '',
    BrandId: '',
    PictureFile: '',
    IsActive: '',
    AdditionalPictures: [],
    ProductForSkinTypes: [{ ProductForSkinTypeId: '', SkinTypeId: 0 }],
    Variations: [{ ProductVariationId: '', Ml: 0, Price: 0 }],
    MainIngredients: [{ ProductMainIngredientId: '', IngredientName: '', Description: '' }],
    DetailIngredients: [{ ProductDetailIngredientId: '', IngredientName: '' }],
    Usages: [{ ProductUsageId: '', Step: 1, Instruction: '' }],
  });

  const [previewUrlNewUpload, setPreviewUrlNewUpload] = useState(null);
  const [previewUrlAdditionalImages, setPreviewUrlAdditionalImages] = useState([]);

  const [newBrand, setNewBrand] = useState({
    Name: '',
    PictureFile: '',
  });
  const [previewUrlNewUploadBrand, setPreviewUrlNewUploadBrand] = useState(null);

  const [skinTypeList, setSkinTypeList] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);      
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModalBrand, setIsModalBrand] = useState(false);  

  
  useEffect(() => {
    fetchBrands()
      .then((data) => setBrandList(data))
      .catch((err) => console.error('Error fetching brands:', err));
  }, []);

  useEffect(() => {
    fetchSkinTypeProduct()
      .then((data) => setSkinTypeList(data))
      .catch((err) => console.error('Error fetching skin type:', err));
  }, []);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = localProducts.filter(
      (product) =>
        product.ProductName.toLowerCase().includes(term) ||
        product.Category.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, localProducts]);

  useEffect(() => {
    if (!isEditModalOpen || !editProductState) return;

    // Clear previous previews when opening the modal
    setPreviewUrlAdditionalImagesEditState([]);
    
    // Add existing images from database
    if (editProductState.ProductPictures?.length > 0) {
      const existingUrls = editProductState.ProductPictures.map((p) => p.PictureUrl);
      setPreviewUrlAdditionalImagesEditState(existingUrls);
    }
    
    // Add newly added images that haven't been saved yet
    if (editProductState.AdditionalPicturesFile?.length > 0) {
      const newPreviews = editProductState.AdditionalPicturesFile.map(file => URL.createObjectURL(file));
      setPreviewUrlAdditionalImagesEditState(prev => [...prev, ...newPreviews]);
    }
  }, [isEditModalOpen, editProductState]);

 
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const displayedProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setLocalProducts((prev) => prev.filter((p) => p.ProductId !== productId));
        toast.success('Product deleted successfully!');

        if (refetchProducts) {
          refetchProducts();
        }

      } catch (error) {
        console.error('Failed to delete product:', error);
        toast.error('Error deleting product!');
      }
    }
  };

  

const getProductStatusBadge = (product) => {
  const isActive = !!product.IsActive; 
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs ${
        isActive ? "bg-green-900 text-green-100" : "bg-red-900 text-red-100"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

 const handleDeactivate = async (id) => {
    try {
      await deactivateProduct(id);
      
      setLocalProducts((prev) => 
        prev.map((p) => 
          p.ProductId === id 
            ? { ...p, IsActive: false } 
            : p
        )
      );
      
      toast.success('Product deactivated successfully!');
    } catch (error) {
      console.error('Failed to deactivate product:', error);
      toast.error(`Failed to deactivate product: ${error.message || 'Unknown error'}`);
    }
  };




  const handleOpenEditModal = (product) => {
    const foundBrand = brandList.find((b) => b.Name === product.BrandName);
    const brandId = foundBrand ? foundBrand.BrandId : '';

    const initializedProduct = {
      ...product,
      BrandId: brandId,
      BrandName: product.BrandName || '',
      Variations: product.Variations || [],
      MainIngredients: product.MainIngredients || [],
      DetailIngredients: product.DetailIngredients || [],
      Usages: product.Usages || [],
      ProductForSkinTypes: product.ProductForSkinTypes || [],
      VariationsToDelete: [],
      ProductForSkinTypesToDelete: [],
      MainIngredientsToDelete: [],
      DetailIngredientsToDelete: [],
      UsagesToDelete: [],
    };
    setEditProduct(initializedProduct);
    setBrandNameInputEdit(initializedProduct.BrandName);
    setIsEditModalOpen(true);
  };

  const handleEdit = async () => {
    if (!editProductState) return;
    if (
      !editProductState.ProductName ||
      !editProductState.Category ||
      !editProductState.BrandId
    ) {
      toast.error(
        'Please fill in all required fields: Product Name, Category, Brand'
      );
      return;
    }


    const productToUpdate = {
      ProductId: editProductState.ProductId,
      ProductName: editProductState.ProductName,
      BrandId: editProductState.BrandId,
      Category: editProductState.Category,
      Description: editProductState.Description || '',
      PictureFile: editProductState.PictureFile,
      IsActive: editProductState.IsActive,
      ProductForSkinTypes: editProductState.ProductForSkinTypes || [],
      Variations: editProductState.Variations || [],
      MainIngredients: editProductState.MainIngredients || [],
      DetailIngredients: editProductState.DetailIngredients || [],
      Usages: editProductState.Usages || [],
      AdditionalPicturesToDelete: editProductState.AdditionalPicturesToDelete || [],
      AdditionalPicturesFile: editProductState.AdditionalPicturesFile || [],
      
      ProductForSkinTypesToDelete: editProductState.ProductForSkinTypesToDelete || [],
      VariationsToDelete: editProductState.VariationsToDelete || [],
      MainIngredientsToDelete: editProductState.MainIngredientsToDelete || [],
      DetailIngredientsToDelete: editProductState.DetailIngredientsToDelete || [],
      UsagesToDelete: editProductState.UsagesToDelete || [],
    };

    try {
      const updated = await updateProduct(editProductState.ProductId, productToUpdate);

      setLocalProducts((prev) => prev.map((p) => (p.ProductId === updated.ProductId ? updated : p)));
      toast.success('Product update successful!');

      setIsEditModalOpen(false);
      setEditProduct(null);
      setPreviewUrlEdit(null);
      setPreviewUrlAdditionalImagesEditState([]);

      if (refetchProducts) {
        refetchProducts();
      }

    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error(`Product update failed: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRemoveEditSkinType = async (index) => {
    const skinType = editProductState.ProductForSkinTypes[index];

    if (skinType && skinType.ProductForSkinTypeId) {
      try {
        await deleteProductSkinType(skinType.ProductForSkinTypeId);
        setEditProduct(prev => ({
          ...prev,
          ProductForSkinTypes: prev.ProductForSkinTypes.filter((_, i) => i !== index),
        }));
        toast.success('SkinType removed successfully!');
      } catch (error) {
        console.error(error);
        toast.error(`Error while deleting Skin Type: ${error.message}`);
      }
    } else {
      setEditProduct(prev => ({
        ...prev,
        ProductForSkinTypes: prev.ProductForSkinTypes.filter((_, i) => i !== index),
      }));
    }
  };

  const handleRemoveEditVariation = async (index) => {
    const variation = editProductState.Variations[index];

    if (variation && variation.ProductVariationId) {
      try {
        await deleteProductVariation(variation.ProductVariationId);
        console.log(`Successfully deleted Variation with ID: ${variation.ProductVariationId}`);
        setEditProduct(prev => ({
          ...prev,
          Variations: prev.Variations.filter((_, i) => i !== index),
        }));
        toast.success('Variant deletion successful!');
      } catch (error) {
        console.error('Error deleting variation:', error);
        toast.error(`Error while deleting variant: ${error.message}`);
      }
    } else {
      setEditProduct(prev => ({
        ...prev,
        Variations: prev.Variations.filter((_, i) => i !== index),
      }));
    }
  };

  const handleRemoveEditMainIngredient = async (index) => {
    const ingredient = editProductState.MainIngredients[index];

    if (ingredient && ingredient.ProductMainIngredientId) {
      try {
        await deleteProductMainIngredient(ingredient.ProductMainIngredientId);
        setEditProduct(prev => ({
          ...prev,
          MainIngredients: prev.MainIngredients.filter((_, i) => i !== index),
        }));
        toast.success('Main ingredient deleted successfully!');
      } catch (error) {
        console.error(error);
        toast.error(`Error while deleting main ingredient: ${error.message}`);
      }
    } else {
      setEditProduct(prev => ({
        ...prev,
        MainIngredients: prev.MainIngredients.filter((_, i) => i !== index),
      }));
    }
  };

  const handleRemoveEditDetailIngredient = async (index) => {
    const ingredient = editProductState.DetailIngredients[index];

    if (ingredient && ingredient.ProductDetailIngredientId) {
      try {
        await deleteProductDetailIngredient(ingredient.ProductDetailIngredientId);
        setEditProduct(prev => ({
          ...prev,
          DetailIngredients: prev.DetailIngredients.filter((_, i) => i !== index),
        }));
        toast.success('Delete detail ingredient successfully!');
      } catch (error) {
        console.error(error);
        toast.error(`Error when deleting detail ingredient: ${error.message}`);
      }
    } else {
      setEditProduct(prev => ({
        ...prev,
        DetailIngredients: prev.DetailIngredients.filter((_, i) => i !== index),
      }));
    }
  };

  const handleRemoveEditUsage = async (index) => {
    const usage = editProductState.Usages[index];

    if (usage && usage.ProductUsageId) {
      try {
        await deleteProductUsage(usage.ProductUsageId);
        setEditProduct(prev => ({
          ...prev,
          Usages: prev.Usages.filter((_, i) => i !== index),
        }));
        toast.success('Deleted usage successfully!');
      } catch (error) {
        console.error(error);
        toast.error(`Error when deleting usage: ${error.message}`);
      }
    } else {
      setEditProduct(prev => ({
        ...prev,
        Usages: prev.Usages.filter((_, i) => i !== index),
      }));
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.ProductName || !newProduct.Category || !newProduct.BrandId) {
      toast.error('Please fill in required fields: ProductName, Category, BrandId');
      return;
    }
    try {
      const created = await createProduct(newProduct);
      setLocalProducts((prev) => [created, ...prev]);
      setIsModalOpen(false);

      setNewProduct({
        ProductName: '',
        Description: '',
        Category: '',
        BrandId: '',
        PictureFile: '',
        AdditionalPictures: [],
        ProductForSkinTypes: [{ ProductForSkinTypeId: '', SkinTypeId: 0 }],
        Variations: [{ ProductVariationId: '', Ml: 0, Price: 0 }],
        MainIngredients: [
          { ProductMainIngredientId: '', IngredientName: '', Description: '' },
        ],
        DetailIngredients: [{ ProductDetailIngredientId: '', IngredientName: '' }],
        Usages: [{ ProductUsageId: '', Step: 1, Instruction: '' }],
      });
      setBrandNameInput('');
      setPreviewUrlNewUpload(null);
      setPreviewUrlAdditionalImages([]);
      toast.success('New product added successfully!');

      if (refetchProducts) {
        refetchProducts();
      }

    } catch (error) {
      toast.error('Failed to add product:', error);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrand.Name || !newBrand.PictureFile) {
      toast.error('Please fill in required fields: Name, Upload file image of Brand');
      return;
    }
    try {
      await createBrand(newBrand);
      toast.success('Brand created successfully!');
      setIsModalBrand(false);
      setNewBrand({ Name: '', PictureFile: '' });
      setPreviewUrlNewUploadBrand(null);
      toast.success("Create a successful brand!")
    } catch (error) {
      console.error('Failed to add brand:', error);
      toast.error('Failed to create brand!');
    }
  };

  const handleRemoveAdditionalImage = (index) => {
    setPreviewUrlAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setNewProduct((prev) => ({
      ...prev,
      AdditionalPictures: prev.AdditionalPictures.filter((_, i) => i !== index),
    }));
  };

  const handleAdditionalImagesChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setNewProduct((prev) => ({
      ...prev,
      AdditionalPictures: [...prev.AdditionalPictures, ...files],
    }));

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviewUrlAdditionalImages((prev) => [...prev, ...newPreviews]);
  };
  

  const handleRemoveExistingAdditionalImage = (index) => {
    // Remove the preview URL from state
    setPreviewUrlAdditionalImagesEditState((prev) => prev.filter((_, i) => i !== index));
    
    // Determine if this is an existing image from the database or a newly added one
    const existingProductPicturesCount = editProductState.ProductPictures?.length || 0;
    
    if (index < existingProductPicturesCount) {
      // This is an existing image from the database
      const oldId = editProductState.ProductPictures[index]?.ProductPictureId;
      if (oldId) {
        setEditProduct((prev) => {
          const updatedDelete = [...(prev.AdditionalPicturesToDelete || []), oldId];
          return {
            ...prev,
            ProductPictures: prev.ProductPictures.filter((_, i) => i !== index),
            AdditionalPicturesToDelete: updatedDelete,
          };
        });
      }
    } else {
      // This is a newly added image
      const newImageIndex = index - existingProductPicturesCount;
      setEditProduct((prev) => ({
        ...prev,
        AdditionalPicturesFile: (prev.AdditionalPicturesFile || []).filter((_, i) => i !== newImageIndex),
      }));
    }
  };

  const handleAdditionalImagesChangeEdit = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrlAdditionalImagesEditState((prev) => [...prev, ...newPreviews]);

    const validFiles = files.filter((file) => file.size > 0);
    if (validFiles.length > 0) {
      setEditProduct((prev) => ({
        ...prev,
        AdditionalPicturesFile: [...(prev.AdditionalPicturesFile || []), ...validFiles],
      }));
    }
  };

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
          className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-700'}`}
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

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="px-2 py-2">...</span>);
      }
      pages.push(
        <button
          key={`page-${totalPages}`}
          onClick={() => handlePageChange(totalPages)}
          className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          {totalPages}
        </button>
      );
    }
    return pages;
  };

  return (
    <motion.div
      className="bg-white backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* --- Edit Modal --- */}
      {isEditModalOpen && editProductState && (
        <EditProductModal
          editProductState={editProductState}
          setEditProduct={setEditProduct}
          brandList={brandList}
          brandNameInputEdit={brandNameInputEdit}
          setBrandNameInputEdit={setBrandNameInputEdit}
          showBrandSuggestionsEdit={showBrandSuggestionsEdit}
          setShowBrandSuggestionsEdit={setShowBrandSuggestionsEdit}
          previewUrlEdit={previewUrlEdit}
          setPreviewUrlEdit={setPreviewUrlEdit}
          previewUrlAdditionalImagesEditState={previewUrlAdditionalImagesEditState}
          setPreviewUrlAdditionalImagesEditState={setPreviewUrlAdditionalImagesEditState}
          handleRemoveExistingAdditionalImage={handleRemoveExistingAdditionalImage}
          handleAdditionalImagesChangeEdit={handleAdditionalImagesChangeEdit}
          handleEdit={handleEdit}
          onClose={() => setIsEditModalOpen(false)}
          skinTypeList={skinTypeList}
          refetchProducts={refetchProducts}

          handleRemoveEditVariation={handleRemoveEditVariation}
          handleRemoveEditSkinType={handleRemoveEditSkinType}
          handleRemoveEditUsage={handleRemoveEditUsage}
          handleRemoveEditMainIngredient={handleRemoveEditMainIngredient}
          handleRemoveEditDetailIngredient={handleRemoveEditDetailIngredient}


        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">Products</h2>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or category..."
              className="bg-gray-300 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          <button
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={18} />
            Add Product
          </button>

        </div>
      </div>

      {isModalOpen && (
        <CreateProductModal
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          brandList={brandList}
          brandNameInput={brandNameInput}
          setBrandNameInput={setBrandNameInput}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          skinTypeList={skinTypeList}
          previewUrlNewUpload={previewUrlNewUpload}
          setPreviewUrlNewUpload={setPreviewUrlNewUpload}
          previewUrlAdditionalImages={previewUrlAdditionalImages}
          handleRemoveAdditionalImage={handleRemoveAdditionalImage}
          handleAdditionalImagesChange={handleAdditionalImagesChange}
          handleAddProduct={handleAddProduct}
          onClose={() => setIsModalOpen(false)}
          refetchProducts={refetchProducts}
        />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                Price (1st Variation)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {displayedProducts.map((product, index) => {
              const firstVariation = product.Variations?.[0];
              return (
                <motion.tr
                  key={product.ProductId || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black flex gap-2 items-center">
                    <img
                      src={
                        product.PictureUrl && product.PictureUrl !== 'string'
                          ? product.PictureUrl
                          : 'https://via.placeholder.com/50'
                      }
                      alt="Product"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {product.ProductName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {product.Category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {product.BrandName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {firstVariation
                      ? `$${parseFloat(firstVariation.Price || 0).toFixed(2)}`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {getProductStatusBadge(product)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {/* Nút Edit */}
                    <button
                      className="text-indigo-400 hover:text-indigo-300 mr-2"
                      onClick={() => handleOpenEditModal(product)}
                    >
                      <Edit size={18} />
                    </button>

                    {/* <button
                      className="text-yellow-400 hover:text-yellow-300 mr-2"
                      onClick={() => handleDeactivate(product.PromotionId)}
                      title="Deactivate promotion"
                    >
                      <Power size={18} />
                    </button> */}
                    {/* Nút Delete */}
                    <button
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(product.ProductId)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 mx-2 rounded-lg ${currentPage === 1
            ? 'bg-gray-100 text-gray-700 cursor-not-allowed'
            : 'bg-gray-100 text-gray'
            }`}
        >
          Previous
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 mx-2 rounded-lg ${currentPage === totalPages
            ? 'bg-gray-100 text-gray-700 cursor-not-allowed'
            : 'bg-gray-100 text-gray'
            }`}
        >
          Next
        </button>
      </div>

      <div className="mt-10 grid grid-col-1 lg:grid-cols-2 gap-8 z-0">
        <SalesTrendChart />
        <CategoryDistributionChart products={products} />
      </div>
    </motion.div>
  );
};

export default ProductsTable;
