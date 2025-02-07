import React from 'react';
import './Breadcrumb.css'

function Breadcrumb() {
    return (
        <>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="/">Home</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Products</li>
                </ol>
            </nav>

        </>
    );
};

export default Breadcrumb;