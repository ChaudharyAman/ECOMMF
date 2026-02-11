import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch all products
// Fetch all products (supports params object or keyword string)
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (arg = {}, { rejectWithValue }) => {
  try {
    let params = {};
    if (typeof arg === 'string') {
        params = { keyword: arg };
    } else {
        params = arg;
    }
    
    // Construct query string manually or use axios params (api.get handles existing config, but let's pass params object if api supports it)
    // Assuming api.get wraps axios.get, we can pass params in config
    const { data } = await api.get('/products', { params });
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

// Fetch product by ID
export const fetchProductById = createAsyncThunk('products/fetchProductById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

// Update product
export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, productData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

// Create product
export const createProduct = createAsyncThunk('products/createProduct', async (productData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

// Delete product
export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

// Fetch categories
export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/categories');
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

// Fetch products by category for related items
export const fetchProductsByCategory = createAsyncThunk('products/fetchProductsByCategory', async (categoryId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products?category=${categoryId}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    relatedProducts: [],
    categories: [],
    loading: false,
    error: null,
    success: false, // For create actions
  },
  reducers: {
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.relatedProducts = action.payload.products;
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true; // Use toast in component, but success flag helps too
        state.products = state.products.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
          state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
          state.loading = false;
          // Optimistically update or add to products list
          const index = state.products.findIndex(p => p._id === action.payload._id);
          if (index !== -1) {
              state.products[index] = action.payload;
          } else {
              state.products.push(action.payload);
          }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
      });
  },
});

export const { resetSuccess } = productSlice.actions;
export default productSlice.reducer;
