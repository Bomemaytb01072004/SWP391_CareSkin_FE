import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'; // Import Link component
import { toast } from 'react-toastify';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { generateProductSlug } from '../../utils/urlUtils';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const CartPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const CustomerId = localStorage.getItem('CustomerId');

  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState(() => {
    return JSON.parse(localStorage.getItem('selectedItems')) || [];
  });
  const [cartMergedFlag, setCartMergedFlag] = useState(
    localStorage.getItem('cartMerged') === 'true'
  );

  // Track if cart was already received from Navbar
  const [receivedFromNavbar, setReceivedFromNavbar] = useState(false);

  useEffect(() => {
    setSelectedItems((prevSelected) =>
      prevSelected.filter((id) => cart.some((item) => item.ProductId === id))
    );
  }, [cart]);

  useEffect(() => {
    console.log('Cart Data:', cart);
  }, [cart]);

  useEffect(() => {
    // Listen for cart updates from Navbar (primary source)
    const handleNavbarCartUpdate = (event) => {
      if (event.detail && event.detail.cart) {
        setCart(event.detail.cart);
        setReceivedFromNavbar(true); // Mark that we've received cart from Navbar
        console.log('Cart updated from Navbar:', event.detail.cart);
      }
    };

    // Attach event listener
    window.addEventListener('navbarCartUpdated', handleNavbarCartUpdate);

    // Initial cart fetch - only if not already received from Navbar
    const fetchInitialCart = async () => {
      // Skip fetching if we already have cart data from Navbar
      if (cart.length > 0 && receivedFromNavbar) {
        console.log('Using cart data from Navbar, skipping fetch');
        return;
      }

      if (CustomerId) {
        try {
          const response = await fetch(
            `${backendUrl}/api/Cart/customer/${CustomerId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!response.ok)
            throw new Error(`Error fetching cart: ${response.status}`);

          const cartData = await response.json();

          // Process cart data consistently with Navbar
          const updatedCart = cartData.map((item) => ({
            ...item,
            ProductVariations: Array.isArray(item.ProductVariations)
              ? item.ProductVariations
              : [],
            SalePrice:
              item.ProductVariations?.find(
                (v) => v.ProductVariationId === item.ProductVariationId
              )?.SalePrice ?? item.Price,
          }));

          setCart(updatedCart);
        } catch (error) {
          console.error('Error fetching cart from server:', error);
          setCart([]);
        }
      } else {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(storedCart);
      }
    };

    fetchInitialCart();

    // Cleanup
    return () => {
      window.removeEventListener('navbarCartUpdated', handleNavbarCartUpdate);
    };
  }, [CustomerId, token, cart.length, receivedFromNavbar]);

  // Add this helper function to trigger the cart refresh in Navbar
  const triggerNavbarCartRefresh = () => {
    // Dispatch a custom event to notify other components (especially Navbar)
    window.dispatchEvent(new Event('cartUpdated'));
    console.log('Cart action completed - triggered Navbar refresh');
  };

  const removeFromCart = async (cartId, productId, productVariationId) => {
    const CustomerId = localStorage.getItem('CustomerId');
    const token = localStorage.getItem('token');

    // Part 1: Logged-in Users (Remove from API first)
    if (CustomerId && token) {
      try {
        console.log(`Removing CartId: ${cartId} from API...`);

        const response = await fetch(
          `${backendUrl}/api/Cart/remove/${cartId}`,
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

        // Remove from local state & sync localStorage as backup
        setCart((prevCart) => {
          const updatedCart = prevCart.filter((item) => item.CartId !== cartId);
          localStorage.setItem('cart', JSON.stringify(updatedCart));
          window.dispatchEvent(new Event('storage')); // Sync across components
          return updatedCart;
        });

        // Trigger Navbar refresh
        triggerNavbarCartRefresh();
      } catch (error) {
        console.error('Error removing item from cart:', error);
      }
      return; // Stop execution after API request
    }

    // Part 2: Guest Users (Remove from LocalStorage only)
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

    // Trigger Navbar refresh
    triggerNavbarCartRefresh();
  };

  useEffect(() => {
    const updateCart = () => {
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(storedCart);
    };

    window.addEventListener('storage', updateCart);
    return () => window.removeEventListener('storage', updateCart);
  }, []);

  const handleQuantityChange = async (
    productId,
    newQuantity,
    productVariationId
  ) => {
    if (newQuantity < 1) return;

    const cartItem = cart.find((item) => item.ProductId === productId);
    if (!cartItem) {
      console.error(`Cart item with ProductId ${productId} not found.`);
      return;
    }

    if (CustomerId) {
      try {
        const response = await fetch(`${backendUrl}/api/Cart/update`, {
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
        });

        if (!response.ok)
          throw new Error(
            `Failed to update quantity (ProductId: ${cartItem.ProductId})`
          );

        // Ensure ProductVariations exists before calling `.find()`
        const updatedCart = cart.map((item) =>
          item.ProductId === productId
            ? {
                ...item,
                Quantity: newQuantity,
                ProductVariationId:
                  productVariationId ?? item.ProductVariationId,
                Price:
                  item.ProductVariations?.find(
                    (v) => v.ProductVariationId === productVariationId
                  )?.Price || item.Price,
              }
            : item
        );

        setCart(updatedCart);

        // Trigger Navbar refresh
        triggerNavbarCartRefresh();
      } catch (error) {
        console.error('Error updating cart quantity:', error);
      }
    } else {
      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) =>
          item.ProductId === productId
            ? {
                ...item,
                Quantity: newQuantity,
                ProductVariationId:
                  productVariationId ?? item.ProductVariationId,
                Price:
                  item.ProductVariations?.find(
                    (v) => v.ProductVariationId === productVariationId
                  )?.Price || item.Price,
              }
            : item
        );

        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });

      window.dispatchEvent(new Event('storage'));

      // Trigger Navbar refresh
      triggerNavbarCartRefresh();
    }
  };

  const handleVariationChange = async (productId, newVariationId) => {
    const cartItem = cart.find((item) => item.ProductId === productId);
    if (!cartItem) {
      console.error(`Cart item with ProductId ${productId} not found.`);
      return;
    }

    const selectedVariation = cartItem.ProductVariations?.find(
      (v) => v.ProductVariationId === newVariationId
    );

    if (CustomerId) {
      try {
        const payload = {
          CustomerId: parseInt(CustomerId),
          ProductId: cartItem.ProductId,
          ProductVariationId: newVariationId,
          Quantity: cartItem.Quantity,
        };

        console.log('Sending payload to API:', payload);

        const response = await fetch(`${backendUrl}/api/Cart/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to update variation (ProductId: ${cartItem.ProductId}). Response: ${response.status} - ${errorText}`
          );
        }

        const responseData = await response.json();
        console.log('API response data:', responseData);

        const updatedCart = cart.map((item) =>
          item.ProductId === productId
            ? {
                ...item,
                ProductVariationId: newVariationId,
                SalePrice:
                  selectedVariation?.SalePrice > 0
                    ? selectedVariation.SalePrice
                    : selectedVariation?.Price || item.Price,
              }
            : item
        );

        setCart(updatedCart);

        // Trigger Navbar refresh
        triggerNavbarCartRefresh();
      } catch (error) {
        console.error('Error updating cart variation:', error);
      }
    } else {
      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) =>
          item.ProductId === productId
            ? {
                ...item,
                ProductVariationId: newVariationId,
                SalePrice:
                  selectedVariation?.SalePrice > 0
                    ? selectedVariation.SalePrice
                    : selectedVariation?.Price || item.Price,
              }
            : item
        );

        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });

      window.dispatchEvent(new Event('storage'));

      // Trigger Navbar refresh
      triggerNavbarCartRefresh();
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
          fetch(`${backendUrl}/api/Cart/remove/${cartId}`, {
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

    // Trigger Navbar refresh
    triggerNavbarCartRefresh();
  };

  const proceedToCheckout = async () => {
    // Check if user is logged in
    if (!CustomerId || !token) {
      // Save selected items and cart info before redirecting
      localStorage.setItem('pendingCheckout', 'true');
      localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));

      // Show login message
      toast.info('Please log in to complete your checkout');
      navigate('/login', { state: { returnUrl: '/cart' } });
      return;
    }

    // Continue with normal checkout for logged-in users
    const selectedProducts = cart.filter((item) =>
      selectedItems.includes(item.ProductId)
    );

    if (selectedProducts.length === 0) {
      toast.warning('Please select items to checkout');
      return;
    }

    // Store selected items for checkout, but don't remove them from cart yet
    localStorage.setItem('checkoutItems', JSON.stringify(selectedProducts));
    localStorage.setItem(
      'selectedCartItemIds',
      JSON.stringify(
        selectedProducts.map((item) => item.CartId).filter((id) => id != null)
      )
    );

    // Navigate to checkout page without removing items from cart
    navigate('/checkout');
  };

  useEffect(() => {
    const handleCartUpdated = () => {
      // Re-fetch cart data when cart is updated elsewhere
      fetchCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdated);
    return () => window.removeEventListener('cartUpdated', handleCartUpdated);
  }, []);

  const selectedProducts = cart.filter((item) =>
    selectedItems.includes(item.ProductId)
  );

  const originalTotal = selectedProducts.reduce((total, item) => {
    const selectedVariation = item.ProductVariations?.find(
      (v) => v.ProductVariationId === item.ProductVariationId
    );

    const basePrice = selectedVariation?.Price || item.Price || 0;
    return total + basePrice * (item.Quantity || 1);
  }, 0);

  const discountTotal = selectedProducts.reduce((total, item) => {
    const selectedVariation = item.ProductVariations?.find(
      (v) => v.ProductVariationId === item.ProductVariationId
    );

    const basePrice = selectedVariation?.Price || item.Price || 0;
    const salePrice =
      selectedVariation?.SalePrice && selectedVariation?.SalePrice > 0
        ? selectedVariation.SalePrice
        : basePrice;

    return total + (basePrice - salePrice) * (item.Quantity || 1);
  }, 0);

  const totalOrder = selectedProducts.reduce((total, item) => {
    const selectedVariation = item.ProductVariations?.find(
      (v) => v.ProductVariationId === item.ProductVariationId
    );

    const finalPrice =
      selectedVariation?.SalePrice > 0
        ? selectedVariation.SalePrice
        : selectedVariation?.Price || item.Price || 0;

    return total + finalPrice * (item.Quantity || 1);
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
                  <Link to={`/product/${generateProductSlug(item)}`}>
                    <img
                      src={item.PictureUrl}
                      alt={item.ProductName}
                      className="w-24 h-28 object-cover ml-3 rounded-md border transform transition duration-300 ease-in-out hover:scale-150 cursor-pointer"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="ml-4 flex-1">
                    <h3 className="text-base font-semibold w-64 text-gray-800">
                      {item.ProductName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      <select
                        value={
                          item.ProductVariationId ||
                          item.ProductVariations?.[0]?.ProductVariationId ||
                          ''
                        }
                        onChange={(e) =>
                          handleVariationChange(
                            item.ProductId,
                            parseInt(e.target.value)
                          )
                        }
                        className="border rounded px-2 py-1 text-gray-700"
                      >
                        {Array.isArray(item.ProductVariations) &&
                        item.ProductVariations.length > 0 ? (
                          item.ProductVariations.map((variation) => (
                            <option
                              key={variation.ProductVariationId}
                              value={variation.ProductVariationId}
                            >
                              {variation.Ml}ml - $
                              {variation.SalePrice > 0
                                ? variation.SalePrice
                                : variation.Price}
                            </option>
                          ))
                        ) : (
                          <option disabled>No variations available</option>
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
                      disabled={(item.Quantity ?? 1) <= 1}
                    >
                      -
                    </button>

                    <input
                      type="number"
                      value={item.Quantity ?? 1}
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
                      ((item.SalePrice > 0 ? item.SalePrice : item.Price) ||
                        0) * (item.Quantity || 1)
                    ).toFixed(2)}
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
                    }
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
