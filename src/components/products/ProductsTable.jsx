import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import ReactDOM from 'react-dom';

import CreateProductModal from './CreateProductModal';
import EditProductModal from './EditProductModal';
import PaginationAdmin from '../Pagination/PaginationAdmin';

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
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false); 

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
    ProductForSkinTypes: [
      { ProductForSkinTypeId: '', SkinTypeId: '', TypeName: '', showSuggestions: false },
    ],
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

  // Thêm hàm validation trước hàm handleEdit và handleAddProduct
  const validateProduct = (product, isEdit = false) => {
    const errors = {};

    // Thêm kiểm tra Skin Types
    if (!product.ProductForSkinTypes || product.ProductForSkinTypes.length === 0) {
      errors.ProductForSkinTypes = 'At least one Skin Type is required';
    }

    // Validate ProductName (bắt buộc, từ 3-100 ký tự)
    if (!product.ProductName || product.ProductName.trim() === '') {
      errors.ProductName = 'Product name is required';
    } else if (product.ProductName.trim().length < 3) {
      errors.ProductName = 'Product name must be at least 3 characters';
    } else if (product.ProductName.trim().length > 100) {
      errors.ProductName = 'Product name must be less than 100 characters';
    }

    // Validate Category (bắt buộc)
    if (!product.Category || product.Category.trim() === '') {
      errors.Category = 'Category is required';
    }

    // Validate Brand (bắt buộc)
    if (!product.BrandId) {
      errors.BrandId = 'Brand is required';
    }

    // Validate Variations
    if (product.Variations && product.Variations.length > 0) {
      const variationErrors = [];
      product.Variations.forEach((variation, index) => {
        const varError = {};
        if (variation.Ml <= 0) {
          varError.Ml = 'Volume must be greater than 0';
        }
        if (variation.Price <= 0) {
          varError.Price = 'Price must be greater than 0';
        }
        if (Object.keys(varError).length > 0) {
          variationErrors[index] = varError;
        }
      });
      if (variationErrors.length > 0) {
        errors.Variations = variationErrors;
      }
    } else if (!isEdit) {
      errors.Variations = 'At least one variation is required';
    }

    // Kiểm tra MainIngredients
    if (!product.MainIngredients || product.MainIngredients.length === 0) {
      errors.MainIngredients = 'At least one Main Ingredient is required';
    }

    // Kiểm tra DetailIngredients
    if (!product.DetailIngredients || product.DetailIngredients.length === 0) {
      errors.DetailIngredients = 'At least one Detail Ingredient is required';
    }

    // Kiểm tra Usages
    if (!product.Usages || product.Usages.length === 0) {
      errors.Usages = 'At least one Usage instruction is required';
    }

    // Validate Product Image (bắt buộc cho sản phẩm mới)
    if (!isEdit && !product.PictureFile) {
      errors.PictureFile = 'Product image is required';
    }

    // Validate MainIngredients (không được trùng lặp)
    if (product.MainIngredients && product.MainIngredients.length > 0) {
      const ingredientNames = {};
      product.MainIngredients.forEach((ing, index) => {
        if (ing.IngredientName && ingredientNames[ing.IngredientName.trim()]) {
          if (!errors.MainIngredients) errors.MainIngredients = [];
          if (!errors.MainIngredients[index]) errors.MainIngredients[index] = {};
          errors.MainIngredients[index].IngredientName = 'Duplicate ingredient name';
        }
        if (ing.IngredientName) ingredientNames[ing.IngredientName.trim()] = true;
      });
    }

    // Validate Usages (Step phải là số dương và tăng dần)
    if (product.Usages && product.Usages.length > 0) {
      const steps = new Set();
      const usageErrors = [];

      product.Usages.forEach((usage, index) => {
        const usageError = {};
        if (usage.Step <= 0) {
          usageError.Step = 'Step must be a positive number';
        } else if (steps.has(usage.Step)) {
          usageError.Step = 'Step numbers must be unique';
        } else {
          steps.add(usage.Step);
        }

        if (!usage.Instruction || usage.Instruction.trim() === '') {
          usageError.Instruction = 'Instruction is required';
        }

        if (Object.keys(usageError).length > 0) {
          usageErrors[index] = usageError;
        }
      });

      if (usageErrors.length > 0) {
        errors.Usages = usageErrors;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

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
        className={`px-2 py-1 rounded-full text-xs ${isActive ? "bg-green-900 text-green-100" : "bg-red-900 text-red-100"
          }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
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

    // Kiểm tra brand có hợp lệ không
    const selectedBrand = brandList.find(
      b => b.Name.toLowerCase() === brandNameInputEdit.toLowerCase()
    );

    if (!selectedBrand) {
      toast.error(
        "Please select a valid brand from the suggestions list. If you need to create a new brand, please go to the Brands page first.",
        {
          autoClose: 10000,
        }
      );
      return;
    }

    // Kiểm tra skin types có hợp lệ không - THÊM ĐOẠN CODE NÀY
    const invalidSkinTypes = editProductState.ProductForSkinTypes.filter(
      (st) =>
        st.TypeName && !skinTypeList.some(
          (skinType) => skinType.TypeName.toLowerCase() === st.TypeName.toLowerCase()
        )
    );

    if (invalidSkinTypes.length > 0) {
      toast.error(
        "Please select valid skin types from the suggestions list. If you need to create new skin types, please go to the Skin Types page.",
        {
          autoClose: 8000,
        }
      );
      return;
    }

    // Đảm bảo BrandId được đặt đúng
    const productToEdit = {
      ...editProductState,
      BrandId: selectedBrand.BrandId
    };

    const { isValid, errors } = validateProduct(productToEdit, true);
    if (!isValid) {
      // Hiển thị lỗi cụ thể qua toast
      if (errors.ProductName) toast.error(`Product name: ${errors.ProductName}`);
      if (errors.Category) toast.error(`Category: ${errors.Category}`);
      if (errors.BrandId) toast.error(`Brand: ${errors.BrandId}`);

      // Xử lý lỗi Variations
      if (typeof errors.Variations === 'string') {
        toast.error(`Variations: ${errors.Variations}`);
      } else if (Array.isArray(errors.Variations)) {
        errors.Variations.forEach((varError, idx) => {
          if (varError?.Ml) toast.error(`Variation ${idx + 1}: ${varError.Ml}`);
          if (varError?.Price) toast.error(`Variation ${idx + 1}: ${varError.Price}`);
        });
      }

      // Tương tự cho MainIngredients và Usages như trên
      if (errors.MainIngredients) {
        errors.MainIngredients.forEach((ingError, idx) => {
          if (ingError?.IngredientName) {
            toast.error(`Main ingredient ${idx + 1}: ${ingError.IngredientName}`);
          }
        });
      }

      if (errors.Usages) {
        errors.Usages.forEach((usageError, idx) => {
          if (usageError?.Step) toast.error(`Usage ${idx + 1}: ${usageError.Step}`);
          if (usageError?.Instruction) toast.error(`Usage ${idx + 1}: ${usageError.Instruction}`);
        });
      }

      return;
    }

    // Tiếp tục xử lý nếu không có lỗi...
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
    // Kiểm tra xem còn lại bao nhiêu skin type
    if (editProductState.ProductForSkinTypes.length <= 1) {
      toast.error("Product must have at least one Skin Type", {
        autoClose: 5000,
      });
      return;
    }

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
    // Kiểm tra xem còn lại bao nhiêu variation
    if (editProductState.Variations.length <= 1) {
      toast.error("Product must have at least one Variation", {
        autoClose: 5000,
      });
      return;
    }

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
    // Kiểm tra xem còn lại bao nhiêu main ingredient
    if (editProductState.MainIngredients.length <= 1) {
      toast.error("Product must have at least one Main Ingredient", {
        autoClose: 5000,
      });
      return;
    }

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
    // Kiểm tra xem còn lại bao nhiêu detail ingredient
    if (editProductState.DetailIngredients.length <= 1) {
      toast.error("Product must have at least one Detail Ingredient", {
        autoClose: 5000,
      });
      return;
    }

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
    // Kiểm tra xem còn lại bao nhiêu usage
    if (editProductState.Usages.length <= 1) {
      toast.error("Product must have at least one Usage instruction", {
        autoClose: 5000,
      });
      return;
    }

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
    const selectedBrand = brandList.find(
      b => b.Name.toLowerCase() === brandNameInput.toLowerCase()
    );

    if (!selectedBrand) {
      toast.error("Please select a valid brand from the suggestions list. If you need to create a new brand, please go to the Brands page first.");
      return;
    }

    const invalidSkinTypes = newProduct.ProductForSkinTypes.filter(
      (st) =>
        !skinTypeList.some(
          (skinType) => skinType.TypeName.toLowerCase() === st.TypeName.toLowerCase()
        )
    );

    if (invalidSkinTypes.length > 0) {
      toast.error(
        "Please select valid skin types from the suggestions list. If you need to create new skin types, please go to the Skin Types page.",
        {
          autoClose: 8000, // Hiển thị trong 8 giây
        }
      );
      return;
    }

    // Đảm bảo BrandId được đặt đúng
    const productToSubmit = {
      ...newProduct,
      BrandId: selectedBrand.BrandId
    };

    const { isValid, errors } = validateProduct(productToSubmit);
    if (!isValid) {
      // Hiển thị lỗi cụ thể qua toast thay vì chỉ console.error
      if (errors.ProductName) toast.error(`Product name: ${errors.ProductName}`);
      if (errors.Category) toast.error(`Category: ${errors.Category}`);
      if (errors.BrandId) toast.error(`Brand: ${errors.BrandId}`);
      if (errors.PictureFile) toast.error(`Product image: ${errors.PictureFile}`);

      // Xử lý lỗi Variations
      if (typeof errors.Variations === 'string') {
        toast.error(`Variations: ${errors.Variations}`);
      } else if (Array.isArray(errors.Variations)) {
        errors.Variations.forEach((varError, idx) => {
          if (varError?.Ml) toast.error(`Variation ${idx + 1}: ${varError.Ml}`);
          if (varError?.Price) toast.error(`Variation ${idx + 1}: ${varError.Price}`);
        });
      }

      // Xử lý lỗi MainIngredients
      if (errors.MainIngredients) {
        errors.MainIngredients.forEach((ingError, idx) => {
          if (ingError?.IngredientName) {
            toast.error(`Main ingredient ${idx + 1}: ${ingError.IngredientName}`);
          }
        });
      }

      // Xử lý lỗi Usages
      if (errors.Usages) {
        errors.Usages.forEach((usageError, idx) => {
          if (usageError?.Step) toast.error(`Usage ${idx + 1}: ${usageError.Step}`);
          if (usageError?.Instruction) toast.error(`Usage ${idx + 1}: ${usageError.Instruction}`);
        });
      }

      return;
    }

    // Tiếp tục xử lý nếu không có lỗi...
    try {
      const created = await createProduct(productToSubmit);
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
      toast.error(`Failed to add product: ${error.message || error}`);
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
    setPreviewUrlAdditionalImagesEditState((prev) => prev.filter((_, i) => i !== index));

    const existingProductPicturesCount = editProductState.ProductPictures?.length || 0;

    if (index < existingProductPicturesCount) {
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

  const handleRemoveSkinType = (index) => {
    if (newProduct.ProductForSkinTypes.length <= 1) {
      toast.error("Product must have at least one Skin Type", {
        autoClose: 5000,
      });
      return;
    }

    setNewProduct(prev => ({
      ...prev,
      ProductForSkinTypes: prev.ProductForSkinTypes.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveVariation = (index) => {
    if (newProduct.Variations.length <= 1) {
      toast.error("Product must have at least one Variation", {
        autoClose: 5000,
      });
      return;
    }

    setNewProduct(prev => ({
      ...prev,
      Variations: prev.Variations.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveMainIngredient = (index) => {
    if (newProduct.MainIngredients.length <= 1) {
      toast.error("Product must have at least one Main Ingredient", {
        autoClose: 5000,
      });
      return;
    }

    setNewProduct(prev => ({
      ...prev,
      MainIngredients: prev.MainIngredients.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveDetailIngredient = (index) => {
    if (newProduct.DetailIngredients.length <= 1) {
      toast.error("Product must have at least one Detail Ingredient", {
        autoClose: 5000,
      });
      return;
    }

    setNewProduct(prev => ({
      ...prev,
      DetailIngredients: prev.DetailIngredients.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveUsage = (index) => {
    if (newProduct.Usages.length <= 1) {
      toast.error("Product must have at least one Usage instruction", {
        autoClose: 5000,
      });
      return;
    }

    setNewProduct(prev => ({
      ...prev,
      Usages: prev.Usages.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      {/* Main Table */}
      <motion.div
        className="bg-white backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">Products</h2>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or category..."
                className="bg-gray-100 text-black placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            <button
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle size={18} />
              Add Product
            </button>

          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y bg-white">
            <thead>
              <tr className='bg-gray-200'>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase ">
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
                      <button
                        className="text-indigo-400 hover:text-indigo-300 mr-2"
                        onClick={() => handleOpenEditModal(product)}
                      >
                        <Edit size={18} />
                      </button>

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

        <PaginationAdmin
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          theme="blue"
          maxVisiblePages={8}
        />

        <div className="mt-10 grid grid-col-1 lg:grid-cols-2 gap-8 z-0">
          <SalesTrendChart />
          <CategoryDistributionChart products={products} />
        </div>
      </motion.div>

      {isEditModalOpen && editProductState && ReactDOM.createPortal(
        <EditProductModal
          editProductState={editProductState}
          setEditProduct={setEditProduct}
          brandList={brandList}
          brandNameInputEdit={brandNameInputEdit}
          setBrandNameInputEdit={setBrandNameInputEdit}
          showBrandSuggestionsEdit={showBrandSuggestionsEdit}
          setShowBrandSuggestionsEdit={setShowBrandSuggestionsEdit}
          showCategorySuggestions={showCategorySuggestions}
          setShowCategorySuggestions={setShowCategorySuggestions}
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
        />,
        document.body
      )}

      {isModalOpen && ReactDOM.createPortal(
        <CreateProductModal
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          brandList={brandList}
          brandNameInput={brandNameInput}
          setBrandNameInput={setBrandNameInput}
          showSuggestions={showSuggestions}
          showCategorySuggestions={showCategorySuggestions}
          setShowSuggestions={setShowSuggestions}
          setShowCategorySuggestions={setShowCategorySuggestions}
          skinTypeList={skinTypeList}
          previewUrlNewUpload={previewUrlNewUpload}
          setPreviewUrlNewUpload={setPreviewUrlNewUpload}
          previewUrlAdditionalImages={previewUrlAdditionalImages}
          handleRemoveAdditionalImage={handleRemoveAdditionalImage}
          handleAdditionalImagesChange={handleAdditionalImagesChange}
          handleAddProduct={handleAddProduct}
          handleRemoveSkinType={handleRemoveSkinType}
          handleRemoveVariation={handleRemoveVariation}
          handleRemoveMainIngredient={handleRemoveMainIngredient}
          handleRemoveDetailIngredient={handleRemoveDetailIngredient}
          handleRemoveUsage={handleRemoveUsage}
          onClose={() => setIsModalOpen(false)}
          refetchProducts={refetchProducts}
        />,
        document.body
      )}
    </>
  );
};

export default ProductsTable;
