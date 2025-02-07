import React, { useEffect, useState } from "react";
import CardProduct from "./CardProduct";
import LoadingPage from '../../Pages/LoadingPage/LoadingPage'

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); 

  const apiURL = "https://679897e2be2191d708b02aab.mockapi.io/api/products/Products";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(apiURL);
        const data = await response.json();
        setProducts(data);
        setLoading(false); 
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiURL]);

  if (loading) {
    return <LoadingPage />
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {products.map((product) => (
          <CardProduct key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
