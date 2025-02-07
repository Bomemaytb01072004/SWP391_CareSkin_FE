import React from "react";
import { Star } from "lucide-react";

function CardProduct({ product }) {
  return (
    <div className="relative m-4 flex w-full max-w-md flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md">
      <a
        className="relative mx-3 mt-3 flex h-[300px] w-[300px] overflow-hidden rounded-xl"
        href="#"
      >
        <img
          className="w-full h-full object-cover"
          src={product.image}
          alt={product.name}
        />
        {product.discount && (
          <span className="absolute top-0 left-0 m-2 rounded-full bg-black px-2 text-center text-sm font-medium text-white">
            {product.discount} OFF
          </span>
        )}
      </a>
      <div className="mt-4 px-5 pb-5">
        <a href="#">
          <h5 className="text-xl tracking-tight text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
            {product.name}
          </h5>
        </a>
        <div className="mt-2 mb-5 flex items-center justify-between">
          <p>
            <span className="text-3xl font-bold text-slate-900">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-slate-900 line-through">
                ${product.originalPrice}
              </span>
            )}
          </p>
          <div className="flex items-center">
            <span className="flex items-center gap-1 mr-2 ml-3 rounded px-2.5 py-0.5 text-xs font-semibold">
              {product.rating || "0.0"}
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
            </span>
          </div>
        </div>
        <a
          href="#"
          className="flex items-center justify-center rounded-md bg-[#059669] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-200 hover:text-black focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Add to cart
        </a>
      </div>
    </div>
  );
}

export default CardProduct;
