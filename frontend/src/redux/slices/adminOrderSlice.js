import {
  createSlice,
  createAsyncThunk,
  __DO_NOT_USE__ActionTypes,
} from "@reduxjs/toolkit";
import axios from "axios";

// Fetch all orders(admin only)
export const fetchAllOrders = createAsyncThunk(
  "adminOrders/fetchAllOrders",
  async ({ page = 1, search = "" } = {}, { rejectWithValue, signal }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`,
        { params: { page, search }, signal }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? { message: "Unable to load orders." }
      );
    }
  }
);

// update order delivery status
export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`,
        { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// delete an order
export const deleteOrder = createAsyncThunk(
  "adminOrders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState: {
    orders: [],
    totalOrders: 0,
    totalSales: 0,
    currentPage: 1,
    totalPages: 0,
    totalFilteredOrders: 0,
    currentSearch: "",
    currentRequestId: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all orders
      .addCase(fetchAllOrders.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.currentRequestId = null;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.totalOrders;
        state.totalSales = action.payload.totalSales;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalFilteredOrders = action.payload.total;
        state.currentSearch = action.meta.arg?.search?.trim() ?? "";
      })

      .addCase(fetchAllOrders.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.currentRequestId = null;
        if (!action.meta.aborted) {
          state.error = action.payload?.message ?? action.error.message;
        }
      })
      // Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        const orderIndex = state.orders.findIndex(
          (order) => order._id === updatedOrder._id
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder
          
        }
      })

      // Delete Order
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(
          (order) => order._id !== action.payload
        );
      });
  },
});

export default adminOrderSlice.reducer;
