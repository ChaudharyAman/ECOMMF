import { createSlice } from '@reduxjs/toolkit';

const loadWishlistFromStorage = () => {
  try {
    const storedWishlist = localStorage.getItem('wishlist');
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  } catch (error) {
    console.error("Failed to load wishlist from storage", error);
    return [];
  }
};

const initialState = {
  items: loadWishlistFromStorage(),
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.items.find(item => item._id === product._id);
      if (!exists) {
        state.items.push(product);
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      }
    },
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item._id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
    toggleWishlist: (state, action) => {
        const product = action.payload;
        const index = state.items.findIndex(item => item._id === product._id);
        if (index !== -1) {
            state.items.splice(index, 1);
        } else {
            state.items.push(product);
        }
        localStorage.setItem('wishlist', JSON.stringify(state.items));
    }
  },
});

export const { addToWishlist, removeFromWishlist, toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
