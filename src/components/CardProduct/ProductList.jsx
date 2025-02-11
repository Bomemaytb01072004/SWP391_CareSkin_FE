import React, { useEffect, useState } from "react";
import CardProduct from "./CardProduct";
import { fetchProducts } from "../../utils/api";
import LoadingPage from "../../Pages/LoadingPage/LoadingPage";


const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error in ProductsPage:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // <= Mảng phụ thuộc

  if (loading) {
    return <LoadingPage />;
  }
  

  return (
    <div className="mx-auto p-2">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {products.map((product) => (
          <CardProduct key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
