import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { loginUser, logout, registerUser } from "./authSlice";

const getAuthConfig = (token) => ({
  headers: {
    Authorization: ["Bearer", token].join(" "),
  },
});

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue("Please sign in again to manage favorites.");
      }
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/favorites`,
        getAuthConfig(token)
      );
      return { products: response.data, userId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load favorites."
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { status, loadedUserId } = getState().favorites;
      const userId = getState().auth.user?._id;
      return Boolean(
        userId &&
          status !== "loading" &&
          !(status === "succeeded" && loadedUserId === userId)
      );
    },
  }
);

export const toggleFavorite = createAsyncThunk(
  "favorites/toggleFavorite",
  async ({ product, isFavorite }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue("Please sign in again to manage favorites.");
      }
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/favorites/${product._id}`;
      const response = isFavorite
        ? await axios.delete(url, getAuthConfig(token))
        : await axios.post(url, {}, getAuthConfig(token));
      return { ...response.data, product };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to update favorite."
      );
    }
  }
);

const initialState = {
  products: [],
  productIds: [],
  loadedUserId: null,
  status: "idle",
  error: null,
  pendingProductIds: [],
  currentRequestId: null,
};

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    clearFavorites: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, () => initialState)
      .addCase(registerUser.fulfilled, () => initialState)
      .addCase(logout, () => initialState)
      .addCase(fetchFavorites.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.loadedUserId = action.meta.arg;
        state.currentRequestId = action.meta.requestId;
        state.products = [];
        state.productIds = [];
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = "succeeded";
        state.loadedUserId = action.payload.userId;
        state.products = action.payload.products;
        state.productIds = action.payload.products.map((product) => product._id);
        state.currentRequestId = null;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = "failed";
        state.error = action.payload || action.error.message;
        state.currentRequestId = null;
      })
      .addCase(toggleFavorite.pending, (state, action) => {
        state.error = null;
        state.pendingProductIds.push(action.meta.arg.product._id);
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { product, isFavorite } = action.payload;
        state.pendingProductIds = state.pendingProductIds.filter(
          (id) => id !== product._id
        );
        if (isFavorite) {
          if (!state.productIds.includes(product._id)) {
            state.productIds.push(product._id);
            state.products.push(product);
          }
        } else {
          state.productIds = state.productIds.filter((id) => id !== product._id);
          state.products = state.products.filter(
            (favorite) => favorite._id !== product._id
          );
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.pendingProductIds = state.pendingProductIds.filter(
          (id) => id !== action.meta.arg.product._id
        );
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;
