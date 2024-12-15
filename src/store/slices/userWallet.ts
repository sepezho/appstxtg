import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface userWallet {
  walletAddress: string,
  balance: number
}

export const userWalletSlice = createSlice({
  name: 'userWallet',
  initialState: {
    walletAddress: '',
    balance: 0
  },
  reducers: {
    setWalletAddress: (state, action: PayloadAction<string>) => {
      state.walletAddress = action.payload
    },
    setBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload
    },
  }
})

// Action creators are generated for each case reducer function
export const { setWalletAddress, setBalance } = userWalletSlice.actions

export default userWalletSlice.reducer
