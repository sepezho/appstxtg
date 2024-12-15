import { configureStore } from "@reduxjs/toolkit";
import { masterStateSlice } from "./slices/masterState";
import { userStateSlice } from "./slices/userState";
import { userWalletSlice } from "./slices/userWallet";
import { pricesSlice } from "./slices/prices";

export const store = configureStore({
  reducer: {
    userWallet: userWalletSlice.reducer,
    masterState: masterStateSlice.reducer,
    userState: userStateSlice.reducer,
    prices: pricesSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
