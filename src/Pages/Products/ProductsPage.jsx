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
        setProducts(data);
        setFilteredProducts(data);
        setTotalProduct(data.length);
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
            // Change this to match exactly what HomePage is sending
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

        // Transform skin types into the format expected by Filters component
        const mappedSkinTypes = data.map((item) => {
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

  useEffect(() => {
    // Check if navigation state contains `fromNewArrivals`
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

  useEffect(() => {
    let newFiltered = [...products];

    // Filter by category
    if (filters.category.length > 0) {
      newFiltered = newFiltered.filter((product) => {
        if (!product.Category) return false;

        // Convert product categories to lowercase with underscores for comparison
        const productCategories = product.Category.split(',').map((cat) =>
          cat.trim().toLowerCase().replace(/\s+/g, '_')
        );

        // Compare directly with the filter values (which are already lowercase with underscores)
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

        // Get the first variation
        const firstVariation = product.Variations[0];

        // Determine the price to use for comparison (use SalePrice if available, otherwise regular Price)
        const priceToCompare =
          firstVariation.SalePrice && firstVariation.SalePrice > 0
            ? firstVariation.SalePrice
            : firstVariation.Price;

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

    console.log('Applying filters to products:', filters);

    // Sort products
    if (sortOption) {
      newFiltered = [...newFiltered].sort((a, b) => {
        switch (sortOption) {
          case 'Price: Low to High':
            return a.Price - b.Price;
          case 'Price: High to Low':
            return b.Price - a.Price;
          case 'Newest':
            return (
              new Date(b.PublishedDate || 0) - new Date(a.PublishedDate || 0)
            );
          case 'Popular':
            return (b.AvgRating || 0) - (a.AvgRating || 0);
          default:
            return 0;
        }
      });
    }

    setFilteredProducts(newFiltered);
    setTotalProduct(newFiltered.length);
    setCurrentPage(1); // Reset về trang 1 mỗi khi filter/sort thay đổi
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

  const handleSortChange = (option) => {
    setSortOption(option);
  };

  // Create the context value to pass to child components
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
