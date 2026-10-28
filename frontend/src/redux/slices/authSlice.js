import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

//Retrieve user info and token from localStorage if available
const tokenFromStorage = localStorage.getItem("userToken");
const userFromStorage = tokenFromStorage && localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

// check for an existing guest ID in the localStorage or generate a new One
const initialGuestId =
  localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

// Initial state
const initialState = {
  user: userFromStorage,
  token: tokenFromStorage,
  guestId: initialGuestId,
  loading: false,
  error: null,
};

// Async Thunk for User Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
        userData
      );
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);

      return {
        user: response.data.user,
        token: response.data.token,
      };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Unable to sign in. Please try again.",
      });
    }
  }
);

// Async Thunk for User Registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        userData
      );
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);

      return {
        user: response.data.user,
        token: response.data.token,
      };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Unable to create your account. Please try again.",
      });
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  "auth/uploadProfileImage",
  async (imageFile, { rejectWithValue }) => {
    try {
      const body = new FormData();
      body.append("image", imageFile);
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile/image`,
        body,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to save profile image."
      );
    }
  }
);

export const deleteProfileImage = createAsyncThunk(
  "auth/deleteProfileImage",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile/image`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to remove profile image."
      );
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.guestId = `guest_${new Date().getTime()}`; // Reset guest ID on logout
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      localStorage.setItem("guestId", state.guestId); // Set new guest ID in localStorage
    },
    generateNewGuestId: (state) => {
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.setItem("guestId", state.guestId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      }) 
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(deleteProfileImage.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});


export const {logout,generateNewGuestId} = authSlice.actions;
export default authSlice.reducer;