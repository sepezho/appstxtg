import { createSlice, PayloadAction} from '@reduxjs/toolkit'
import { Dictionary  } from "ton"

export interface EpochMaster{
  key?: number,
  epochStartedAt: number,
  stakeAccumulated: number,
  feesAccumulated: number,
  feesWithdrawn: number
}

export interface masterStateData {
  metadata: {
    codeVersion: number,
    ghCommit: any, //todo fix type to string
    description: any,//todo fix type to string
    syntMetadata: any,//todo fix type to string
  },
  config: {
    usdDecimal: number,
    syntDecimal: number,
    targetCRatio: number,
    forcedLiquidationPenalty: number,
    adminAddress: string,
  },
  dynamics: {
    lastInvoke: number,
    totalSupply: number,
    totalSyntsMinted: number,
    feesEpochs?: EpochMaster[],
    totalSyntFees: number
  }
}

export interface masterState {
  data: masterStateData
}

export const masterStateSlice = createSlice({
  name: 'user',
  initialState: {
    data: {
      metadata: {
        codeVersion: 0,
        ghCommit: "",
        description: "",
        syntMetadata: ""
      },
      config: {
        usdDecimal: 0,
        syntDecimal: 0,
        targetCRatio: 0,
        forcedLiquidationPenalty: 0,
        adminAddress: '',
      },
      dynamics: {
        lastInvoke: 0,
        totalSupply: 0,
        totalSyntsMinted: 0,
        totalSyntFees: 0,
      }
    }
  },
  reducers: {
    setState: (state, action: PayloadAction<masterStateData>) => {
      state.data = action.payload
    },
  }
})

// Action creators are generated for each case reducer function
export const { setState } = masterStateSlice.actions

export default masterStateSlice.reducer
