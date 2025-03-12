import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, PlusCircle, Edit, Search, Trash2 } from 'lucide-react';
import CategoryDistributionChart from "../../components/overview/CategoryDistributionChart";
import SalesTrendChart from "../../components/products/SalesTrendChart";
import { Link } from 'react-router-dom';

import {
  deleteProduct,
  updateProduct,
  createProduct,
  fetchBrands,
  fetchSkinTypeProduct
} from '../../utils/api';

/**
 * @param {Object[]} products - Danh sách sản phẩm
 */
const ProductsTable = ({ products }) => {
  const [localProducts, setLocalProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const [editProduct, setEditProduct] = useState(null);

  const [brandList, setBrandList] = useState([]);
  const [brandNameInput, setBrandNameInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [brandNameInputEdit, setBrandNameInputEdit] = useState(editProduct?.BrandName || '');
  const [showBrandSuggestionsEdit, setShowBrandSuggestionsEdit] = useState(false);
  const [previewUrlEdit, setPreviewUrlEdit] = useState(null);
  const [previewUrlNewUpload, setPreviewUrlNewUpload] = useState(null);
  const [previewUrlAdditionalImages, setPreviewUrlAdditionalImages] = useState([]);

  const [skinTypeList, setSkinTypeList] = useState([]);
  const [skinTypeNameInput, setSkinTypeNameInput] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);



  const [newProduct, setNewProduct] = useState({
    ProductName: '',
    Description: '',
    Category: '',
    BrandId: '',
    PictureFile: '',
    AdditionalPictures: [],
    ProductForSkinTypes: [
      { SkinTypeId: 0 },
    ],
    Variations: [
      { Ml: 0, Price: 0 },
    ],
    MainIngredients: [
      { IngredientName: '', Description: '' },
    ],
    DetailIngredients: [
      { IngredientName: '' },
    ],
    Usages: [
      { Step: 1, Instruction: '' },
    ],
  });

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

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
    const term = searchTerm.toLowerCase();
    const filtered = localProducts.filter(
      (product) =>
        product.ProductName.toLowerCase().includes(term) ||
        product.Category.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, localProducts]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const displayedProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setLocalProducts((prev) => prev.filter((p) => p.ProductId !== productId));
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleEdit = async () => {
    if (!editProduct) return;
    try {
      const updated = await updateProduct(editProduct.ProductId, editProduct);
      setLocalProducts((prev) =>
        prev.map((p) => (p.ProductId === updated.ProductId ? updated : p))
      );
      setIsEditModalOpen(false);
      setEditProduct(null);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.ProductName || !newProduct.Category || !newProduct.BrandId) {
      alert('Please fill in required fields: ProductName, Category, BrandId');
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
        ProductForSkinTypes: [{ SkinTypeId: '' }],
        Variations: [{ Ml: 0, Price: 0 }],
        MainIngredients: [{ IngredientName: 'IngredientName', Description: 'Description' }],
        DetailIngredients: [{ IngredientName: 'IngredientName' }],
        Usages: [{ Step: 1, Instruction: 'Instruction' }],
      });
      setBrandNameInput('');
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const handleRemoveAdditionalImage = (index) => {
    setPreviewUrlAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setNewProduct((prev) => ({
      ...prev,
      AdditionalPictures: prev.AdditionalPictures.filter((_, i) => i !== index),
    }));
  };

  // Hàm xử lý khi người dùng chọn file
  const handleAdditionalImagesChange = (e) => {
    if (e.target.files) {
      // Lấy mảng File từ input
      const files = Array.from(e.target.files);

      // Append (thêm) vào danh sách file cũ
      setNewProduct((prev) => ({
        ...prev,
        AdditionalPictures: [...prev.AdditionalPictures, ...files],
      }));

      // Tạo các URL preview cho từng file
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      // Append vào mảng preview cũ
      setPreviewUrlAdditionalImages((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleAddVariation = () => {
    setNewProduct((prev) => ({
      ...prev,
      Variations: [...prev.Variations, { Ml: 0, Price: 0 }],
    }));
  };

  const handleRemoveVariation = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      Variations: prev.Variations.filter((_, i) => i !== index),
    }));
  };

  const handleVariationChange = (index, field, value) => {
    const updated = [...newProduct.Variations];
    updated[index] = { ...updated[index], [field]: value };
    setNewProduct((prev) => ({ ...prev, Variations: updated }));
  };

  const handleAddMainIngredient = () => {
    setNewProduct((prev) => ({
      ...prev,
      MainIngredients: [...prev.MainIngredients, { IngredientName: '', Description: '' }],
    }));
  };

  const handleRemoveMainIngredient = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      MainIngredients: prev.MainIngredients.filter((_, i) => i !== index),
    }));
  };

  const handleMainIngredientChange = (index, field, value) => {
    const updated = [...newProduct.MainIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setNewProduct((prev) => ({ ...prev, MainIngredients: updated }));
  };

  const handleAddDetailIngredient = () => {
    setNewProduct((prev) => ({
      ...prev,
      DetailIngredients: [...prev.DetailIngredients, { IngredientName: '' }],
    }));
  };

  const handleRemoveDetailIngredient = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      DetailIngredients: prev.DetailIngredients.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveProductForSkinTypes = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      ProductForSkinTypes: prev.ProductForSkinTypes.filter((_, i) => i !== index),
    }));
  };

  const handleDetailIngredientChange = (index, field, value) => {
    const updated = [...newProduct.DetailIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setNewProduct((prev) => ({ ...prev, DetailIngredients: updated }));
  };

  const handleProductForSkinTypeChange = (index, field, value) => {
    const updated = [...newProduct.ProductForSkinTypes];
    updated[index] = { ...updated[index], [field]: value };
    setNewProduct((prev) => ({ ...prev, ProductForSkinTypes: updated }));
  };

  const handleAddUsage = () => {
    setNewProduct((prev) => ({
      ...prev,
      Usages: [...prev.Usages, { Step: 1, Instruction: '' }],
    }));
  };

  const handleRemoveUsage = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      Usages: prev.Usages.filter((_, i) => i !== index),
    }));
  };

  const handleUsageChange = (index, field, value) => {
    const updated = [...newProduct.Usages];
    updated[index] = { ...updated[index], [field]: value };
    setNewProduct((prev) => ({ ...prev, Usages: updated }));
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
      {/* Modal Edit */}
      {isEditModalOpen && editProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl overflow-auto z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="ProductName"
                className="p-2 border border-gray-300 text-gray-900 rounded-lg"
                value={editProduct.ProductName || ''}
                autoFocus
                onChange={(e) =>
                  setEditProduct({ ...editProduct, ProductName: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Category"
                className="p-2 border border-gray-300 text-gray-900 rounded-lg"
                value={editProduct.Category || ''}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, Category: e.target.value })
                }
              />
              {/* Brand - Simple input; you can add autocomplete logic here if needed */}

              <div className="relative col-span-2">
                <label className="block mb-1 text-gray-700 font-semibold">Brand</label>
                <input
                  type="text"
                  placeholder="Search brand name..."
                  className="w-full p-2 border border-gray-300 text-gray-900 rounded-lg"
                  value={editProduct.BrandName || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBrandNameInputEdit(val);
                    setShowBrandSuggestionsEdit(!!val);
                    setEditProduct({ ...editProduct, BrandName: e.target.value });
                  }}
                />
                {showBrandSuggestionsEdit && brandNameInputEdit && (
                  <ul className="absolute left-0 right-0 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto z-10">
                    {brandList
                      .filter((b) => b.Name.toLowerCase().includes(brandNameInputEdit.toLowerCase()))
                      .map((brand) => (
                        <li
                          key={brand.BrandId}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setEditProduct({
                              ...editProduct,
                              BrandId: brand.BrandId,
                              BrandName: brand.Name, // nếu muốn hiển thị
                            });
                            setBrandNameInputEdit(brand.Name);
                            setShowBrandSuggestionsEdit(false);
                          }}
                        >
                          {brand.Name}
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div className="relative col-span-2">
                <label className="block mb-1 text-gray-700 font-semibold">Image</label>
                <div className="flex flex-row items-center gap-4">
                  {previewUrlEdit ? (
                    <a
                      href={previewUrlEdit}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-40 h-40 border border-gray-300"
                    >
                      <img
                        src={previewUrlEdit}
                        alt="Preview new upload"
                        className="w-full h-full object-cover rounded"
                      />
                    </a>
                  ) : editProduct.PictureUrl && typeof editProduct.PictureUrl === 'string' ? (
                    <Link
                      to={editProduct.PictureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-40 h-40 border border-gray-300"
                    >
                      <img
                        src={editProduct.PictureUrl}
                        alt="Current product image"
                        className="w-full h-full object-cover rounded"
                      />
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-500">No image available</span>
                  )}

                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50"
                  >
                    <span className="text-2xl text-gray-400">+</span>
                    <span className="text-sm text-gray-500 mt-1">Replace product image</span>
                  </label>

                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    title="Upload image of product"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        // Lưu file vào editProduct (field: PictureFile)
                        setEditProduct((prev) => ({
                          ...prev,
                          PictureFile: file,
                        }));
                        // Tạo preview tạm để hiển thị ngay
                        const preview = URL.createObjectURL(file);
                        console.log('Preview URL:', preview); // Kiểm tra URL
                        setPreviewUrlEdit(preview);

                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <textarea
                rows={3}
                placeholder="Description"
                className="w-full p-2 border border-gray-300 text-gray-900 rounded-lg"
                value={editProduct.Description || ''}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, Description: e.target.value })
                }
              />
            </div>

            {/* Skin Types */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Skin Types</h4>
                <button
                  onClick={() =>
                    setEditProduct((prev) => ({
                      ...prev,
                      ProductForSkinTypes: [
                        ...(prev.ProductForSkinTypes || []),
                        { SkinTypeId: '', TypeName: '', showSuggestions: false },
                      ],
                    }))
                  }
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                >
                  + Add Skin Type
                </button>
              </div>
              {(editProduct.ProductForSkinTypes || []).map((item, index) => (
                <div key={index} className="relative flex gap-2 mb-2 items-center">
                  <input
                    type="text"
                    placeholder="Skin type..."
                    className="w-full p-2 border border-gray-300 text-gray-900 rounded-lg"
                    value={item.TypeName || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditProduct((prev) => {
                        const updated = [...(prev.ProductForSkinTypes || [])];
                        updated[index] = { ...updated[index], TypeName: val, showSuggestions: !!val };
                        return { ...prev, ProductForSkinTypes: updated };
                      });
                    }}
                  />

                  {item.showSuggestions && item.TypeName && (
                    <ul className="absolute left-0 right-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                      {skinTypeList
                        .filter((s) =>
                          s.TypeName.toLowerCase().includes(item.TypeName.toLowerCase())
                        )
                        .map((s) => (
                          <li
                            key={s.SkinTypeId}
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setEditProduct((prev) => {
                                const updated = [...(prev.ProductForSkinTypes || [])];
                                updated[index] = {
                                  SkinTypeId: s.SkinTypeId,
                                  TypeName: s.TypeName,
                                  showSuggestions: false,
                                };
                                return { ...prev, ProductForSkinTypes: updated };
                              });
                            }}
                          >
                            {s.TypeName}
                          </li>
                        ))}
                    </ul>
                  )}

                  <button
                    onClick={() =>
                      setEditProduct((prev) => ({
                        ...prev,
                        ProductForSkinTypes: (prev.ProductForSkinTypes || []).filter((_, i) => i !== index),
                      }))
                    }
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Variations */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Variations</h4>
                <button
                  onClick={() =>
                    setEditProduct((prev) => ({
                      ...prev,
                      Variations: [...prev.Variations, { Ml: 0, Price: 0 }],
                    }))
                  }
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                >
                  + Add Variation
                </button>
              </div>
              {editProduct.Variations?.map((variation, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="number"
                    step="any"
                    placeholder="Ml"
                    className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                    value={variation.Ml}
                    onChange={(e) =>
                      setEditProduct((prev) => {
                        const updated = [...prev.Variations];
                        updated[index] = { ...updated[index], Ml: parseFloat(e.target.value) };
                        return { ...prev, Variations: updated };
                      })
                    }
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Price"
                    className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                    value={variation.Price}
                    onChange={(e) =>
                      setEditProduct((prev) => {
                        const updated = [...prev.Variations];
                        updated[index] = { ...updated[index], Price: parseFloat(e.target.value) };
                        return { ...prev, Variations: updated };
                      })
                    }
                  />
                  <button
                    onClick={() =>
                      setEditProduct((prev) => ({
                        ...prev,
                        Variations: prev.Variations.filter((_, i) => i !== index),
                      }))
                    }
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Main Ingredients */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Main Ingredients</h4>
                <button
                  onClick={() =>
                    setEditProduct((prev) => ({
                      ...prev,
                      MainIngredients: [
                        ...prev.MainIngredients,
                        { IngredientName: '', Description: '' },
                      ],
                    }))
                  }
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                >
                  + Add Main Ingredient
                </button>
              </div>
              {editProduct.MainIngredients?.map((ing, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="text"
                    placeholder="IngredientName"
                    className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                    value={ing.IngredientName}
                    onChange={(e) =>
                      setEditProduct((prev) => {
                        const updated = [...prev.MainIngredients];
                        updated[index] = { ...updated[index], IngredientName: e.target.value };
                        return { ...prev, MainIngredients: updated };
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                    value={ing.Description}
                    onChange={(e) =>
                      setEditProduct((prev) => {
                        const updated = [...prev.MainIngredients];
                        updated[index] = { ...updated[index], Description: e.target.value };
                        return { ...prev, MainIngredients: updated };
                      })
                    }
                  />
                  <button
                    onClick={() =>
                      setEditProduct((prev) => ({
                        ...prev,
                        MainIngredients: prev.MainIngredients.filter((_, i) => i !== index),
                      }))
                    }
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Detail Ingredients */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Detail Ingredients</h4>
                <button
                  onClick={() =>
                    setEditProduct((prev) => ({
                      ...prev,
                      DetailIngredients: [
                        ...prev.DetailIngredients,
                        { IngredientName: '' },
                      ],
                    }))
                  }
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                >
                  + Add Detail Ingredient
                </button>
              </div>
              {editProduct.DetailIngredients?.map((ing, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="text"
                    placeholder="IngredientName"
                    className="w-full p-1 border border-gray-300 text-gray-900 rounded"
                    value={ing.IngredientName}
                    onChange={(e) =>
                      setEditProduct((prev) => {
                        const updated = [...prev.DetailIngredients];
                        updated[index] = { ...updated[index], IngredientName: e.target.value };
                        return { ...prev, DetailIngredients: updated };
                      })
                    }
                  />
                  <button
                    onClick={() =>
                      setEditProduct((prev) => ({
                        ...prev,
                        DetailIngredients: prev.DetailIngredients.filter((_, i) => i !== index),
                      }))
                    }
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Usages */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Usages</h4>
                <button
                  onClick={() =>
                    setEditProduct((prev) => ({
                      ...prev,
                      Usages: [...prev.Usages, { Step: 1, Instruction: '' }],
                    }))
                  }
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                >
                  + Add Usage
                </button>
              </div>
              {editProduct.Usages?.map((usage, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="number"
                    step="any"
                    placeholder="Step"
                    className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                    value={usage.Step}
                    onChange={(e) =>
                      setEditProduct((prev) => {
                        const updated = [...prev.Usages];
                        updated[index] = { ...updated[index], Step: parseInt(e.target.value) || 1 };
                        return { ...prev, Usages: updated };
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Instruction"
                    className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                    value={usage.Instruction}
                    onChange={(e) =>
                      setEditProduct((prev) => {
                        const updated = [...prev.Usages];
                        updated[index] = { ...updated[index], Instruction: e.target.value };
                        return { ...prev, Usages: updated };
                      })
                    }
                  />
                  <button
                    onClick={() =>
                      setEditProduct((prev) => ({
                        ...prev,
                        Usages: prev.Usages.filter((_, i) => i !== index),
                      }))
                    }
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button className="px-4 py-2 bg-gray-400 text-white rounded-lg" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={handleEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Products</h2>
        <div className="flex gap-4">
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
          <button
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Modal Thêm mới */}
      {isModalOpen && (
        <div
          className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl overflow-auto z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="ProductName"
                className="p-2 border border-gray-300 text-gray-900 rounded-lg"
                value={newProduct.ProductName}
                autoFocus
                onChange={(e) =>
                  setNewProduct({ ...newProduct, ProductName: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Category"
                className="p-2 border border-gray-300 text-gray-900 rounded-lg"
                value={newProduct.Category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, Category: e.target.value })
                }
              />

              {/* Brand - sử dụng autocomplete để chọn BrandId */}
              <div className="relative col-span-2">
                <label className="block mb-1 text-gray-700 font-semibold">Brand</label>
                <input
                  type="text"
                  placeholder="Search brand name..."
                  className="w-full p-2 border border-gray-300 text-gray-900 rounded-lg"
                  value={brandNameInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBrandNameInput(val);
                    setShowSuggestions(!!val);
                  }}
                />
                {showSuggestions && brandNameInput && (
                  <ul className="absolute left-0 right-0 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto z-10">
                    {brandList
                      .filter((b) =>
                        b.Name.toLowerCase().includes(brandNameInput.toLowerCase())
                      )
                      .map((brand) => (
                        <li
                          key={brand.BrandId}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            // Gán BrandId vào newProduct và cập nhật input hiển thị tên brand
                            setNewProduct({ ...newProduct, BrandId: brand.BrandId });
                            setBrandNameInput(brand.Name);
                            setShowSuggestions(false);
                          }}
                        >
                          {brand.Name}
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              {/* File upload */}
              <div className="relative col-span-2">
                <label className="block mb-1 text-gray-700 font-semibold">Image</label>
                <div className="flex flex-row items-center gap-4">
                  {previewUrlNewUpload ? (
                    <a
                      href={previewUrlNewUpload}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-40 h-40 border border-gray-300"
                    >
                      <img
                        src={previewUrlNewUpload}
                        alt="Preview new upload"
                        className="w-full h-full object-cover rounded"
                      />
                    </a>
                  ) : setNewProduct.PictureFile && typeof setNewProduct.PictureFile === 'string'(
                    <Link
                      to={setNewProduct.PictureFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-40 h-40 border border-gray-300"
                    >
                      <img
                        src={setNewProduct.PictureFile}
                        alt="Current product image"
                        className="w-full h-full object-cover rounded"
                      />
                    </Link>
                  )
                  }

                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50"
                  >
                    <span className="text-2xl text-gray-400">
                      {previewUrlNewUpload ||
                        (setNewProduct.PictureFile && typeof setNewProduct.PictureFile === "string")
                        ? ""
                        : "+"}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      {previewUrlNewUpload ||
                        (setNewProduct.PictureFile && typeof setNewProduct.PictureFile === "string")
                        ? "Replace image"
                        : "Upload image product"}
                    </span>
                  </label>

                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    title="Upload image of product"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const newFileUpload = e.target.files[0];
                        setNewProduct({ ...newProduct, PictureFile: newFileUpload });

                        const previewNewUpload = URL.createObjectURL(newFileUpload);
                        console.log('Preview URL:', previewNewUpload); // Kiểm tra URL
                        setPreviewUrlNewUpload(previewNewUpload);

                      }
                    }}
                  />
                </div>
              </div>

              {/* Additional images file upload */}
              <div className="mt-2 relative col-span-2">
                <label className="block mb-1 text-gray-700 font-semibold">
                  Additional images
                </label>
                <div className="flex flex-row items-center gap-4">
                  {previewUrlAdditionalImages.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {previewUrlAdditionalImages.map((url, index) => (
                        <div
                          key={index}
                          className="relative w-40 h-40 border border-gray-300 rounded overflow-hidden"
                        >
                          <Link
                            to={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block w-40 h-40 border border-gray-300"
                          >
                            <img
                              src={url}
                              alt={`Additional ${index}`}
                              className="w-full h-full object-cover"
                            />
                          </Link>
                          {/* Nút xóa ảnh */}
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Label đóng vai trò nút upload */}
                  <label
                    htmlFor="file-upload-additional"
                    className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50"
                  >
                    <span className="text-2xl text-gray-400">+</span>
                    <span className="text-sm text-gray-500 mt-1">
                      {previewUrlAdditionalImages.length > 0
                        ? "Add additional image"
                        : "Upload image"}
                    </span>
                  </label>

                  {/* Input file cho phép chọn nhiều ảnh */}
                  <input
                    id="file-upload-additional"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAdditionalImagesChange}
                  />


                  {/* Hiển thị preview các ảnh đã chọn */}

                </div>
              </div>

            </div>

            <div className="mb-4">
              <textarea
                rows={3}
                placeholder="Description"
                className="w-full p-2 border border-gray-300 text-gray-900 rounded-lg"
                value={newProduct.Description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, Description: e.target.value })
                }
              />
            </div>

            {/* ProductForSkinTypes */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">SkinTypes</h4>
                <button
                  onClick={() =>
                    setNewProduct((prev) => ({
                      ...prev,
                      ProductForSkinTypes: [
                        ...prev.ProductForSkinTypes,
                        // Thêm 1 phần tử mới có cấu trúc
                        { SkinTypeId: '', TypeName: '', showSuggestions: false },
                      ],
                    }))
                  }
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                >
                  + Add Skin Type
                </button>
              </div>

              {newProduct.ProductForSkinTypes.map((st, index) => (
                <div key={index} className="relative flex gap-2 mb-2 items-center">
                  <input
                    type="text"
                    placeholder="Skin type..."
                    className="w-full p-2 border border-gray-300 text-gray-900 rounded-lg"
                    // Lấy giá trị từ TypeName
                    value={st.TypeName}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Cập nhật TypeName + showSuggestions cho phần tử index
                      setNewProduct((prev) => {
                        const updated = [...prev.ProductForSkinTypes];
                        updated[index] = {
                          ...updated[index],
                          TypeName: val,
                          showSuggestions: !!val, // bật gợi ý khi có nội dung
                        };
                        return { ...prev, ProductForSkinTypes: updated };
                      });
                    }}
                  />

                  {st.showSuggestions && st.TypeName && (
                    <ul className="absolute left-0 right-0 top-12 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                      {skinTypeList
                        .filter((b) =>
                          b.TypeName.toLowerCase().includes(st.TypeName.toLowerCase())
                        )
                        .map((skinType) => (
                          <li
                            key={skinType.SkinTypeId}
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setNewProduct((prev) => {
                                const updated = [...prev.ProductForSkinTypes];
                                updated[index] = {
                                  ...updated[index],
                                  SkinTypeId: skinType.SkinTypeId,
                                  TypeName: skinType.TypeName,
                                  showSuggestions: false,
                                };
                                return { ...prev, ProductForSkinTypes: updated };
                              });
                            }}
                          >
                            {skinType.TypeName}
                          </li>
                        ))}
                    </ul>
                  )}

                  <button
                    onClick={() => {
                      setNewProduct((prev) => ({
                        ...prev,
                        ProductForSkinTypes: prev.ProductForSkinTypes.filter(
                          (_, i) => i !== index
                        ),
                      }));
                    }}
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Variations */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Variations</h4>
                <button
                  onClick={() =>
                    setNewProduct((prev) => ({
                      ...prev,
                      Variations: [...prev.Variations, { Ml: 0, Price: 0 }],
                    }))
                  }
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                >
                  + Add Variation
                </button>
              </div>
              {newProduct.Variations.map((variation, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="number"
                    placeholder="Ml"
                    className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                    value={variation.Ml}
                    onChange={(e) =>
                      handleVariationChange(index, 'Ml', parseInt(e.target.value))
                    }
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                    value={variation.Price}
                    onChange={(e) =>
                      handleVariationChange(index, 'Price', parseFloat(e.target.value))
                    }
                  />
                  <button
                    onClick={() => handleRemoveVariation(index)}
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* MainIngredients */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Main Ingredients</h4>
                <button
                  onClick={() =>
                    setNewProduct((prev) => ({
                      ...prev,
                      MainIngredients: [...prev.MainIngredients, { IngredientName: '', Description: '' }],
                    }))
                  }
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                >
                  + Add Main Ingredient
                </button>
              </div>
              {newProduct.MainIngredients.map((ing, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="text"
                    placeholder="IngredientName"
                    className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                    value={ing.IngredientName}
                    onChange={(e) =>
                      handleMainIngredientChange(index, 'IngredientName', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                    value={ing.Description}
                    onChange={(e) =>
                      handleMainIngredientChange(index, 'Description', e.target.value)
                    }
                  />
                  <button
                    onClick={() => handleRemoveMainIngredient(index)}
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* DetailIngredients */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Detail Ingredients</h4>
                <button
                  onClick={() =>
                    setNewProduct((prev) => ({
                      ...prev,
                      DetailIngredients: [...prev.DetailIngredients, { IngredientName: '' }],
                    }))
                  }
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                >
                  + Add Detail Ingredient
                </button>
              </div>
              {newProduct.DetailIngredients.map((ing, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="text"
                    placeholder="IngredientName"
                    className="w-full p-1 border border-gray-300 text-gray-900 rounded"
                    value={ing.IngredientName}
                    onChange={(e) =>
                      handleDetailIngredientChange(index, 'IngredientName', e.target.value)
                    }
                  />
                  <button
                    onClick={() => handleRemoveDetailIngredient(index)}
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Usages */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Usages</h4>
                <button
                  onClick={() =>
                    setNewProduct((prev) => ({
                      ...prev,
                      Usages: [...prev.Usages, { Step: 1, Instruction: '' }],
                    }))
                  }
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                >
                  + Add Usage
                </button>
              </div>
              {newProduct.Usages.map((usage, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="number"
                    placeholder="Step"
                    className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                    value={usage.Step}
                    onChange={(e) =>
                      handleUsageChange(index, 'Step', parseInt(e.target.value) || 1)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Instruction"
                    className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                    value={usage.Instruction}
                    onChange={(e) =>
                      handleUsageChange(index, 'Instruction', e.target.value)
                    }
                  />
                  <button
                    onClick={() => handleRemoveUsage(index)}
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={handleAddProduct}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
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
                    <button
                      className="text-indigo-400 hover:text-indigo-300 mr-2"
                      onClick={() => {
                        setEditProduct(product);
                        setIsEditModalOpen(true);
                      }}
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

      {/* Pagination */}
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

      {/* Charts */}
      <div className="mt-10 grid grid-col-1 lg:grid-cols-2 gap-8 z-0">
        <SalesTrendChart />
        <CategoryDistributionChart products={products} />
      </div>
    </motion.div>
  );
};

export default ProductsTable;
