import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dictionary} from "ton"

export interface EpochUser{
  key?: number,
  epochStartedAt: number,
  minimalStakeAccumulated: number,
  feesWithdrawn: number
}
    
export interface userStateData {
  inited: number,
  metadata: {
    codeVersion?: number,
    ghCommit?: any, //todo fix type to string
    description?: any,//todo fix type to string
    syntMetadata?: any,//todo fix type to string
  },
  config: {
    masterAddress: string,
    ownerAddress: string,
    user_code?: any,//todo fix type to string
  },
  dynamics: {
    isLocked?: number,
    lastInvoke?: number,
    depositedTon?: number,
    syntBalance?: number,
    syntMinted?: number,
    syntLocked?: number,
    feesEpochs?: EpochUser[]
  }
}

export interface userState {
  address: string,
  deployed: boolean,
  data: userStateData
}

export const userStateSlice = createSlice({
  name: 'userState',
  initialState: {
    address: '',
    deployed: false,
    data: {
      inited: 0,
      metadata: {
      },
      config: {
        masterAddress: '',
        ownerAddress: '',
      },
      dynamics: {
      }
    }
  },
  reducers: {
    setInitedState: (state, action: PayloadAction<{ address: string, data: userStateData }>) => {
      state.deployed = true
      state.data = action.payload.data
      state.address = action.payload.address
    },
    setNotInitedState: (state, action: PayloadAction<{ address: string }>) => {
      state.deployed = false
      state.address = action.payload.address
    },
  }
})

// Action creators are generated for each case reducer function
export const { setInitedState, setNotInitedState } = userStateSlice.actions

export default userStateSlice.reducer
