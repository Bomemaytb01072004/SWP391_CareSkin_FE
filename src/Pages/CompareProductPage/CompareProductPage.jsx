import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { fetchProductById } from '../../utils/api';
import { generateProductSlug } from '../../utils/urlUtils'; // Add this import
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import styles from './CompareProductPage.module.css';
import LoadingPage from '../LoadingPage/LoadingPage';
import { Link, useParams, useSearchParams } from 'react-router-dom';

function CompareProduct() {
  const breadcrumbItems = [
    { label: 'Compare Products', link: '/compare', active: true },
  ];

  const { product1, product2 } = useParams();
  const [searchParams] = useSearchParams();
  const [listIdCompare, setListIdCompare] = useState([
    product1.split('-')[0],
    product2.split('-')[0],
  ]);
  useEffect(() => {
    let cache_listIdCompare = listIdCompare;
    if (searchParams.get('product_id')) {
      cache_listIdCompare[2] = searchParams.get('product_id');
    }
    setListIdCompare(cache_listIdCompare);
  }, [searchParams]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const listProduct = [];
        if (!listIdCompare.length > 1) {
          return;
        }
        for (let id of listIdCompare) {
          const res = await fetchProductById(id);
          // Only add the product if it's active
          if (res.IsActive) {
            listProduct.push(res);
          }
        }
        setProducts(listProduct);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [listIdCompare]);

  if (loading) return <LoadingPage />;
  if (error) return <p>Error: {error.message}</p>;

  if (products.length < 2) {
    return <p>Not enough products to compare</p>;
  }

  const colSize = products.length === 2 ? 6 : 4;
  const isTwoProducts = products.length === 2;

  return (
    <>
      <Navbar />

      <div className="container py-4 py-md-5">
        <div
          className={`${styles.compareProduct} ${isTwoProducts ? styles.twoProductsContainer : ''}`}
        >
          <div className="row mt-4 mb-4">
            <div className="col-12">
              <Breadcrumb items={breadcrumbItems} />
            </div>
            {/* <div className="col-12">
              <h2 className="text-center mb-4">Product Comparison</h2>
            </div> */}
          </div>

          <div
            className={`row g-4 ${isTwoProducts ? styles.twoProductsRow : ''}`}
          >
            {products.map((product) => (
              <div
                className={`col-12 col-sm-6 col-md-${colSize}`}
                key={product.ProductId}
              >
                <div className={`card shadow ${styles.productCard}`}>
                  <div className={styles.productImageContainer}>
                    <img
                      src={product.PictureUrl}
                      className={styles.productImage}
                      alt={product.ProductName}
                      loading="lazy"
                    />
                    {product.PromotionProducts &&
                      product.PromotionProducts.length > 0 &&
                      product.PromotionProducts[0].DiscountPercent && (
                        <span className={styles.discountBadge}>
                          {product.PromotionProducts[0].DiscountPercent}% OFF
                        </span>
                      )}
                  </div>
                  <div className={styles.cardBody}>
                    <div>
                      <Link to={`/product/${generateProductSlug(product)}`}>
                        <h5 className={styles.nameProductTitle}>
                          {product.ProductName}
                        </h5>
                      </Link>
                    </div>
                    <div>
                      <p className={styles.priceProductCompare}>
                        {product.Variations[0].SalePrice !== 0 && (
                          <span className="text-xl">
                            ${product.Variations[0].SalePrice.toFixed(2)}
                          </span>
                        )}
                        {product.Variations[0].SalePrice !== 0 && (
                          <span className="text-sm line-through ml-2">
                            ${product.Variations[0].Price.toFixed(2)}
                          </span>
                        )}
                        {product.Variations[0].SalePrice === 0 && (
                          <span className="text-xl">
                            ${product.Variations[0].Price.toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className={`${styles.compareTableContainer} ${isTwoProducts ? styles.twoProductsTable : ''}`}
          >
            <div className="table-responsive">
              <table className={`table ${styles.customTable}`}>
                <thead>
                  <tr>
                    <th>Properties</th>
                    {products.map((product) => (
                      <th key={product.ProductId} title={product.ProductName}>
                        {product.ProductName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Category</td>
                    {products.map((product) => (
                      <td key={product.ProductId}>{product.Category}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Skin Type</td>
                    {products.map((product) => (
                      <td key={product.ProductId}>
                        {product.ProductForSkinTypes &&
                        product.ProductForSkinTypes.length > 0 ? (
                          <ul className="m-0">
                            {product.ProductForSkinTypes.map(
                              (skinType, index) => (
                                <li key={index}>{skinType.TypeName}</li>
                              )
                            )}
                          </ul>
                        ) : (
                          'Not specified'
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Key Ingredients</td>
                    {products.map((product) => (
                      <td key={product.ProductId}>
                        {product.MainIngredients &&
                        product.MainIngredients.length > 0 ? (
                          <ul className="m-0">
                            {product.MainIngredients.map(
                              (ingredient, index) => (
                                <li key={index}>{ingredient.IngredientName}</li>
                              )
                            )}
                          </ul>
                        ) : (
                          'Not specified'
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Full Ingredients</td>
                    {products.map((product) => (
                      <td key={product.ProductId}>
                        {product.DetailIngredients[0].IngredientName}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Usage</td>
                    {products.map((product) => (
                      <td key={product.ProductId}>
                        {product.Usages[0].Instruction}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default CompareProduct;
