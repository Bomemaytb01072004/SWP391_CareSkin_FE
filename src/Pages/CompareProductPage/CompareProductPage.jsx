import React, { useState, useEffect } from "react";
import Navbar from "../../components/Layout/Navbar";
import Footer from "../../components/Layout/Footer";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { fetchProductById } from "../../utils/api";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import styles from "./CompareProductPage.module.css";
import LoadingPage from '../LoadingPage/LoadingPage'
import { Link, useParams, useSearchParams } from "react-router-dom";



function CompareProduct() {
    const breadcrumbItems = [
        { label: "Compare", link: "/compare", active: true },
    ];

    const { product1, product2 } = useParams();
    const [searchParams] = useSearchParams();
    const [listIdCompare, setListIdCompare] = useState([product1.split("-")[0], product2.split("-")[0]]);
    useEffect ( () => {
        let cache_listIdCompare = listIdCompare;
        if (searchParams.get('product_id')){
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
                if (!listIdCompare.length > 1){
                    return;
                }
                for (let id of listIdCompare) {
                    const res = await fetchProductById(id);
                    listProduct.push(res);
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

    return (
        <>
            <Navbar />


            <div className={`container my-20  ${styles.compareProduct}`}>


                <div className="row mt-4 mb-3">
                    <div className="col-12 ">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                    <div className="col-12">
                        <h2 className="text-center"></h2>
                    </div>
                </div>

                <div className="row g-4">


                    {products.map((product) => (
                        <div className={`col-12 col-sm-6 col-md-${colSize}`} key={product.id}>
                            <div className="card shadow-md rounded-3xl h-100">

                                <div className="position-relative">
                                    <img
                                        src={
                                            product.image
                                        }
                                        className="card-img-top sm:w-80"
                                        alt={product.name}
                                    />
                                    {product.tag && (
                                        <span
                                            className="position-absolute top-0 start-0 badge bg-danger"
                                            style={{ margin: "8px" }}
                                        >
                                            {product.tag}
                                        </span>
                                    )}
                                </div>
                                <div className="card-body text-center">
                                    <Link to={`/product/${product.id}`}>
                                        <h5 className={`${styles.textTruncate} ${styles.nameProductTitle}`}>
                                            {product.name}
                                        </h5>
                                    </Link>
                                    <p className={` ${styles.priceProductCompare}`}>
                                        ${product.price}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`row mt-5 ${styles.compareTableContainer}`}>
                    <div className="col-12">
                        <div className="table-responsive">
                            <table
                                className={`table table-bordered text-center align-middle ${styles.customTable}`}
                            >
                                <thead className="table-light">
                                    <tr>
                                        <th className="fw-bold fs-5">Properties</th>
                                        {products.map((product) => (
                                            <th key={product.id} className="fw-bold fs-5">
                                                {product.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Category</td>
                                        {products.map((product) => (
                                            <td key={product.id}>{product.category}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td>Skin Type</td>
                                        {products.map((product) => (
                                            <td key={product.id}>{product.skinType}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td>Key Ingredients</td>
                                        {products.map((product) => (
                                            <td key={product.id}>{product.ingredients}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td>Benefits</td>
                                        {products.map((product) => (
                                            <td key={product.id}>{product.benefits}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td>Usage</td>
                                        {products.map((product) => (
                                            <td key={product.id}>{product.usage}</td>
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
