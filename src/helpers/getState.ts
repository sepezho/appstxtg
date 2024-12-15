import { getClient } from 'src/helpers/client'
import { Cell, Address } from "ton";

const request = async (client: any, address: string): Promise<any> => {
  let res = Cell.EMPTY;
  try {
    const result = await client.getContractState(Address.parse(address))
    if (result.blockId.seqno > 0) {
      res = Cell.fromBoc(result.data as any)[0];
      return res;
    }
  } catch (e: any) {
    if (!e.message.includes('Cannot read properties of')) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await request(client, address)
    } else {
      return null;
    }
  }
}

export const getState = async (address: string) => {
  const client = await getClient()
  const result = await request(client, address)
  return result;
}
