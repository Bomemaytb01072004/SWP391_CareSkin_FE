import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // Default Unselected
  const shippingCost = 5.0; // $5 shipping
  const taxRate = 0.1; // 10% tax
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];

    // Merge duplicate items (Stack together)
    const mergedCart = storedCart.reduce((acc, item) => {
      const existingItem = acc.find((i) => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity || 1;
      } else {
        acc.push({ ...item, quantity: item.quantity || 1 });
      }
      return acc;
    }, []);

    setCart(mergedCart);
  }, []);

  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    setSelectedItems(selectedItems.filter((itemId) => itemId !== id));

    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Dispatch an event to notify Navbar to update the cart badge
    window.dispatchEvent(new Event('storage'));
  };

  const handleQuantityChange = (id, newQuantity) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
    );

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Dispatch an event to notify Navbar to update the cart badge
    window.dispatchEvent(new Event('storage'));
  };

  const handleCheckboxChange = (id) => {
    let updatedSelected;
    if (selectedItems.includes(id)) {
      updatedSelected = selectedItems.filter((itemId) => itemId !== id);
    } else {
      updatedSelected = [...selectedItems, id];
    }
    setSelectedItems(updatedSelected);

    // Save selected items to localStorage
    localStorage.setItem('selectedItems', JSON.stringify(updatedSelected));
  };

  const handleSelectAll = () => {
    let updatedSelected;
    if (selectedItems.length === cart.length) {
      updatedSelected = [];
    } else {
      updatedSelected = cart.map((item) => item.id);
    }
    setSelectedItems(updatedSelected);

    // Save selected items to localStorage
    localStorage.setItem('selectedItems', JSON.stringify(updatedSelected));
  };

  const removeSelectedItems = () => {
    const updatedCart = cart.filter((item) => !selectedItems.includes(item.id));
    setCart(updatedCart);
    setSelectedItems([]);

    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Dispatch an event to notify Navbar to update the cart badge
    window.dispatchEvent(new Event('storage'));
  };

  const proceedToCheckout = () => {
    const selectedProducts = cart.filter((item) =>
      selectedItems.includes(item.id)
    );

    if (selectedProducts.length > 0) {
      localStorage.setItem('checkoutItems', JSON.stringify(selectedProducts));
      navigate('/checkout'); // Navigate to checkout page
    }
  };

  const selectedProducts = cart.filter((item) =>
    selectedItems.includes(item.id)
  );
  const subtotal = selectedProducts.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );
  const tax = subtotal * taxRate;
  const total = subtotal + tax + (subtotal > 0 ? shippingCost : 0);
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-6 mt-36">
        {/* Cart Items Section */}
        <div className="md:w-3/4 bg-white p-4 shadow-md rounded-lg h-[700px]">
          {/* Shopping Cart Title */}{' '}
          <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>{' '}
          <p className="text-gray-600 text-sm mt-1">
            {' '}
            Selected Items: {selectedItems.length}{' '}
          </p>{' '}
          {/* Select All & Remove Selected - Left Aligned */}{' '}
          <div className="flex justify-end items-center gap-4">
            {' '}
            {/* Remove Selected Button (Next to Select All) */}{' '}
            {selectedItems.length > 1 && (
              <button
                onClick={removeSelectedItems}
                className="text-red-500 hover:text-red-700 text-sm border px-3 py-1 rounded-md bg-gray-100 hover:bg-red-100 transition"
              >
                {' '}
                Remove Selected{' '}
              </button>
            )}{' '}
            {/* Select All Checkbox */}{' '}
            {cart.length > 0 && (
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                {' '}
                <input
                  type="checkbox"
                  checked={selectedItems.length === cart.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-emerald-500 border-2 border-gray-400 rounded-md "
                />{' '}
                Select All{' '}
              </label>
            )}{' '}
          </div>
          {cart.length === 0 ? (
            <p className="text-gray-600 text-center mt-16">
              Your cart is empty.
            </p>
          ) : (
            <div className="mt-4 space-y-4 overflow-y-auto max-h-[545px] pr-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center bg-white shadow-sm p-4 rounded-xl border relative w-full"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleCheckboxChange(item.id)}
                    className="w-4 h-4 cursor-pointer accent-emerald-500 border-2 border-gray-400 rounded-md "
                  />

                  {/* Product Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-28 object-cover ml-3 rounded-md border transform transition duration-300 ease-in-out hover:scale-150"
                  />

                  {/* Product Details */}
                  <div className="ml-4 flex-1">
                    <h3 className="text-base font-semibold w-64 text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {item.size || '50ml'}
                    </p>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>

                    <input
                      type="number"
                      value={item.quantity || 1}
                      min="1"
                      className="w-12 text-center text-gray-700 border-x outline-none"
                      onChange={(e) => {
                        let value = parseInt(e.target.value);
                        if (isNaN(value) || value < 1) value = 1;
                        handleQuantityChange(item.id, value);
                      }}
                    />

                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <p className="text-gray-800 font-semibold text-sm text-right ml-10 w-12">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>

                  {/* Remove Button */}
                  <button
                    className="text-red-500 hover:text-red-700 text-sm ml-6 transition"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="md:w-1/4 bg-white mt-2 p-6 shadow-md rounded-lg max-h-96">
          <h3 className="text-xl font-semibold text-gray-800">Order Summary</h3>
          <div className="mt-3 space-y-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>${subtotal > 0 ? shippingCost.toFixed(2) : '0.00'}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-800 font-semibold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            className={`w-full mt-12 py-3 text-white font-semibold rounded-md shadow-md ${
              selectedItems.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={selectedItems.length === 0}
            onClick={proceedToCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
