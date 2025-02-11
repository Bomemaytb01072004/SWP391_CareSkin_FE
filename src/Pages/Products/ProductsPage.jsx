import styles from './ProductsPage.module.css';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Dropdown from '../../components/Dropdown/Dropdown';
import ProductList from '../../components/CardProduct/ProductList';
import Filters from '../../components/Filters/Filters';
import Pagination from '../../components/Pagination/Pagination';



function ProductsPage() {

  const breadcrumbItems = [
    { label: 'Products', link: '/products', active: true },
  ];
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
            <Filters />
          </div>

          <div className={`col-12 col-md-8 col-lg-9 ${styles.div11}`}>
            <div className={`d-flex align-items-center mb-3 ${styles.div12}`}>
              <div className={`fw-bold ${styles.totalProducts}`}>124 products</div>
              <div className={styles.sortByFeature}>
                <Dropdown />
              </div>
            </div>

            <ProductList />
            <Pagination />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
export default ProductsPage;
