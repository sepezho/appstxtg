import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface prices {
  tokenPrices: any[]
}

export const pricesSlice = createSlice({
  name: 'userWallet',
  initialState: {
    tokenPrices: { vaaProof: {}, dataParsed: [] }
  },
  reducers: {
    setPrices: (state, action: PayloadAction<any>) => {
      state.tokenPrices = action.payload
    },
  }
})

// Action creators are generated for each case reducer function
export const { setPrices } = pricesSlice.actions

export default pricesSlice.reducer
