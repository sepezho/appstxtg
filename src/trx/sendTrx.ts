import { Address, beginCell, Dictionary, toNano, Cell } from "ton";
import { getPriceRaw } from "src/helpers/calculatePrice"
import { tonPytnId } from "src/config"

const buildSignatures = (signatures: any) => {
  const signaturesDict = Dictionary.empty<number, Cell>();

  signatures.forEach((e: any) => {
    const sig = Buffer.from(e.signature, 'hex')
    signaturesDict.set(e.index, beginCell().storeBuffer(sig).endCell())
  })

  return (beginCell().storeDictDirect(signaturesDict, Dictionary.Keys.Int(16), {
    serialize: (src: Cell, buidler) => {
      buidler.storeSlice(src.asSlice())
    },
    parse: (src) => {
      let cell = beginCell().endCell();
      return cell;
    }
  }
  ).endCell());
}

const buildPriceProof = (proofs: any) => {
  const proofsDict = Dictionary.empty<number, Cell>();
  proofs.forEach((e: any, i: number) => {
    const proof = Buffer.from(e, 'hex')
    proofsDict.set(i, beginCell().storeBuffer(proof).endCell())
  })

  return (beginCell().storeDictDirect(proofsDict, Dictionary.Keys.Int(16), {
    serialize: (src: Cell, buidler) => {
      buidler.storeSlice(src.asSlice())
    },
    parse: (src) => {
      let cell = beginCell().endCell();
      return cell;
    }
  }
  ).endCell());
}

const buildPriceData = (priceMessage: any) => {
  return (beginCell().storeBuffer(Buffer.from(priceMessage, 'hex')).endCell());
}

export const submitMinTx = async (amountMint: any, state: any, pool: any, tonConnectUI: any) => {
  if (amountMint) {
    const tonprice = getPriceRaw(state.prices, tonPytnId)
    const syntprice = getPriceRaw(state.prices, pool.syntPythId)
    const priceCalculated = syntprice / tonprice
    const tonAmountToMint = Number(amountMint) * priceCalculated * state.masterState.data.config.targetCRatio / 1e8
    const max = state.userWallet.balance

    if (toNano(tonAmountToMint + 0.4) > max) {
      alert('not enough balance')
      return
    }

    const VAAsignatures = buildSignatures(state.prices.tokenPrices.vaaProof.guardianSignatures)
    const tonPriceProofs = buildPriceProof(state.prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === tonPytnId)[0].proofs)
    const tonPriceData = buildPriceData(state.prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === tonPytnId)[0].message)
    const syntPriceProofs = buildPriceProof(state.prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === pool.syntPythId)[0].proofs)
    const syntPriceData = buildPriceData(state.prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === pool.syntPythId)[0].message)

    const pricesData = beginCell()
      .storeRef(VAAsignatures)
      .storeRef(beginCell().storeBuffer(Buffer.from(state.prices.tokenPrices.vaaProof.body, "hex")).endCell())
      .storeRef(beginCell()
        .storeRef(tonPriceProofs)
        .storeRef(tonPriceData)
        .endCell())
      .storeRef(beginCell()
        .storeRef(syntPriceProofs)
        .storeRef(syntPriceData)
        .endCell())
      .endCell()

    let txBuilder = {}

    if (!state.userState.deployed) {
      const masterAddress = pool.address
      let body =
        beginCell()
          .storeUint(0x110, 32)
          .storeUint(0x666, 64)
          .storeAddress(Address.parse(state.userWallet.walletAddress))
          .storeRef(pricesData)
          .storeUint(toNano(tonAmountToMint), 64)
          .storeBit(0)
          .endCell()
      txBuilder = {
        address: masterAddress,
        amount: toNano(tonAmountToMint + 0.4).toString(), // 0.3ton for fees
        payload: body.toBoc().toString('base64')
      } as any
    } else {
      let body =
        beginCell()
          .storeUint(0x100, 32)
          .storeUint(0x666, 64)
          .storeUint(toNano(tonAmountToMint), 64)
          .storeRef(pricesData)
          .endCell()
      txBuilder = {
        address: state.userState.address,
        amount: toNano(tonAmountToMint + 0.4).toString(), // 0.3ton for fees
        payload: body.toBoc().toString('base64')
      }
    }

    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 60 * 2, // 2min 
      messages: [txBuilder]
    }

    try {
      tonConnectUI.sendTransaction(tx, {
        modals: 'all',
        skipRedirectToWallet: 'ios',
        notifications: [],
        returnStrategy: 'https://app.stx.tg'
      })
    } catch (e) {
      console.log(e)
    }
  } else {
    alert('enter amount to mint')
  }
}

export const submitBurnTx = async (amountBurn: any, state: any, pool: any, tonConnectUI: any) => {
  if (amountBurn) {
    if (toNano(0.3) > state.userWallet.balance) {
      alert('not enough ton balance for tx fees')
      return
    }

    if (toNano(amountBurn) > state.userState.data.dynamics.syntMinted &&
      toNano(amountBurn) > state.userState.data.dynamics.syntBalance) {
      alert('not enough synts minted or synts balance')
      return
    }

    const VAAsignatures = buildSignatures(state.prices.tokenPrices.vaaProof.guardianSignatures)
    const tonPriceProofs = buildPriceProof(state.prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === tonPytnId)[0].proofs)
    const tonPriceData = buildPriceData(state.prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === tonPytnId)[0].message)
    const syntPriceProofs = buildPriceProof(state.prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === pool.syntPythId)[0].proofs)
    const syntPriceData = buildPriceData(state.prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === pool.syntPythId)[0].message)

    const pricesData = beginCell()
      .storeRef(VAAsignatures)
      .storeRef(beginCell().storeBuffer(Buffer.from(state.prices.tokenPrices.vaaProof.body, "hex")).endCell())
      .storeRef(beginCell()
        .storeRef(tonPriceProofs)
        .storeRef(tonPriceData)
        .endCell())
      .storeRef(beginCell()
        .storeRef(syntPriceProofs)
        .storeRef(syntPriceData)
        .endCell())
      .endCell()

    const body =
      beginCell()
        .storeUint(0x200, 32)
        .storeUint(0x666, 64)
        .storeRef(pricesData) //todo prices dict
        .storeUint(toNano(amountBurn), 64)
        .endCell()

    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 60 * 2, // 2min 
      messages: [
        {
          address: state.userState.address,
          amount: "400000000", // 1ton / rest (after nft fees) will be returned
          payload: body.toBoc().toString('base64')
        }]
    }

    try {
      tonConnectUI.sendTransaction(tx, {
        modals: 'all',
        skipRedirectToWallet: 'ios',
        notifications: [],
        returnStrategy: 'https://app.stx.tg'
      })
    } catch (e) {
      console.log(e)
    }
  } else {
    alert('enter amount to burn')
  }
}
