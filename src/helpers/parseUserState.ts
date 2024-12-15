import { Cell, DictionaryValue, Dictionary, Slice } from "ton";
import { EpochUser } from "src/store/slices/userState";

export function createEpochs(): DictionaryValue<EpochUser> {
  return {
    serialize: (src: any, buidler: any) => {},
    parse: (src: Slice) => {
      const epochStartedAt = src.loadUint(32);
      const minimalStakeAccumulated = src.loadUint(64);
      const feesWithdrawn = src.loadUint(64);
      return { epochStartedAt, minimalStakeAccumulated, feesWithdrawn };
    },
  };
}

export const parseUserState = (masterState: Cell) => {
  const ds = masterState.beginParse();
  const metadata = ds.loadRef().beginParse();
  const config = ds.loadRef().beginParse();
  const dynamics = ds.loadRef().beginParse();

  const blank_code = config.loadRef();
  const last_user_code = config.loadRef();
  const synt_id = config.loadUint(256);
  const config_addresses = config.loadRef().beginParse();

  const masterAddress = config_addresses.loadAddress().toString();
  const ownerAddress = config_addresses.loadAddress().toString();
  const admin = config_addresses.loadAddress().toString();
  const is_locked = dynamics.loadUint(32);
  const lastInvoke = dynamics.loadUint(32);
  const depositedTon = dynamics.loadUint(64);
  const syntBalance = dynamics.loadUint(64);
  const syntMinted = dynamics.loadUint(64);
  const syntLocked = dynamics.loadUint(64);

  const fees = dynamics.loadDict(Dictionary.Keys.Uint(16), createEpochs());
  let arr: any = [];
  let i = fees.size - 1;
  while (i > 0) {
    let e = fees.get(i);
    if (e === undefined) break;
    arr.push({
      key: i,
      epochStartedAt: e.epochStartedAt,
      minimalStakeAccumulated: e.minimalStakeAccumulated,
      feesWithdrawn: e.feesWithdrawn,
    });
    i--;
  }

  return {
    inited: -1,
    metadata: {
      salt: metadata.loadUint(32),
      codeVersion: metadata.loadUint(32),
      ghCommit: metadata.loadRef().toBoc().toString("hex"),
      description: metadata.loadRef().toBoc().toString("hex"),
      syntMetadata: metadata.loadRef().toBoc().toString("hex"),
    },
    config: {
      masterAddress: masterAddress,
      ownerAddress: ownerAddress,
    },
    dynamics: {
      isLocked: is_locked,
      lastInvoke: lastInvoke,
      depositedTon: depositedTon,
      syntBalance: syntBalance,
      syntMinted: syntMinted,
      syntLocked: syntLocked,
      feesEpochs: arr,
    },
  };
};
