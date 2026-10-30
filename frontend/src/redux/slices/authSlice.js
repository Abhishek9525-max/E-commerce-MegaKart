import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

localStorage.removeItem("userToken");
const userFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const initialGuestId =
  localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

const initialState = {
  user: userFromStorage,
  guestId: initialGuestId,
  loading: false,
  error: null,
  initialized: false,
  initializing: false,
};

export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`
      );
      localStorage.setItem("userInfo", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to restore your session."
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { initialized, initializing } = getState().auth;
      return !initialized && !initializing;
    },
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
        userData
      );
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          "Unable to sign in. Please try again.",
      });
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (credential, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/google`,
        { credential }
      );
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      return {
        user: response.data.user,
        welcomeEmailSent: response.data.welcomeEmailSent,
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          "Unable to sign in with Google. Please try again.",
      });
    }
  }
);

export const requestRegistrationOtp = createAsyncThunk(
  "auth/requestRegistrationOtp",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        userData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          "Unable to send a verification code. Please try again.",
      });
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register/verify-otp`,
        userData
      );
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      return {
        user: response.data.user,
        welcomeEmailSent: response.data.welcomeEmailSent,
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          "Unable to create your account. Please try again.",
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
        body
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
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile/image`
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

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/auth/logout`,
        {}
      );
    } finally {
      dispatch(logout());
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.initialized = true;
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.removeItem("userInfo");
      localStorage.setItem("guestId", state.guestId);
    },
    generateNewGuestId: (state) => {
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.setItem("guestId", state.guestId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.initializing = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.initializing = false;
        state.initialized = true;
        state.user = action.payload;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.initializing = false;
        state.initialized = true;
        state.user = null;
        localStorage.removeItem("userInfo");
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload.user;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(requestRegistrationOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestRegistrationOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestRegistrationOtp.rejected, (state, action) => {
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

export const { logout, generateNewGuestId } = authSlice.actions;
export default authSlice.reducer;
