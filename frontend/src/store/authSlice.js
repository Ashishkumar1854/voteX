//Ye backend ka User model respect karega: role = SUPER_ADMIN / ORG_ADMIN / STUDENT + orgCode.
//Login ke baad token + user dono Redux + localStorage me jayenge.

// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthAPI } from "../services/api";

const USER_KEY = "votex_user";
const TOKEN_KEY = "votex_token";

const storedUser = (() => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
})();

const storedToken = localStorage.getItem(TOKEN_KEY) || null;

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await AuthAPI.login(email, password);
      // 👇 EXPECTED BACKEND RESPONSE:
      // { token, user: { name, email, role, orgCode } }
      return res.data;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed";
      return rejectWithValue(msg);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser,
    token: storedToken,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    },
    setCredentials(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        const { user, token } = action.payload;
        state.user = user;
        state.token = token;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_KEY, token);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed.";
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;

export default authSlice.reducer;
