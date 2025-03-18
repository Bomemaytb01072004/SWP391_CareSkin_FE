// apiOfRating.js

// Fetch all ratings
export async function fetchAllRatings() {
  try {
    const response = await fetch('http://careskinbeauty.shop:4456/api/RatingFeedback');
    if (!response.ok) throw new Error('Error fetching ratings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching ratings:', error);
    throw error;
  }
}

// Fetch active ratings
export async function fetchActiveRatings() {
  try {
    const response = await fetch('http://careskinbeauty.shop:4456/api/RatingFeedback/active');
    if (!response.ok) throw new Error('Error fetching active ratings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching active ratings:', error);
    throw error;
  }
}

// Fetch inactive ratings
export async function fetchInactiveRatings() {
  try {
    const response = await fetch('http://careskinbeauty.shop:4456/api/RatingFeedback/inactive');
    if (!response.ok) throw new Error('Error fetching inactive ratings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching inactive ratings:', error);
    throw error;
  }
}

// Fetch ratings for a specific product
export async function fetchProductRatings(productId) {
  try {
    const response = await fetch(`http://careskinbeauty.shop:4456/api/RatingFeedback/product/${productId}`);
    if (!response.ok) throw new Error(`Error fetching ratings for product ${productId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ratings for product ${productId}:`, error);
    throw error;
  }
}

// Fetch average rating for a product
export async function fetchProductAverageRating(productId) {
  try {
    const response = await fetch(`http://careskinbeauty.shop:4456/api/RatingFeedback/average/${productId}`);
    if (!response.ok) throw new Error(`Error fetching average rating for product ${productId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching average rating for product ${productId}:`, error);
    throw error;
  }
}

// Fetch user's ratings
export async function fetchUserRatings() {
  try {
    const response = await fetch('http://careskinbeauty.shop:4456/api/RatingFeedback/my-ratings');
    if (!response.ok) throw new Error('Error fetching user ratings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    throw error;
  }
}

// Fetch a specific rating by ID
export async function fetchRatingById(id) {
  try {
    const response = await fetch(`http://careskinbeauty.shop:4456/api/RatingFeedback/${id}`);
    if (!response.ok) throw new Error(`Error fetching rating ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching rating ${id}:`, error);
    throw error;
  }
}

// Create a new rating
export async function createRating(ratingData) {
  try {
    const formData = new FormData();
    
    formData.append('ProductId', ratingData.ProductId);
    formData.append('Rating', ratingData.Rating);
    formData.append('FeedBack', ratingData.FeedBack);
    
    if (ratingData.FeedbackImages && ratingData.FeedbackImages.length > 0) {
      ratingData.FeedbackImages.forEach(image => {
        formData.append('FeedbackImages', image);
      });
    }
    
    const response = await fetch('http://careskinbeauty.shop:4456/api/RatingFeedback', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Error creating rating');
    return await response.json();
  } catch (error) {
    console.error('Error creating rating:', error);
    throw error;
  }
}

// Update an existing rating
export async function updateRating(id, ratingData) {
  try {
    const formData = new FormData();
    
    formData.append('CustomerId', ratingData.CustomerId);
    formData.append('Rating', ratingData.Rating);
    formData.append('FeedBack', ratingData.FeedBack);
    
    if (ratingData.NewImages && ratingData.NewImages.length > 0) {
      ratingData.NewImages.forEach(image => {
        formData.append('NewImages', image);
      });
    }
    
    if (ratingData.ImagesToDelete && ratingData.ImagesToDelete.length > 0) {
      ratingData.ImagesToDelete.forEach(imageId => {
        formData.append('ImagesToDelete', imageId);
      });
    }
    
    const response = await fetch(`http://careskinbeauty.shop:4456/api/RatingFeedback/${id}`, {
      method: 'PUT',
      body: formData
    });
    
    if (!response.ok) throw new Error(`Error updating rating ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error updating rating ${id}:`, error);
    throw error;
  }
}

// Delete a rating
export async function deleteRating(id) {
  try {
    const response = await fetch(`http://careskinbeauty.shop:4456/api/RatingFeedback/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error(`Error deleting rating ${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting rating ${id}:`, error);
    throw error;
  }
}

// Export all functions as default export
export default {
  fetchAllRatings,
  fetchActiveRatings,
  fetchInactiveRatings,
  fetchProductRatings,
  fetchProductAverageRating,
  fetchUserRatings,
  fetchRatingById,
  createRating,
  updateRating,
  deleteRating
};