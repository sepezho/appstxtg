import { contractAddress, Cell, beginCell, Address } from "ton";

const hexToBigInt = (hex: string) => {
        return BigInt('0x' + hex)
}
export const calcStateInit = (master: Address, owner: Address, blankCode: string, salt: number, synt_id: string) => {
        return {
                code: Cell.fromBoc(Buffer.from(blankCode, 'hex'))[0], data: beginCell()
                        .storeAddress(master)
                        .storeRef(Cell.fromBoc(Buffer.from(blankCode, 'hex'))[0])
                        .storeUint(salt, 32)
                        .storeUint(hexToBigInt(synt_id), 256)
                        .storeAddress(owner)
                        .endCell()
        }
}

export const calculateUserScAddress = (master: Address, owner: Address, blankCode: string, salt: number, synt_id: string) => {
        return contractAddress(0, calcStateInit(master, owner, blankCode, salt, synt_id))
}
