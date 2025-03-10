import styles from './ProductsPage.module.css';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Dropdown from '../../components/Dropdown/Dropdown';
import ProductList from '../../components/CardProduct/ProductList';
import Filters from '../../components/Filters/Filters';
import Pagination from '../../components/Pagination/Pagination';
import { fetchProducts } from '../../utils/api.js'
import { useState, useEffect } from 'react';
import LoadingPage from '../../Pages/LoadingPage/LoadingPage';




function ProductsPage() {
  const breadcrumbItems = [
    { label: 'Products', link: '/products', active: true },
  ];

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [filters, setFilters] = useState({
    category: [],
    priceRange: [],
    skinType: [],
  });
  const [loading, setLoading] = useState(true);

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
  const currentPageProducts = filteredProducts.slice(startIndex, endIndex);


  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        setFilteredProducts(data);
        setTotalProduct(data.length);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!products) return;

    let newFiltered = [...products];

    if (filters.category.length > 0) {
      newFiltered = newFiltered.filter((product) => {
        const splitted = product.Category
          .split(",")
          .map((cat) => cat.trim());
        return splitted.some((cat) => filters.category.includes(cat));
      });
    }


    // Lọc theo priceRange
    if (filters.priceRange.length > 0) {
      newFiltered = newFiltered.filter((product) => {
        if (!product.Variations || product.Variations.length === 0) {
          return false;
        }

        const firstVariation = product.Variations[0];

        const priceToCompare =
          firstVariation.SalePrice && firstVariation.SalePrice > 0
            ? firstVariation.SalePrice
            : firstVariation.Price;

        return filters.priceRange.some((range) => {
          switch (range) {
            case "under_25":
              return priceToCompare < 25;
            case "25_50":
              return priceToCompare >= 25 && priceToCompare < 50;
            case "50_100":
              return priceToCompare >= 50 && priceToCompare < 100;
            case "over_100":
              return priceToCompare >= 100;
            default:
              return true;
          }
        });
      });
    }

    if (filters.skinType.length > 0) {
      newFiltered = newFiltered.filter((product) => {
        if (!Array.isArray(product.ProductForSkinTypes) || product.ProductForSkinTypes.length === 0) {
          return false;
        }
        return product.ProductForSkinTypes.some((skinItem) =>
          filters.skinType.includes(skinItem.SkinTypeId)
        );
      });
    }


    switch (sortOption) {
      case "Newest":
        newFiltered.sort((a, b) => {
          const aId = Number(a.ProductId) || 0; // Nếu NaN => 0
          const bId = Number(b.ProductId) || 0; // Nếu NaN => 0
          return bId - aId;
        });
        break;





      case "Price Low to High":
        newFiltered.sort((a, b) => {
          const aPrice = a.Variations && a.Variations.length > 0
            ? Math.min(...a.Variations.map(v => v.Price))
            : Infinity; // hoặc 0, tuỳ logic
          const bPrice = b.Variations && b.Variations.length > 0
            ? Math.min(...b.Variations.map(v => v.Price))
            : Infinity;

          return aPrice - bPrice;
        });
        break;

      case "Price High to Low":
        newFiltered.sort((a, b) => {
          const aPrice = a.Variations && a.Variations.length > 0
            ? Math.min(...a.Variations.map(v => v.Price))
            : 0; // hoặc một giá trị mặc định phù hợp
          const bPrice = b.Variations && b.Variations.length > 0
            ? Math.min(...b.Variations.map(v => v.Price))
            : 0;
          return bPrice - aPrice;
        });
        break;

      default:
        // 'featured' => không sắp xếp đặc biệt
        break;
    }

    setFilteredProducts(newFiltered);
    setTotalProduct(newFiltered.length);
    setCurrentPage(1); // Reset về trang 1 mỗi khi filter/sort thay đổi

  }, [filters, products, sortOption]);


  // 5. Hàm nhận updatedFilters từ Filters
  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
  };

  if (loading) {
    return <LoadingPage />;
  }


  return (

    <>
      <Navbar />
      <div className={`mt-20 ${styles.productPage_container}`}>
        <div className="row">
          <div className="col-12 mb-3">
            <div className={`d-flex flex-column flex-md-row justify-content-between align-items-center ${styles.productPage_breadcrumb}`}>
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
              <div className={`fw-bold ${styles.totalProducts}`}>{totalProduct} products</div>
              <div className={styles.sortByFeature}>
                <Dropdown onSortChange={handleSortChange} sortOption={sortOption} />
              </div>
            </div>

            <ProductList products={currentPageProducts} loading={loading} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
export default ProductsPage;
