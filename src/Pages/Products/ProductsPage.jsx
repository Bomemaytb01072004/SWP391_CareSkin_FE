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
  fetchSkinTypeProduct,
} from '../../utils/api.js';
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
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 20; // Số sản phẩm mỗi trang (tuỳ ý)

  // Lấy tổng số trang = làm tròn trên (filteredProducts / itemsPerPage)
  const totalPages = Math.ceil(totalProduct / itemsPerPage);

  // Tính mảng sản phẩm hiển thị cho trang hiện tại
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Memoize the current page products to avoid unnecessary recalculations
  const currentPageProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  // Update the master loading state whenever any individual state changes
  useEffect(() => {
    setIsLoading(loadingProducts || loadingCategories || loadingSkinTypes);
  }, [loadingProducts, loadingCategories, loadingSkinTypes]);

  // Fetch products
  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // Fetch categories and transform them for the Filters component
  useEffect(() => {
    (async () => {
      try {
        setLoadingCategories(true);
        const data = await fetchCategoriesFromActiveProducts();

        // Transform raw categories into the format expected by Filters component
        const splittedCategories = data.flatMap((item) =>
          item.split(',').map((str) => str.trim())
        );
        const uniqueCategories = Array.from(new Set(splittedCategories));

        const mappedCategories = uniqueCategories.map((cat) => {
          const capitalizedLabel =
            cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
          return {
            label: capitalizedLabel,
            // Use lowercase with underscores for value
            value: cat.toLowerCase().replace(/\s+/g, '_'),
          };
        });

        setCategories(mappedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  // Fetch skin types and transform them for the Filters component
  useEffect(() => {
    (async () => {
      try {
        setLoadingSkinTypes(true);
        const data = await fetchSkinTypeProduct();
        // Only use active skin types
        const activeSkinTypes = data.filter((item) => item.IsActive === true);

        // Transform skin types into the format expected by Filters component
        const mappedSkinTypes = activeSkinTypes.map((item) => {
          // Extract the skin type name without the 'Skin' suffix
          const labelWithoutSkin = item.TypeName.replace(' Skin', '');
          return {
            label: labelWithoutSkin,
            // Ensure SkinTypeId is stored as a string to match form value format
            value: item.SkinTypeId.toString(),
          };
        });

        setSkinTypes(mappedSkinTypes);
      } catch (error) {
        console.error('Error fetching skin types:', error);
      } finally {
        setLoadingSkinTypes(false);
      }
    })();
  }, []);

  // Check if coming from "New Arrivals" and sort accordingly
  useEffect(() => {
    if (location.state?.fromNewArrivals) {
      setSortOption('Newest'); // Apply sorting ONLY when coming from New Arrivals
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

  // Function to get price from a product's first variation
  const getPriceFromFirstVariation = (product) => {
    if (!product.Variations || product.Variations.length === 0) {
      return 0;
    }
    const firstVariation = product.Variations[0];
    return firstVariation.SalePrice && firstVariation.SalePrice > 0
      ? firstVariation.SalePrice
      : firstVariation.Price || 0;
  };

  // Apply filters and sorting to products
  useEffect(() => {
    let newFiltered = [...products];

    // Filter by category
    if (filters.category.length > 0) {
      newFiltered = newFiltered.filter((product) => {
        if (!product.Category) return false;

        const productCategories = product.Category.split(',').map((cat) =>
          cat.trim().toLowerCase().replace(/\s+/g, '_')
        );

        return filters.category.some((selectedCat) =>
          productCategories.includes(selectedCat.toLowerCase())
        );
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

        const priceToCompare = getPriceFromFirstVariation(product);

        // If no valid price, exclude this product
        if (typeof priceToCompare !== 'number' || isNaN(priceToCompare)) {
          return false;
        }

        // Check if the price falls within any of the selected ranges
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
        if (!product.ProductForSkinTypes) return false;

        // Extract skin type IDs from product
        const productSkinTypeIds = product.ProductForSkinTypes.map(
          (item) => item.SkinTypeId
        );

        // Check if product matches the selected skin type
        return filters.skinType.some((selectedSkinTypeId) =>
          productSkinTypeIds.includes(Number(selectedSkinTypeId))
        );
      });
    }

    // Sort products based on the selected option
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
            // Use ProductId as a proxy for newness if PublishedDate isn't reliable
            return b.ProductId - a.ProductId;
          case 'Popular':
            return (b.AverageRating || 0) - (a.AverageRating || 0);
          default:
            return 0;
        }
      });
    }

    setFilteredProducts(newFiltered);
    setTotalProduct(newFiltered.length);
    setCurrentPage(1); // Reset to page 1 whenever filter/sort changes
  }, [products, filters, sortOption]);

  // Handle filters from URL parameters
  useEffect(() => {
    console.log('Location state:', location.state);

    // Handle skin type filter from URL
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

    // Handle category filter from URL
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

  // Handlers for filter and sort changes
  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
  };

  const handleSortChange = (option) => {
    console.log('Sort changed to:', option);
    setSortOption(option);
  };

  // Create the context value to pass to child components
  const loadingContextValue = {
    isLoading,
    categories,
    skinTypes,
    products,
  };

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
                {totalProduct} {totalProduct === 1 ? 'product' : 'products'}
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
