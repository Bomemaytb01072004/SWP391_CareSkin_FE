import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';

const CartPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const CustomerId = localStorage.getItem('CustomerId');

  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState(() => {
    return JSON.parse(localStorage.getItem('selectedItems')) || [];
  });
  const shippingCost = 5.0; // $5 shipping
  const taxRate = 0.1; // 10% tax
  useEffect(() => {
    // Remove selected items that are no longer in the cart
    setSelectedItems((prevSelected) =>
      prevSelected.filter((id) => cart.some((item) => item.ProductId === id))
    );
  }, [cart]);

  useEffect(() => {
    const fetchCart = async () => {
      if (CustomerId) {
        try {
          const response = await fetch(
            `http://careskinbeauty.shop:4456/api/Cart/customer/${CustomerId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!response.ok) {
            throw new Error(
              `Error fetching cart from server: ${response.status}`
            );
          }

          const cartData = await response.json();

          // ✅ Directly use API response (no extra request needed)
          setCart(cartData);
        } catch (error) {
          console.error('Error fetching cart from server:', error);
        }
      } else {
        // ✅ Load cart from localStorage for guest users
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];

        // ✅ Merge duplicates in guest cart
        const mergedCart = storedCart.reduce((acc, item) => {
          const existingItem = acc.find((i) => i.ProductId === item.ProductId);
          if (existingItem) {
            existingItem.Quantity += item.Quantity || 1;
          } else {
            acc.push({ ...item, Quantity: item.Quantity || 1 });
          }
          return acc;
        }, []);

        setCart(mergedCart);
      }
    };

    fetchCart();
  }, [CustomerId, token]);

  useEffect(() => {
    const updateCart = () => {
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(storedCart);
    };

    window.addEventListener('storage', updateCart);
    return () => window.removeEventListener('storage', updateCart);
  }, []);

  const removeFromCart = async (cartId, productId, productVariationId) => {
    const CustomerId = localStorage.getItem('CustomerId');
    const token = localStorage.getItem('token');

    // ✅ Part 1: Logged-in Users (Remove from API first)
    if (CustomerId && token) {
      try {
        console.log(`Removing CartId: ${cartId} from API...`);

        const response = await fetch(
          `http://careskinbeauty.shop:4456/api/Cart/remove/${cartId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to remove item (CartId: ${cartId})`);
        }

        console.log('Item removed from API successfully');

        // ✅ Remove from local state & sync localStorage as backup
        setCart((prevCart) => {
          const updatedCart = prevCart.filter((item) => item.CartId !== cartId);
          localStorage.setItem('cart', JSON.stringify(updatedCart));
          window.dispatchEvent(new Event('storage')); // Sync across components
          return updatedCart;
        });
      } catch (error) {
        console.error('Error removing item from cart:', error);
      }
      return; // Stop execution after API request
    }

    // ✅ Part 2: Guest Users (Remove from LocalStorage only)
    if (!productId || !productVariationId) {
      console.error(
        'Error: Missing productId or productVariationId for local cart removal.'
      );
      return;
    }

    console.log(
      `Removing ProductId: ${productId} and VariationId: ${productVariationId} from local cart`
    );

    setCart((prevCart) => {
      const updatedCart = prevCart.filter(
        (item) =>
          !(
            item.ProductId === productId &&
            item.ProductVariationId === productVariationId
          )
      );

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('storage')); // Ensure navbar updates
      return updatedCart;
    });
  };

  const handleQuantityChange = async (
    productId,
    newQuantity,
    productVariationId
  ) => {
    if (newQuantity < 1) return; // Prevent invalid quantity

    const cartItem = cart.find((item) => item.ProductId === productId);
    if (!cartItem) {
      console.error(`Cart item with ProductId ${productId} not found.`);
      return;
    }

    if (CustomerId) {
      try {
        const response = await fetch(
          `http://careskinbeauty.shop:4456/api/Cart/update`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              CustomerId: parseInt(CustomerId),
              ProductId: cartItem.ProductId,
              ProductVariationId:
                productVariationId ?? cartItem.ProductVariationId,
              Quantity: newQuantity,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to update quantity (ProductId: ${cartItem.ProductId})`
          );
        }

        // ✅ Update the cart state in React
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.ProductId === productId
              ? {
                  ...item,
                  Quantity: newQuantity,
                  ProductVariationId:
                    productVariationId ?? item.ProductVariationId,
                  Price:
                    cartItem.Variations.find(
                      (v) => v.ProductVariationId === productVariationId
                    )?.Price || item.Price,
                }
              : item
          )
        );
      } catch (error) {
        console.error('Error updating cart quantity:', error);
      }
    } else {
      // ✅ Guest users: update localStorage
      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) =>
          item.ProductId === productId
            ? {
                ...item,
                Quantity: newQuantity,
                ProductVariationId:
                  productVariationId ?? item.ProductVariationId,
                Price:
                  cartItem.Variations.find(
                    (v) => v.ProductVariationId === productVariationId
                  )?.Price || item.Price,
              }
            : item
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });

      window.dispatchEvent(new Event('storage'));
    }
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
      updatedSelected = cart.map((item) => item.ProductId);
    }
    setSelectedItems(updatedSelected);

    // Save selected items to localStorage
    localStorage.setItem('selectedItems', JSON.stringify(updatedSelected));
  };

  const removeSelectedItems = async () => {
    if (CustomerId) {
      try {
        const cartIdsToRemove = cart
          .filter((item) => selectedItems.includes(item.ProductId))
          .map((item) => item.CartId);

        if (cartIdsToRemove.length === 0) {
          console.warn('No valid cart items found for removal.');
          return;
        }

        // Perform batch delete requests
        const removeRequests = cartIdsToRemove.map((cartId) =>
          fetch(`http://careskinbeauty.shop:4456/api/Cart/remove/${cartId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        await Promise.all(removeRequests);

        // Update cart state after successful deletion
        setCart((prevCart) =>
          prevCart.filter((item) => !cartIdsToRemove.includes(item.CartId))
        );
        setSelectedItems([]); // Clear selected items in real time
      } catch (error) {
        console.error('Error removing selected items from cart:', error);
      }
    } else {
      // Guest user: remove selected items from localStorage
      const updatedCart = cart.filter(
        (item) => !selectedItems.includes(item.ProductId)
      );
      setCart(updatedCart);
      setSelectedItems([]); // Clear selected items in real time

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const proceedToCheckout = async () => {
    const selectedProducts = cart.filter((item) =>
      selectedItems.includes(item.ProductId)
    );

    if (selectedProducts.length === 0) {
      console.warn('No selected items for checkout.');
      return;
    }

    localStorage.setItem('checkoutItems', JSON.stringify(selectedProducts));

    // Guest user: remove selected items from localStorage only
    const updatedCart = cart.filter(
      (item) => !selectedItems.includes(item.ProductId)
    );
    setCart(updatedCart);
    setSelectedItems([]); // Clear selected items in real time

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));

    navigate('/checkout'); // Navigate to checkout page
  };

  const selectedProducts = cart.filter((item) =>
    selectedItems.includes(item.ProductId)
  );
  const originalTotal = selectedProducts.reduce((total, item) => {
    return total + (item.Price || 0) * (item.Quantity || 1);
  }, 0);

  const discountTotal = selectedProducts.reduce((total, item) => {
    const discount =
      item.SalePrice && item.SalePrice < item.Price
        ? (item.Price - item.SalePrice) * (item.Quantity || 1)
        : 0;
    return total + discount;
  }, 0);

  const totalOrder = selectedProducts.reduce((total, item) => {
    return total + (item.SalePrice || item.Price || 0) * (item.Quantity || 1);
  }, 0);

  return (
    <>
      <Navbar cart={cart} setCart={setCart} />
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
                  key={item.ProductId}
                  className="flex items-center bg-white shadow-sm p-4 rounded-xl border relative w-full"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.ProductId)}
                    onChange={() => handleCheckboxChange(item.ProductId)}
                    className="w-4 h-4 cursor-pointer accent-emerald-500 border-2 border-gray-400 rounded-md "
                  />

                  {/* Product Image */}
                  <img
                    src={item.PictureUrl}
                    alt={item.ProductName}
                    className="w-24 h-28 object-cover ml-3 rounded-md border transform transition duration-300 ease-in-out hover:scale-150"
                  />

                  {/* Product Details */}
                  <div className="ml-4 flex-1">
                    <h3 className="text-base font-semibold w-64 text-gray-800">
                      {item.ProductName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      <select
                        value={
                          item.ProductVariationId ||
                          item.ProductVariations?.[0]?.ProductVariationId
                        }
                        onChange={(e) => {
                          const newVariationId = parseInt(e.target.value);
                          const newVariation = item.ProductVariations?.find(
                            (v) => v.ProductVariationId === newVariationId
                          );

                          handleQuantityChange(
                            item.ProductId,
                            item.Quantity,
                            newVariationId,
                            newVariation?.SalePrice ?? newVariation?.Price // ✅ Use SalePrice if available
                          );
                        }}
                        className="border rounded px-2 py-1 text-gray-700"
                      >
                        {item.ProductVariations?.map(
                          (
                            variation // ✅ Safe optional chaining
                          ) => (
                            <option
                              key={variation.ProductVariationId}
                              value={variation.ProductVariationId}
                            >
                              {variation.Ml}ml
                            </option>
                          )
                        )}
                      </select>
                    </p>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.ProductId, item.Quantity - 1)
                      }
                      className="bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
                      disabled={(item.Quantity ?? 1) <= 1} // ✅ Prevents it from always being disabled
                    >
                      -
                    </button>

                    <input
                      type="number"
                      value={item.Quantity ?? 1} // ✅ Ensure Quantity is never undefined
                      min="1"
                      className="w-12 text-center text-gray-700 border-x outline-none"
                      onChange={(e) => {
                        let value = parseInt(e.target.value);
                        if (isNaN(value) || value < 1) value = 1;
                        handleQuantityChange(item.ProductId, value);
                      }}
                    />

                    <button
                      onClick={() =>
                        handleQuantityChange(item.ProductId, item.Quantity + 1)
                      }
                      className="bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>

                  {/* Price (Updated to Show SalePrice) */}
                  <p className="text-gray-800 font-semibold text-sm text-right ml-10 w-20">
                    $
                    {(
                      ((item.SalePrice ?? item.Price) || 0) *
                      (item.Quantity || 1)
                    ) // ✅ Uses SalePrice if available
                      .toFixed(2)}
                  </p>

                  {/* Remove Button */}
                  <button
                    className="text-red-500 hover:text-red-700 text-sm ml-6 transition"
                    onClick={() =>
                      removeFromCart(
                        item.CartId,
                        item.ProductId,
                        item.ProductVariationId
                      )
                    } // Updated to use CartId
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
              <span>Original Price</span>
              <span>${originalTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-500 font-semibold">
              <span>Discount</span>
              <span>-${discountTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-800 font-semibold text-lg">
              <span>Total</span>
              <span>${totalOrder.toFixed(2)}</span>
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
