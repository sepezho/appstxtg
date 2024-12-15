import { TonClient } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { chain } from "src/config";

export const getClient = async () => {
  const endpoint = await getHttpEndpoint({ network: chain });
  const client = new TonClient({ endpoint });
  return client;
}
