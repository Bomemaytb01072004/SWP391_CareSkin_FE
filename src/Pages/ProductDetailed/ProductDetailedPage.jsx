import React, { useEffect, useState } from "react";
import { fetchProductById } from "../../utils/api";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from "./ProductDetailedPage.module.css";
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import LoadingPage from '../LoadingPage/LoadingPage'

import {
    faTruckFast,
    faArrowRotateLeft,
    faCreditCard,
    faCodeCompare
} from '@fortawesome/free-solid-svg-icons';
import "bootstrap/dist/css/bootstrap-grid.min.css";

function ProductDetailedPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const breadcrumbItems = [
        { label: "Products", link: "/products", active: true },
    ];

    useEffect(() => {
        const getProduct = async () => {
            try {
                setLoading(true);
                const data = await fetchProductById(id);
                console.log("Fetched Product:", data);
                setProduct(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        getProduct();
    }, [id]);

    if (loading) {
        return (
            <>
               <LoadingPage />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Navbar />
                <div style={{ textAlign: "center", margin: "50px" }}>
                    <h2>Not Found Product</h2>
                </div>
                <Footer />
            </>
        );
    }
    return (
        <>
            <Navbar />

            <div className={`container ${styles.detailedProduct}`}>
                <div className="row">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="col-lg-6 col-md-9 col-sm-12 text-center">
                        <div className={styles.productImages}>
                            <img
                                className={styles.img}
                                src={product.image}
                                alt={product.name}
                            />

                            <div className="d-flex justify-content-center flex-wrap mt-3">
                                <img
                                    className={`${styles.thumbnail} mx-2`}
                                    src={product.image}
                                    alt="Thumbnail"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-12">
                        <div className={styles.productInfo}>
                            <h1 className={styles.productTitle}>{product.name}</h1>
                            <div className={styles.reviews}>
                                ({product.reviews || 0} reviews)
                            </div>
                            <div className={styles.price}>${product.price}</div>
                            <p className={styles.description}>{product.description}</p>

                            <ul className={styles.keyBenefits}>
                                <li>Reduces fine lines and wrinkles</li>
                                <li>Improves skin elasticity</li>
                            </ul>

                            <div className="d-flex align-items-center my-3">
                                <span className="fw-bold me-2">Size:</span>
                                {["30ml", "50ml", "100ml"].map((size, index) => (
                                    <button
                                        key={index}
                                        className={`btn btn-outline-primary mx-2 ${styles.sizeButton}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>

                            <div className={`d-flex align-items-center my-2 ${styles.quantitySelection}`}>
                                <div className={styles.quantityGroupFirst}>
                                    <button className={styles.quantityCount}>-</button>
                                    <span>1</span>
                                    <button className={styles.quantityCount}>+</button>
                                </div>
                                <button className={styles.addToCart}>Add to Cart</button>
                                <button className={styles.quantityCompare}>
                                    <FontAwesomeIcon icon={faCodeCompare} />
                                </button>
                            </div>

                            <hr />

                            <div className={`d-flex justify-normal my-2 ${styles.purchaseInfo}`}>
                                <span>
                                    <FontAwesomeIcon icon={faTruckFast} className="me-2" />
                                    Free Shipping
                                </span>
                                <span>
                                    <FontAwesomeIcon icon={faArrowRotateLeft} className="me-2" />
                                    30-Day Returns
                                </span>
                                <span>
                                    <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                                    Secure Payment
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}

export default ProductDetailedPage;
