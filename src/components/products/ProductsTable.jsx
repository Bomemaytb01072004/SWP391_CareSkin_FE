import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';

import CreateProductModal from './CreateProductModal';
import EditProductModal from './EditProductModal';
import CreateBrandModal from './CreateBrandModal';

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

const ProductsTable = ({ products }) => {
  // -----------------------------------
  // 1) State
  // -----------------------------------
  const [localProducts, setLocalProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // Edit product
  const [editProductState, setEditProduct] = useState(null);
  const [previewUrlEdit, setPreviewUrlEdit] = useState(null);
  const [previewUrlAdditionalImagesEditState, setPreviewUrlAdditionalImagesEdit] = useState([]);

  // Brand
  const [brandList, setBrandList] = useState([]);
  const [brandNameInput, setBrandNameInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Edit brand input
  const [brandNameInputEdit, setBrandNameInputEdit] = useState('');
  const [showBrandSuggestionsEdit, setShowBrandSuggestionsEdit] = useState(false);

  // Create product
  const [newProduct, setNewProduct] = useState({
    ProductName: '',
    Description: '',
    Category: '',
    BrandId: '',
    PictureFile: '',
    AdditionalPictures: [],
    ProductForSkinTypes: [{ ProductForSkinTypeId: '', SkinTypeId: 0 }],
    Variations: [{ ProductVariationId: '', Ml: 0, Price: 0 }],
    MainIngredients: [{ ProductMainIngredientId: '', IngredientName: '', Description: '' }],
    DetailIngredients: [{ ProductDetailIngredientId: '', IngredientName: '' }],
    Usages: [{ ProductUsageId: '', Step: 1, Instruction: '' }],
  });

  const [previewUrlNewUpload, setPreviewUrlNewUpload] = useState(null);
  const [previewUrlAdditionalImages, setPreviewUrlAdditionalImages] = useState([]);

  // Create brand
  const [newBrand, setNewBrand] = useState({
    Name: '',
    PictureFile: '',
  });
  const [previewUrlNewUploadBrand, setPreviewUrlNewUploadBrand] = useState(null);

  // Skin type list (nếu cần fetch)
  const [skinTypeList, setSkinTypeList] = useState([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);      // create product
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModalBrand, setIsModalBrand] = useState(false);    // create brand

  // -----------------------------------
  // 2) Effects
  // -----------------------------------
  // Lấy brand list
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

  // Map products vào localProducts
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  // Lọc search
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

  // Khi mở Edit modal, set previewUrlAdditionalImagesEdit
  useEffect(() => {
    if (!isEditModalOpen || !editProductState) return;

    if (editProductState.ProductPictures?.length > 0) {
      const existingUrls = editProductState.ProductPictures.map((p) => p.PictureUrl);
      setPreviewUrlAdditionalImagesEdit(existingUrls);
    } else {
      setPreviewUrlAdditionalImagesEdit([]);
    }
  }, [isEditModalOpen, editProductState]);

  // -----------------------------------
  // 3) Handlers
  // -----------------------------------
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const displayedProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Delete product
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setLocalProducts((prev) => prev.filter((p) => p.ProductId !== productId));
        toast.success('Product deleted successfully!');
      } catch (error) {
        console.error('Failed to delete product:', error);
        toast.error('Error deleting product!');
      }
    }
  };

  // Open Edit modal
  const handleOpenEditModal = (product) => {
    // Tìm brandId từ brandName
    const foundBrand = brandList.find((b) => b.Name === product.BrandName);
    const brandId = foundBrand ? foundBrand.BrandId : '';

    // Khởi tạo state
    const initializedProduct = {
      ...product,
      BrandId: brandId,
      BrandName: product.BrandName || '',
      Variations: product.Variations || [],
      MainIngredients: product.MainIngredients || [],
      DetailIngredients: product.DetailIngredients || [],
      Usages: product.Usages || [],
      ProductForSkinTypes: product.ProductForSkinTypes || [],
      // Mảng ID xóa
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

  // Submit Edit
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
      ProductForSkinTypes: editProductState.ProductForSkinTypes || [],
      Variations: editProductState.Variations || [],
      MainIngredients: editProductState.MainIngredients || [],
      DetailIngredients: editProductState.DetailIngredients || [],
      Usages: editProductState.Usages || [],
      AdditionalPicturesToDelete: editProductState.AdditionalPicturesToDelete || [],
      AdditionalPicturesFile: editProductState.AdditionalPicturesFile || [],
      // ID cần xóa
      ProductForSkinTypesToDelete: editProductState.ProductForSkinTypesToDelete || [],
      VariationsToDelete: editProductState.VariationsToDelete || [],
      MainIngredientsToDelete: editProductState.MainIngredientsToDelete || [],
      DetailIngredientsToDelete: editProductState.DetailIngredientsToDelete || [],
      UsagesToDelete: editProductState.UsagesToDelete || [],
    };

    try {
      const updated = await updateProduct(editProductState.ProductId, productToUpdate);

      // Cập nhật localProducts
      setLocalProducts((prev) => prev.map((p) => (p.ProductId === updated.ProductId ? updated : p)));
      toast.success('Cập nhật sản phẩm thành công!');

      // Reset
      setIsEditModalOpen(false);
      setEditProduct(null);
      setPreviewUrlEdit(null);
      setPreviewUrlAdditionalImagesEdit([]);
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error(`Cập nhật sản phẩm thất bại: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  // Xóa SkinType
  const handleRemoveEditSkinType = async (index) => {
    const skinType = editProductState.ProductForSkinTypes[index];

    if (skinType && skinType.ProductForSkinTypeId) {
      try {
        await deleteProductSkinType(skinType.ProductForSkinTypeId);
        setEditProduct(prev => ({
          ...prev,
          ProductForSkinTypes: prev.ProductForSkinTypes.filter((_, i) => i !== index),
        }));
        toast.success('Xóa SkinType thành công!');
      } catch (error) {
        console.error(error);
        toast.error(`Lỗi khi xóa SkinType: ${error.message}`);
      }
    } else {
      setEditProduct(prev => ({
        ...prev,
        ProductForSkinTypes: prev.ProductForSkinTypes.filter((_, i) => i !== index),
      }));
    }
  };

  // Xóa Variation
  const handleRemoveEditVariation = async (index) => {
    const variation = editProductState.Variations[index];

    // Nếu Variation đã có ID => gọi API xóa
    if (variation && variation.ProductVariationId) {
      try {
        await deleteProductVariation(variation.ProductVariationId);
        console.log(`Successfully deleted Variation with ID: ${variation.ProductVariationId}`);
        // Sau khi xóa API thành công => xóa trong state
        setEditProduct(prev => ({
          ...prev,
          Variations: prev.Variations.filter((_, i) => i !== index),
        }));
        toast.success('Xóa biến thể thành công!');
      } catch (error) {
        console.error('Error deleting variation:', error);
        toast.error(`Lỗi khi xóa biến thể: ${error.message}`);
      }
    } else {
      // Nếu là Variation mới (chưa có ID) => chỉ xóa khỏi state
      setEditProduct(prev => ({
        ...prev,
        Variations: prev.Variations.filter((_, i) => i !== index),
      }));
    }
  };

  // Xóa MainIngredient
  const handleRemoveEditMainIngredient = async (index) => {
    const ingredient = editProductState.MainIngredients[index];

    if (ingredient && ingredient.ProductMainIngredientId) {
      try {
        await deleteProductMainIngredient(ingredient.ProductMainIngredientId);
        setEditProduct(prev => ({
          ...prev,
          MainIngredients: prev.MainIngredients.filter((_, i) => i !== index),
        }));
        toast.success('Xóa thành phần chính thành công!');
      } catch (error) {
        console.error(error);
        toast.error(`Lỗi khi xóa MainIngredient: ${error.message}`);
      }
    } else {
      setEditProduct(prev => ({
        ...prev,
        MainIngredients: prev.MainIngredients.filter((_, i) => i !== index),
      }));
    }
  };

  // Xóa DetailIngredient
  const handleRemoveEditDetailIngredient = async (index) => {
    const ingredient = editProductState.DetailIngredients[index];

    if (ingredient && ingredient.ProductDetailIngredientId) {
      try {
        await deleteProductDetailIngredient(ingredient.ProductDetailIngredientId);
        setEditProduct(prev => ({
          ...prev,
          DetailIngredients: prev.DetailIngredients.filter((_, i) => i !== index),
        }));
        toast.success('Xóa thành phần chi tiết thành công!');
      } catch (error) {
        console.error(error);
        toast.error(`Lỗi khi xóa DetailIngredient: ${error.message}`);
      }
    } else {
      setEditProduct(prev => ({
        ...prev,
        DetailIngredients: prev.DetailIngredients.filter((_, i) => i !== index),
      }));
    }
  };

  // Xóa Usage
  const handleRemoveEditUsage = async (index) => {
    const usage = editProductState.Usages[index];

    if (usage && usage.ProductUsageId) {
      try {
        await deleteProductUsage(usage.ProductUsageId);
        setEditProduct(prev => ({
          ...prev,
          Usages: prev.Usages.filter((_, i) => i !== index),
        }));
        toast.success('Xóa hướng dẫn sử dụng thành công!');
      } catch (error) {
        console.error(error);
        toast.error(`Lỗi khi xóa Usage: ${error.message}`);
      }
    } else {
      setEditProduct(prev => ({
        ...prev,
        Usages: prev.Usages.filter((_, i) => i !== index),
      }));
    }
  };

  // Submit Create product
  const handleAddProduct = async () => {
    if (!newProduct.ProductName || !newProduct.Category || !newProduct.BrandId) {
      toast.error('Please fill in required fields: ProductName, Category, BrandId');
      return;
    }
    try {
      const created = await createProduct(newProduct);
      setLocalProducts((prev) => [created, ...prev]);
      setIsModalOpen(false);

      // Reset form
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
    } catch (error) {
      toast.error('Failed to add product:', error);
    }
  };

  // Submit Create brand
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

  // Handler remove images (khi tạo sản phẩm)
  const handleRemoveAdditionalImage = (index) => {
    setPreviewUrlAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setNewProduct((prev) => ({
      ...prev,
      AdditionalPictures: prev.AdditionalPictures.filter((_, i) => i !== index),
    }));
  };

  // Upload ảnh (khi tạo)
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

  // Remove ảnh cũ (khi edit)
  const handleRemoveExistingAdditionalImage = (index) => {
    setPreviewUrlAdditionalImagesEdit((prev) => prev.filter((_, i) => i !== index));
    const oldId = editProductState.ProductPictures?.[index]?.ProductPictureId;
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
  };

  // Upload ảnh mới (khi edit)
  const handleAdditionalImagesChangeEdit = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrlAdditionalImagesEdit((prev) => [...prev, ...newPreviews]);

    const validFiles = files.filter((file) => file.size > 0);
    if (validFiles.length > 0) {
      setEditProduct((prev) => ({
        ...prev,
        AdditionalPicturesFile: [...(prev.AdditionalPicturesFile || []), ...validFiles],
      }));
    }
  };

  // -----------------------------------
  // 4) Render
  // -----------------------------------
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
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
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
          setPreviewUrlAdditionalImagesEdit={setPreviewUrlAdditionalImagesEdit}
          handleRemoveExistingAdditionalImage={handleRemoveExistingAdditionalImage}
          handleAdditionalImagesChangeEdit={handleAdditionalImagesChangeEdit}
          handleEdit={handleEdit}
          onClose={() => setIsEditModalOpen(false)}
          skinTypeList={skinTypeList}

          handleRemoveEditVariation={handleRemoveEditVariation}
          handleRemoveEditSkinType={handleRemoveEditSkinType}
          handleRemoveEditUsage={handleRemoveEditUsage}
          handleRemoveEditMainIngredient={handleRemoveEditMainIngredient}
          handleRemoveEditDetailIngredient={handleRemoveEditDetailIngredient}


        />
      )}

      {/* --- Header (Search & Buttons) --- */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Products</h2>
        <div className="flex gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or category..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          {/* Add Product */}
          <button
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={18} />
            Add Product
          </button>

          {/* Add Brand */}
          <button
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            onClick={() => setIsModalBrand(true)}
          >
            <PlusCircle size={18} />
            Add Brand
          </button>
        </div>
      </div>

      {/* --- Modal Create Product --- */}
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
        />
      )}

      {/* --- Modal Create Brand --- */}
      {isModalBrand && (
        <CreateBrandModal
          newBrand={newBrand}
          setNewBrand={setNewBrand}
          previewUrlNewUploadBrand={previewUrlNewUploadBrand}
          setPreviewUrlNewUploadBrand={setPreviewUrlNewUploadBrand}
          handleAddBrand={handleAddBrand}
          onClose={() => setIsModalBrand(false)}
        />
      )}

      {/* --- Table Sản Phẩm --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Price (1st Variation)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {product.Category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {product.BrandName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {firstVariation
                      ? `$${parseFloat(firstVariation.Price || 0).toFixed(2)}`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {/* Nút Edit */}
                    <button
                      className="text-indigo-400 hover:text-indigo-300 mr-2"
                      onClick={() => handleOpenEditModal(product)}
                    >
                      <Edit size={18} />
                    </button>
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
          disabled={currentPage === totalPages}
          className={`px-4 py-2 mx-2 rounded-lg ${currentPage === totalPages
            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
            : 'bg-gray-700 text-white'
            }`}
        >
          Next
        </button>
      </div>

      {/* --- Charts minh họa --- */}
      <div className="mt-10 grid grid-col-1 lg:grid-cols-2 gap-8 z-0">
        <SalesTrendChart />
        <CategoryDistributionChart products={products} />
      </div>
    </motion.div>
  );
};

export default ProductsTable;
