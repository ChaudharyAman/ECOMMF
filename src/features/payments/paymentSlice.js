import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async Thunks
export const createRazorpayOrder = createAsyncThunk(
  'payments/createRazorpayOrder',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/payments/create-order', payload);
      return data; // Returns { razorpayOrderId, amount, currency, keyId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initialize online payment');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payments/verifyPayment',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/payments/verify', payload);
      return data; // Returns { success: true, orderId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify online payment');
    }
  }
);

export const createCODOrder = createAsyncThunk(
  'payments/createCODOrder',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/payments/cod', payload);
      return data; // Returns { success: true, orderId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initialize cash on delivery');
    }
  }
);

const initialState = {
  razorpayOrder: null,
  loading: false,
  error: null,
  paymentSuccess: false,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.razorpayOrder = null;
      state.loading = false;
      state.error = null;
      state.paymentSuccess = false;
    },
    clearPaymentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createRazorpayOrder
      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paymentSuccess = false;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.razorpayOrder = action.payload;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // verifyPayment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.loading = false;
        state.paymentSuccess = true;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createCODOrder
      .addCase(createCODOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paymentSuccess = false;
      })
      .addCase(createCODOrder.fulfilled, (state) => {
        state.loading = false;
        state.paymentSuccess = true;
      })
      .addCase(createCODOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPaymentState, clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
