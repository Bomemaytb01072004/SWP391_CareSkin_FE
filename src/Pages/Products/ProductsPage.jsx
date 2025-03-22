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
import { useState, useEffect, useMemo, createContext } from 'react';
import LoadingPage from '../../Pages/LoadingPage/LoadingPage';
import { useLocation } from 'react-router-dom';

// Create context to share loading state with child components
export const LoadingContext = createContext({
  isLoading: true,
  categories: [],
  skinTypes: [],
  products: []
});

function ProductsPage() {
  const breadcrumbItems = [
    { label: 'Products', link: '/products', active: true },
  ];

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skinTypes, setSkinTypes] = useState([]);
  const location = useLocation();

  // Đặt mặc định "" hoặc "Price: Low to High" tuỳ nhu cầu
  const [sortOption, setSortOption] = useState('');

  const [filters, setFilters] = useState({
    category: [],
    priceRange: [],
    skinType: [],
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch categories
  useEffect(() => {
    (async () => {
      try {
        setLoadingCategories(true);
        const data = await fetchCategoriesFromActiveProducts();
        const splittedCategories = data.flatMap((item) =>
          item.split(',').map((str) => str.trim())
        );
        const uniqueCategories = Array.from(new Set(splittedCategories));

        const mappedCategories = uniqueCategories.map((cat) => {
          const capitalizedLabel =
            cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
          return {
            label: capitalizedLabel,
            value: capitalizedLabel.replace(/\s+/g, '_'),
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

  // Fetch skin types (chỉ lấy IsActive = true)
  useEffect(() => {
    (async () => {
      try {
        setLoadingSkinTypes(true);
        const data = await fetchSkinTypeProduct();
        const activeSkinTypes = data.filter((item) => item.IsActive === true);

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
    })();
  }, []);

  // Nếu đến từ New Arrivals, tự set sort = "Newest"
  useEffect(() => {
    if (location.state?.fromNewArrivals) {
      setSortOption('Newest');
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
        if (!product.Variations || product.Variations.length === 0) {
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

  // Hàm nhận updatedFilters từ Filters
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
    products
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
            <Filters onFilterChange={handleFilterChange} />
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