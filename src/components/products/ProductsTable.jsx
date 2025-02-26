import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, PlusCircle, Edit, Search, Trash2 } from 'lucide-react';
import {
  fetchProducts,
  deleteProduct,
  updateProduct,
  createProduct,
} from '../../utils/api';

const ProductsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    image: '',
    discount: '',
    rating: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    getProducts();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const displayedProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product.id !== id));
        setFilteredProducts(
          filteredProducts.filter((product) => product.id !== id)
        );
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleEdit = async (id, updatedData) => {
    try {
      await updateProduct(id, updatedData);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id ? updatedData : product
        )
      );
      setFilteredProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id ? updatedData : product
        )
      );
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const createdProduct = await createProduct(newProduct);
      setProducts([createdProduct, ...products]);
      setFilteredProducts([createdProduct, ...filteredProducts]);
      setIsModalOpen(false);
      setNewProduct({
        name: '',
        category: '',
        price: '',
        originalPrice: '',
        image: '',
        discount: '',
        rating: '',
      });
    } catch (error) {
      console.error('Failed to add product:', error);
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
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2 py-2">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2 py-2">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
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
      {/* Header */}
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Product List</h2>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleSearch}
              value={searchTerm}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
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

      {/* Modal for Adding Product */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Product</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                className="p-2 border rounded-lg"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Category"
                className="p-2 border rounded-lg"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Price"
                className="p-2 border rounded-lg"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Original Price"
                className="p-2 border rounded-lg"
                value={newProduct.originalPrice}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    originalPrice: e.target.value,
                  })
                }
              />
              <input
                type="text"
                placeholder="Discount"
                className="p-2 border rounded-lg"
                value={newProduct.discount}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, discount: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Image URL"
                className="p-2 border rounded-lg"
                value={newProduct.image}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image: e.target.value })
                }
              />
              <input
                type="number"
                step="0.1"
                placeholder="Rating"
                className="p-2 border rounded-lg"
                value={newProduct.rating}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, rating: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={handleAddProduct}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

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
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Original Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {displayedProducts.map((product) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center">
                  <img
                    src={product.image || 'https://via.placeholder.com/50'}
                    alt="Product img"
                    className="size-10 rounded-full"
                  />
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  ${parseFloat(product.price || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {product.sales}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    className="text-indigo-400 hover:text-indigo-300 mr-2"
                    onClick={() => handleEdit(product.id, product)}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 mx-2 rounded-lg ${
            currentPage === 1
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
          className={`px-4 py-2 mx-2 rounded-lg ${
            currentPage === totalPages
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

export default ProductsTable;
