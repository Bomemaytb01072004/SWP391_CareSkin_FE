import styles from "./ProductsPage.module.css";
import Navbar from '../../components/Navbar/Navbar';
import Footer from "../../components/Layout/Footer";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Dropdown from "../../components/Dropdown/Dropdown";
import ProductList from "../../components/CardProduct/ProductList";
import Filters from "../../components/Filters/Filters";
import Pagination from '../../components/Pagination/Pagination'


function ProductsPage() {
  return (
    <>
      <Navbar />
      <div className={styles.productPage_container}>
        <div className={styles.body}>
          <div className={styles.productPage_mainGroup}>
            <div className={styles.productPage_breadcrumb}>
              <Breadcrumb />
            </div>
            <div className={styles.productPage_secondGroup}>
              <div className={styles.productPage_sidebar}>
                <div className={styles.div6}>
                  <Filters />
                </div>
              </div>
              <div className={styles.div11}>
                <div className={styles.div12}>
                  <div className={styles.div13}>
                    <div className={styles.totalProducts}>
                      124 products{" "}
                    </div>
                  </div>
                  <div className={styles.sortByFeature}>
                    <Dropdown />
                  </div>
                </div>
                <ProductList />
                <Pagination />
              </div>
            </div>
            <div className={styles.productPage_searchBar}>
              <div className={styles.input2}>
                <div className={styles.searchProducts}>
                  Search products...{" "}
                </div>
              </div>
              <div className={styles.frame13}>
                <img className={styles.frame14} src="https://upload.wikimedia.org/wikipedia/commons/5/55/Magnifying_glass_icon.svg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};
export default ProductsPage;
