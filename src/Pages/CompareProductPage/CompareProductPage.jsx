import React from "react";
import { useState, useEffect} from 'react'
import styles from "./CompareProductPage.module.css";
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { fetchProducts } from "../../utils/api";



function CompareProduct() {
    const breadcrumbItems = [
        { label: "Compare Products", link: "/compare", active: true },
    ];

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts()
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <>
            <Navbar />
            <Breadcrumb items={breadcrumbItems} />
            <div className={styles.compareProduct}>

                <div className={styles.body}>

                    {/* PHẦN HIỂN THỊ SẢN PHẨM VÀ BẢNG SO SÁNH */}
                    <div className={styles.div24}>
                        {/* Hai sản phẩm */}
                        <div className={styles.div25}>
                            {/* Sản phẩm 1 */}
                            <div className={styles.div26}>
                                <div className={styles.div27}>
                                    <img className={styles.img} src="img0.png" alt="Product 1" />
                                    <div className={styles.span}>
                                        <div className={styles.bestSeller}>Best Seller</div>
                                    </div>
                                </div>
                                <div className={styles.div28}>
                                    <div className={styles.hydratingFaceCream}>Hydrating Face Cream</div>
                                    <div className={styles.advancedMoistureComplex}>Advanced Moisture Complex</div>
                                    <div className={styles.div29}>
                                        <div className={styles.div30}>
                                            <div className={styles.frame15}>
                                                <img className={styles.frame16} src="frame17.svg" alt="..." />
                                            </div>
                                            <div className={styles.frame17}>
                                                <img className={styles.frame18} src="frame19.svg" alt="..." />
                                            </div>
                                            <div className={styles.frame19}>
                                                <img className={styles.frame20} src="frame21.svg" alt="..." />
                                            </div>
                                            <div className={styles.frame21}>
                                                <img className={styles.frame22} src="frame23.svg" alt="..." />
                                            </div>
                                            <div className={styles.frame23}>
                                                <img className={styles.frame24} src="frame25.svg" alt="..." />
                                            </div>
                                        </div>
                                        <div className={styles.one28}>(128)</div>
                                    </div>
                                    <div className={styles.four999}>$49.99</div>
                                </div>
                            </div>

                            {/* Sản phẩm 2 */}
                            <div className={styles.div31}>
                                <div className={styles.div32}>
                                    <img className={styles.img2} src="img1.png" alt="Product 2" />
                                    <div className={styles.span2}>
                                        <div className={styles.new}>New</div>
                                    </div>
                                </div>
                                <div className={styles.div33}>
                                    <div className={styles.vitaminCSerum}>Vitamin C Serum</div>
                                    <div className={styles.brighteningFormula}>Brightening Formula</div>
                                    <div className={styles.div34}>
                                        <div className={styles.div35}>
                                            <div className={styles.frame25}>
                                                <img className={styles.frame26} src="frame27.svg" alt="..." />
                                            </div>
                                            <div className={styles.frame27}>
                                                <img className={styles.frame28} src="frame29.svg" alt="..." />
                                            </div>
                                            <div className={styles.frame29}>
                                                <img className={styles.frame30} src="frame31.svg" alt="..." />
                                            </div>
                                            <div className={styles.frame31}>
                                                <img className={styles.frame32} src="frame33.svg" alt="..." />
                                            </div>
                                            <div className={styles.frame33}>
                                                <img className={styles.frame34} src="frame35.svg" alt="..." />
                                            </div>
                                        </div>
                                        <div className={styles.nine6}>(96)</div>
                                    </div>
                                    <div className={styles.five999}>$59.99</div>
                                </div>
                            </div>
                        </div>

                        {/* Bảng so sánh */}
                        <div className={styles.div36}>
                            <div className={styles.thead}>
                                <div className={styles.tr}>
                                    <div className={styles.th}>
                                        <div className={styles.hydratingFaceCream2}>Hydrating Face Cream</div>
                                    </div>
                                </div>
                                <div className={styles.th2}>
                                    <div className={styles.vitaminCSerum2}>Vitamin C Serum</div>
                                </div>
                            </div>
                            <div className={styles.table}>
                                <div className={styles.tbody}>
                                    <div className={styles.tr2}>
                                        <div className={styles.td}>
                                            <div className={styles.five0Ml}>50ml</div>
                                        </div>
                                        <div className={styles.td2}>
                                            <div className={styles.three0Ml}>30ml</div>
                                        </div>
                                    </div>
                                    <div className={styles.tr3}>
                                        <div className={styles.td3}>
                                            <div className={styles.allSkinTypes}>All Skin Types</div>
                                        </div>
                                        <div className={styles.td4}>
                                            <div className={styles.normalToOily}>Normal to Oily</div>
                                        </div>
                                    </div>
                                    <div className={styles.tr3}>
                                        <div className={styles.td3}>
                                            <div className={styles.hyaluronicAcidCeramides}>Hyaluronic Acid, Ceramides</div>
                                        </div>
                                        <div className={styles.td4}>
                                            <div className={styles.vitaminCFerulicAcid}>Vitamin C, Ferulic Acid</div>
                                        </div>
                                    </div>
                                    <div className={styles.tr3}>
                                        <div className={styles.td3}>
                                            <div className={styles.hydrationBarrierRepair}>Hydration, Barrier Repair</div>
                                        </div>
                                        <div className={styles.td4}>
                                            <div className={styles.brighteningAntioxidant}>Brightening, Antioxidant</div>
                                        </div>
                                    </div>
                                    <div className={styles.tr3}>
                                        <div className={styles.td}>
                                            <div className={styles.amPm}>AM/PM</div>
                                        </div>
                                        <div className={styles.td2}>
                                            <div className={styles.am}>AM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Kết thúc Bảng so sánh */}
                    </div>
                    {/* Kết thúc Compare Section */}

                </div>
            </div>
            <Footer />
        </>
    );
}

export default CompareProduct;
