// ProductsPage.jsx
import styles from './ProductsPage.module.css';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Dropdown from '../../components/Dropdown/Dropdown';
import ProductList from '../../components/CardProduct/ProductList';
import Filters from '../../components/Filters/Filters';
import Pagination from '../../components/Pagination/Pagination';
import {
  fetchActiveProductsWithDetails,
  fetchCategoriesFromActiveProducts,
  fetchSkinTypeProduct
} from '../../utils/api.js';
import { clearCache, clearAllCache } from '../../utils/cacheUtils.js';
import { useState, useEffect, useMemo, createContext } from 'react';
import LoadingPage from '../../Pages/LoadingPage/LoadingPage';
import { useLocation } from 'react-router-dom';

// Create context to share loading state with child components
export const LoadingContext = createContext({
  isLoading: true,
  categories: [],
  skinTypes: [],
  products: [],
});

function ProductsPage() {
  console.log('--- ProductsPage Mounted ---');
  const breadcrumbItems = [
    { label: 'Products', link: '/products', active: true },
  ];

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skinTypes, setSkinTypes] = useState([]);
  const location = useLocation();
  categories
  // Đặt mặc định "" hoặc "Price: Low to High" tuỳ nhu cầu
  const [sortOption, setSortOption] = useState('');

  const [filters, setFilters] = useState({
    category: [],
    priceRange: [],
    skinType: [],
  });

  console.log('Initial filters state:', filters);

  // Central loading state
  const [isLoading, setIsLoading] = useState(true);

  // Individual loading trackers
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSkinTypes, setLoadingSkinTypes] = useState(true);

  const [totalProduct, setTotalProduct] = useState(0);

  // -----------------------------
  // Phân trang
  // -----------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalProduct / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentPageProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  // Cập nhật isLoading tổng khi 1 trong 3 loading thay đổi
  useEffect(() => {
    setIsLoading(loadingProducts || loadingCategories || loadingSkinTypes);
  }, [loadingProducts, loadingCategories, loadingSkinTypes]);

  // Refresh data by clearing cache and refetching
  const refreshData = () => {
    setIsLoading(true);
    clearCache('activeProducts');
    clearCache('activeCategories');
    clearCache('skinTypes');
    
    // Reset loading states
    setLoadingProducts(true);
    setLoadingCategories(true);
    setLoadingSkinTypes(true);
    
    // Refetch all data
    fetchProducts();
    fetchCategories();
    fetchSkinTypes();
  };
  
  // Function to fetch products (extracted for reuse)
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await fetchActiveProductsWithDetails();
      // Lọc lại các sản phẩm Active để chắc chắn chỉ tính totalProduct cho những sản phẩm đang Active
      const activeProducts = data.filter((prod) => prod.IsActive === true);

      setProducts(activeProducts);
      setFilteredProducts(activeProducts);
      setTotalProduct(activeProducts.length);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };
  
  // Function to fetch categories (extracted for reuse)
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await fetchCategoriesFromActiveProducts();

      // Transform raw categories into the format expected by Filters component
      const splittedCategories = categoriesData.flatMap((item) =>
        item.split(',').map((str) => str.trim())
      );
      const uniqueCategories = Array.from(new Set(splittedCategories));

      const mappedCategories = uniqueCategories.map((cat) => {
        const capitalizedLabel =
          cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
        return {
          label: capitalizedLabel,
          // Change this to match exactly what HomePage is sending
          value: capitalizedLabel
        };
      });

      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };
  
  // Function to fetch skin types (extracted for reuse)
  const fetchSkinTypes = async () => {
    try {
      setLoadingSkinTypes(true);
      const skinTypesData = await fetchSkinTypeProduct();
      const activeSkinTypes = skinTypesData.filter((item) => item.IsActive === true);

      const mappedSkinTypes = activeSkinTypes.map((item) => {
        const labelWithoutSkin = item.TypeName.replace(' Skin', '');
        return {
          label: labelWithoutSkin,
          value: item.SkinTypeId.toString()
        };
      });

      setSkinTypes(mappedSkinTypes);
    } catch (error) {
      console.error('Error fetching skin types:', error);
    } finally {
      setLoadingSkinTypes(false);
    }
  };

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch skin types
  useEffect(() => {
    fetchSkinTypes();
  }, []);

  // Nếu đến từ New Arrivals, tự set sort = "Newest"
  useEffect(() => {
    if (location.state?.fromNewArrivals) {
      setSortOption('Newest');
    }
  }, [location.state]);
  // Check if coming from "Shop by Skin Type" and update the filters
  useEffect(() => {
    if (location.state?.filterBySkinType) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        skinType: location.state.filterBySkinType, // Set the skin type filter
      }));
    }
  }, [location.state]);

  // Filter + Sort
  useEffect(() => {
    let newFiltered = [...products];

    // Filter by category
    if (filters.category.length > 0) {
      newFiltered = newFiltered.filter((product) => {
        if (!product.Category) return false;
        const productCategories = product.Category.split(',').map(cat =>
          cat.trim().charAt(0).toUpperCase() + cat.trim().slice(1).toLowerCase()
        );

        return filters.category.some(selectedCat => {
          const selectedCatLabel = selectedCat.replace(/_/g, ' ');
          return productCategories.some(prodCat => prodCat === selectedCatLabel);
        });
      });
    }

    // Filter by price range
    if (filters.priceRange.length > 0) {
      newFiltered = newFiltered.filter((product) => {
        // Check if product has Variations
        if (
          !product.Variations ||
          !Array.isArray(product.Variations) ||
          product.Variations.length === 0
        ) {
          return false;
        }
        const firstVariation = product.Variations[0];
        const priceToCompare =
          (firstVariation.SalePrice && firstVariation.SalePrice > 0)
            ? firstVariation.SalePrice
            : firstVariation.Price;

        if (typeof priceToCompare !== 'number' || isNaN(priceToCompare)) {
          return false;
        }

        return filters.priceRange.some((range) => {
          switch (range) {
            case 'under_25':
              return priceToCompare < 25;
            case '25_50':
              return priceToCompare >= 25 && priceToCompare <= 50;
            case '50_100':
              return priceToCompare >= 50 && priceToCompare <= 100;
            case 'over_100':
              return priceToCompare > 100;
            default:
              return false;
          }
        });
      });
    }

    // Filter by skin type
    if (filters.skinType.length > 0) {
      newFiltered = newFiltered.filter((product) => {
        if (!product.ProductForSkinTypes || product.ProductForSkinTypes.length === 0) {
          return false;
        }
        const productSkinTypeIds = product.ProductForSkinTypes.map(item => item.SkinTypeId);
        return filters.skinType.some(selectedSkinTypeId => {
          const numericSelectedId = Number(selectedSkinTypeId);
          return productSkinTypeIds.includes(numericSelectedId);
        });
      });
    }

    // Ưu tiên SalePrice nếu > 0, nếu không lấy Price, nếu không có Variations thì = 0
    const getPriceFromFirstVariation = (product) => {
      if (!product.Variations || product.Variations.length === 0) {
        return 0;
      }
      const firstVariation = product.Variations[0];
      const price = (firstVariation.SalePrice && firstVariation.SalePrice > 0)
        ? firstVariation.SalePrice
        : firstVariation.Price;
      return price ?? 0; // phòng khi cả SalePrice lẫn Price bị null/undefined
    };

    // Sort products
    if (sortOption) {
      newFiltered.sort((a, b) => {
        const priceA = getPriceFromFirstVariation(a);
        const priceB = getPriceFromFirstVariation(b);

        switch (sortOption) {
          case 'Price: Low to High':
            return priceA - priceB;
          case 'Price: High to Low':
            return priceB - priceA;
          case 'Newest':
            // Giả định ID cao hơn = mới hơn
            return b.ProductId - a.ProductId;
          case 'Popular':
            // Giả định AverageRating cao = popular hơn
            return (b.AverageRating || 0) - (a.AverageRating || 0);
          default:
            console.log('No matching sort option:', sortOption);
            return 0;
        }
      });

      // Kiểm tra thứ tự cuối sau sort
      console.log('filteredProducts after sort:', newFiltered.map(p => p.ProductId));
    }

    setFilteredProducts(newFiltered);
    setTotalProduct(newFiltered.length);
    setCurrentPage(1);
  }, [products, filters, sortOption]);

  useEffect(() => {
    if (filters.skinType.length > 0) {
      console.log('Active skin type filters:', filters.skinType);
      console.log(
        'Selected skin type filters (as numbers):',
        filters.skinType.map((id) => Number(id))
      );

      // Check the first 2 products to see if they match the skin type filters
      if (products.length >= 2) {
        const productSample = products.slice(0, 2);
        productSample.forEach((product, index) => {
          if (
            product.ProductForSkinTypes &&
            Array.isArray(product.ProductForSkinTypes)
          ) {
            const skinTypeIds = product.ProductForSkinTypes.map(
              (item) => item.SkinTypeId
            );
            console.log(`Product ${index} skin type IDs:`, skinTypeIds);

            // Check if this product matches any of the selected filters
            const matches = filters.skinType.some((selectedId) => {
              const numericId = Number(selectedId);
              return skinTypeIds.includes(numericId);
            });

            console.log(`Product ${index} matches skin type filter:`, matches);
          }
        });
      }
    }
  }, [filters.skinType, products]);

  // Debug: Log product structure
  useEffect(() => {
    if (products.length > 0) {
      console.log('Product example:', products[0]);
      console.log('Skin Type information:');
      console.log('- products[0].SkinType:', products[0].SkinType);
      console.log(
        '- products[0].ProductSkinTypes:',
        products[0].ProductSkinTypes
      );
      console.log(
        '- products[0].ProductForSkinTypes:',
        products[0].ProductForSkinTypes
      );
    }
  }, [products]);

  // Debug: Add more product structure info for price
  useEffect(() => {
    if (products.length > 0) {
      console.log('Price information:');
      const sampleProduct = products[0];
      console.log('Direct price property:', sampleProduct.Price);
      console.log('Variations:', sampleProduct.Variations);

      if (sampleProduct.Variations && sampleProduct.Variations.length > 0) {
        console.log(
          'First variation price:',
          sampleProduct.Variations[0].Price
        );
        console.log(
          'First variation sale price:',
          sampleProduct.Variations[0].SalePrice
        );
      }
    }
  }, [products]);

  // Debug price range filtering
  useEffect(() => {
    if (filters.priceRange.length > 0 && products.length > 0) {
      console.log('Active price range filters:', filters.priceRange);

      // Check a few sample products
      const sampleProducts = products.slice(0, 3);
      sampleProducts.forEach((product, index) => {
        if (product.Variations && product.Variations.length > 0) {
          const firstVariation = product.Variations[0];
          const priceToCompare =
            firstVariation.SalePrice && firstVariation.SalePrice > 0
              ? firstVariation.SalePrice
              : firstVariation.Price;

          console.log(
            `Product ${index} - Name: ${product.ProductName}, Price: ${priceToCompare}`
          );

          // Check if the product matches any selected price range
          const matches = filters.priceRange.some((range) => {
            switch (range) {
              case 'under_25':
                return priceToCompare < 25;
              case '25_50':
                return priceToCompare >= 25 && priceToCompare <= 50;
              case '50_100':
                return priceToCompare >= 50 && priceToCompare <= 100;
              case 'over_100':
                return priceToCompare > 100;
              default:
                return false;
            }
          });

          console.log(`Product ${index} matches price filter: ${matches}`);
        } else {
          console.log(`Product ${index} has no variations or prices`);
        }
      });
    }
  }, [filters.priceRange, products]);

  // 5. Hàm nhận updatedFilters từ Filters
  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
  };

  // Hàm nhận option sort
  const handleSortChange = (option) => {
    // Đảm bảo option là 1 trong các case ("Price: Low to High", "Price: High to Low", "Newest", "Popular")
    console.log('Sort changed to:', option);
    setSortOption(option);
  };

  const loadingContextValue = {
    isLoading,
    categories,
    skinTypes,
    products,
  };

  useEffect(() => {
    console.log('Location state:', location.state);

    // Handle skin type filter
    if (location.state?.filterBySkinType) {
      console.log(
        'Applying skin type filter:',
        location.state.filterBySkinType
      );
      setFilters((prev) => ({
        ...prev,
        skinType: location.state.filterBySkinType,
      }));
    }

    // Handle category filter
    if (location.state?.filterByCategory) {
      console.log('Applying category filter:', location.state.filterByCategory);
      // Ensure consistent case transformation
      const categoryValues = location.state.filterByCategory.map((cat) =>
        cat.toLowerCase().replace(/\s+/g, '_')
      );

      console.log('Transformed category values:', categoryValues);

      setFilters((prev) => ({
        ...prev,
        category: categoryValues,
      }));
    }
  }, [location.state]);

  console.log('Updated filters state:', filters);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <LoadingContext.Provider value={loadingContextValue}>
      <Navbar />
      <div className={`mt-20 ${styles.productPage_container}`}>
        <div className="row">
          <div className="col-12 mb-3">
            <div
              className={`d-flex flex-column flex-md-row justify-content-between align-items-center ${styles.productPage_breadcrumb}`}
            >
              <Breadcrumb items={breadcrumbItems} />
              {/* Cache control - only visible to admin users */}
              {localStorage.getItem('token') && 
                JSON.parse(atob(localStorage.getItem('token').split('.')[1]))['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin' && (
                <div className="flex items-center gap-2 ml-auto">
                  <button 
                    onClick={refreshData}
                    className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
                  >
                    Refresh Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row">
          <div className={`col-lg-2 ${styles.productPage_sidebar}`}>
            <Filters
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </div>

          <div className={`col-12 col-md-8 col-lg-9`}>
            <div className={`d-flex align-items-center mb-3`}>
              <div className={`fw-bold ${styles.totalProducts}`}>
                {totalProduct} products
              </div>
              <div className={styles.sortByFeature}>
                <Dropdown
                  onSortChange={handleSortChange}
                  sortOption={sortOption}
                />
              </div>
            </div>

            <ProductList products={currentPageProducts} loading={isLoading} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      <Footer />
    </LoadingContext.Provider>
  );
}

export default ProductsPage;