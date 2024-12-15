import { Cell, Dictionary, Slice, DictionaryValue } from "ton";
import { EpochMaster } from "src/store/slices/masterState";

export function createEpochs(): DictionaryValue<EpochMaster> {
  return {
    serialize: (src: any, buidler: any) => {},
    parse: (src: Slice) => {
      const epochStartedAt = src.loadUint(32);
      const stakeAccumulated = src.loadUint(64);
      const feesAccumulated = src.loadUint(64);
      const feesWithdrawn = src.loadUint(64);
      return {
        epochStartedAt,
        stakeAccumulated,
        feesAccumulated,
        feesWithdrawn,
      };
    },
  };
}

export const parseMasterState = (masterState: Cell) => {
  const ds = masterState.beginParse();
  const metadata = ds.loadRef().beginParse();
  const config = ds.loadRef().beginParse();
  const dynamics = ds.loadRef().beginParse();
  const lastInvoke = dynamics.loadUint(32);
  const totalSupply = dynamics.loadUint(64);
  const totalSyntsMinted = dynamics.loadUint(64);
  const totalSyntFees = dynamics.loadUint(64);

  const fees = dynamics.loadDict(Dictionary.Keys.Uint(16), createEpochs());

  let arr: any = [];
  let i = fees.size - 1;
  while (i >= 0) {
    let e = fees.get(i);
    if (e === undefined) break;
    arr.push({
      key: i,
      epochStartedAt: e.epochStartedAt,
      stakeAccumulated: e.stakeAccumulated,
      feesAccumulated: e.feesAccumulated,
      feesWithdrawn: e.feesWithdrawn,
    });
    i--;
  }

  const res = {
    metadata: {
      salt: metadata.loadUint(32),
      codeVersion: metadata.loadUint(32),
      ghCommit: metadata.loadRef().toBoc().toString("hex"),
      description: metadata.loadRef().toBoc().toString("hex"),
      syntMetadata: metadata.loadRef().toBoc().toString("hex"),
    },
    config: {
      usdDecimal: config.loadUint(8),
      syntDecimal: config.loadUint(8),
      targetCRatio: config.loadUint(64),
      forcedLiquidationPenalty: config.loadUint(64),
      adminAddress: config.loadAddress().toString(),
      //price storage data
      //user code
    },
    dynamics: {
      lastInvoke: lastInvoke,
      totalSupply: totalSupply,
      totalSyntsMinted: totalSyntsMinted,
      totalSyntFees: totalSyntFees,
      feesEpochs: arr,
    },
  };
  return res;
};
