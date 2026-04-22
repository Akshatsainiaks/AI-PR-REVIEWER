import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import prReducer from "./slices/prSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pr: prReducer,
  },
});

export default store;
