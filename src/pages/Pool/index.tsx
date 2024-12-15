import { Cell, beginCell, toNano, Address } from "ton";
import { useCallback, useEffect, useState } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Back,
  PoolInfo,
  UserInfo,
  UserAddress,
  UserAddressHint,
  PoolContainer,
  Actions,
  MintForm,
  BurnForm,
  ActionButton,
  Icon,
  FormInput,
} from "./styles";
import { getState } from "src/helpers/getState";
import { loadImage } from "src/helpers/getLoadImage";
import { parseMasterState } from "src/helpers/parseMasterState";

import type { RootState } from "src/store/reducers";
import { useSelector, useDispatch } from "react-redux";
import { setState } from "src/store/slices/masterState";
import { pools, chain, tonPytnId } from "src/config";
import { calculateUserScAddress } from "src/helpers/calculateUserScAddress";
import { parseUserState } from "src/helpers/parseUserState";
import { setInitedState, setNotInitedState } from "src/store/slices/userState";
import { submitMinTx, submitBurnTx } from "src/trx/sendTrx";
import { getPrice, getPriceRaw } from "src/helpers/calculatePrice";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const Pool = () => {
  const { syntName } = useParams();
  const [tonConnectUI] = useTonConnectUI();
  const state = useSelector((state: RootState) => state) as any; //todo fix type
  const prices = useSelector((state: RootState) => state.prices);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [amountMint, setAmountMint] = useState();
  const [amountBurn, setAmountBurn] = useState();
  const [mintFormStatus, setMintFormStatus] = useState(false);
  const [burnFormStatus, setBurnFormStatus] = useState(false);
  const navigate = useNavigate();
  const [trigger, setTrigger] = useState(false);
  const [feesEpochs, setFeesEpochs] = useState<any>([]);
  const [userFeesEpochs, setUserFeesEpochs] = useState<any>([]);
  const [pool, setPool] = useState<any>({
    icon: "loading.svg",
    title: "loading...",
  });
  const [tokenPriceInfo, setTokenPriceInfo] = useState<any>({
    attestationTime: 0,
  });


  // update other useEffects where trigger - dependence
  useEffect(() => {
    let sett = setTimeout(() => {
      setTrigger(!trigger);
    }, 30000);
    return () => clearTimeout(sett);
  }, [trigger]);

  const moveTo = (link: string) => {
    navigate(link);
  };

  // when loading
  useEffect(() => {
    setPool({
      icon: "loading.svg",
      title: "loading...",
    });
    setBurnFormStatus(false);
    setMintFormStatus(false);
    setAmountMint(undefined);
    setAmountBurn(undefined);
    setLoading(false);
    dispatch(setNotInitedState({ address: "" }));
  }, [syntName]);

  // set data
  useEffect(() => {
    const pool = pools.filter((pool: any) => pool.title === syntName)[0];
    setPool(pool);
    setLoading(true);
    if (pool.address) {
      let masterAddress = pool.address;
      (async () => {
        const masterState = await getState(masterAddress);
        if (masterState) {
          const parsed = parseMasterState(masterState);
          if (parsed) dispatch(setState(parsed));
        }
        setLoading(false);
      })();
    }
  }, [trigger, syntName]);
  

  // parse && set userSc
  useEffect(() => {
    if (state.userWallet.walletAddress) {
      setLoading(true);
      if (pool.address) {
        let masterAddress = pool.address;
        (async () => {
          const userScAddress = calculateUserScAddress(
            Address.parse(masterAddress),
            Address.parse(state.userWallet.walletAddress),
            pool.blankCode,
            pool.salt,
            pool.syntPythId
          );
          const userState = await getState(userScAddress.toString());
          if (userState) {
            const parsed = parseUserState(userState);
            if (parsed)
              dispatch(
                setInitedState({
                  address: userScAddress.toString(),
                  data: parsed,
                })
              );
          } else {
            dispatch(setNotInitedState({ address: userScAddress.toString() }));
          }
          setLoading(false);
        })();
      }
    }
  }, [syntName, pool.address, state.userWallet.walletAddress, trigger]);

  // priceInfo, for example - time of last price
  useEffect(() => {
    if (prices) {
      if (prices.tokenPrices) {
        if (prices.tokenPrices.dataParsed) {
          const priceData = prices.tokenPrices.dataParsed.find(
            (e: any) => e.priceId === pool.syntPythId
          );
          if (priceData) setTokenPriceInfo(priceData);
        }
      }
    }
  }, [prices, syntName, trigger, loading]);


  // set feesEpochs data
  useEffect(() => {
    if (state.masterState.data.dynamics.feesEpochs)
      setFeesEpochs(state.masterState.data.dynamics.feesEpochs);
    if (state.userState.data.dynamics.feesEpochs)
      setUserFeesEpochs(state.userState.data.dynamics.feesEpochs);
  }, [
    state.userState.data.dynamics.feesEpochs,
    state.masterState.data.dynamics.feesEpochs,
  ]);

  return (
    <PoolContainer>
      <Back onClick={() => moveTo("/")}>{"< "}back</Back>
      {loading && <p>loading...</p>}
      ------------------
      <PoolInfo>
        <li>
          <Icon src={loadImage(pool.icon)} />
        </li>
        <li>pool: ton/{syntName}</li>
        <li>
          pool address:{" "}
          {pool.address ? (
            <>
              {" "}
              <UserAddress
                onClick={() => {
                  window.location.assign(
                    "https://" +
                      (chain === "testnet" ? "testnet." : "") +
                      "tonscan.org/address/" +
                      Address.parse(pool.address).toString()
                  );
                }}
              >
                {`${pool.address.slice(0, 3)}...${pool.address.slice(-5)}`}
              </UserAddress>
              <UserAddressHint>click to view on tonscan</UserAddressHint>
            </>
          ) : (
            "loading..."
          )}
        </li>
        <li>ton price: {getPrice(prices, tonPytnId)}$</li>
        <li>
          {pool.title} price: {getPrice(prices, pool.syntPythId)}${" "}
        </li>
        <li>
          last price: {dayjs(tokenPriceInfo.attestationTime * 1000).fromNow()}{" "}
        </li>
        <li>
          relative price:{" "}
          {(
            getPriceRaw(prices, pool.syntPythId) /
            getPriceRaw(prices, tonPytnId)
          ).toFixed(2)}
          ton
        </li>
        <li>
          total supply:{" "}
          {(state.masterState.data.dynamics.totalSupply / 1e9).toFixed(2)}ton{" "}
        </li>
        <li>
          total synts minted:{" "}
          {(state.masterState.data.dynamics.totalSyntsMinted / 1e9).toFixed(6)}
          {pool.title}
        </li>
        <li>
          target c-ratio:{" "}
          {(state.masterState.data.config.targetCRatio / 1e6).toFixed(2)}%
        </li>
        <li>
          liquidate below c-ratio:{" "}
          {(state.masterState.data.config.targetCRatio / 1.15 / 1e6).toFixed(2)}
          %
        </li>
        <li>
          liquidation penalty:{" "}
          {(
            state.masterState.data.config.forcedLiquidationPenalty / 1e6
          ).toFixed(2)}
          %
        </li>
      </PoolInfo>
      ------------------
      {state.userWallet.walletAddress && (
        <>
          {state.userState.deployed ? (
            state.userState.data.inited === -1 ? (
              <UserInfo>
                <li>
                  ur supply:{" "}
                  {(
                    Number(state.userState.data.dynamics.depositedTon) / 1e9
                  ).toFixed(2)}
                  ton{" "}
                </li>
                <li>
                  ur synts minted:{" "}
                  {(
                    Number(state.userState.data.dynamics.syntMinted) / 1e9
                  ).toFixed(6)}
                  {pool.title}
                </li>
                <li>
                  ur synts balance:{" "}
                  {(
                    Number(state.userState.data.dynamics.syntBalance) / 1e9
                  ).toFixed(6)}
                  {pool.title}
                </li>
                <li>
                  ur c-ratio:{" "}
                  {Number(
                    ((state.userState.data.dynamics.depositedTon *
                      getPriceRaw(prices, tonPytnId)) /
                      (state.userState.data.dynamics.syntMinted *
                        getPriceRaw(prices, pool.syntPythId))) *
                      100
                  ).toFixed(2)}
                  %
                </li>
                <li>
                  ur synt jw address:{" "}
                  <UserAddress
                    onClick={() => {
                      window.location.assign(
                        "https://" +
                          (chain === "testnet" ? "testnet." : "") +
                          "tonscan.org/address/" +
                          Address.parse(state.userState.address).toString()
                      );
                    }}
                  >
                    {`${state.userState.address.slice(
                      0,
                      3
                    )}...${state.userState.address.slice(-5)}`}
                  </UserAddress>
                  <UserAddressHint>click to view on tonscan</UserAddressHint>
                </li>
              </UserInfo>
            ) : (
              <UserInfo>user sc not inited</UserInfo>
            )
          ) : (
            <UserInfo>user sc not deployed</UserInfo>
          )}
          ------------------
        </>
      )}
      <Actions>
        {!(dayjs().unix() - tokenPriceInfo.attestationTime <= 180) && (
          <p>
            price publishTime is too old,
            <br /> probably market is closed
          </p>
        )}

        {mintFormStatus && (
          <MintForm>
            <ActionButton onClick={() => setMintFormStatus(!mintFormStatus)}>
              X cancel
            </ActionButton>
            <FormInput
              placeholder="amount of synts to mint"
              onChange={(e: any) =>
                setAmountMint(
                  e.target.value
                    .replace(",", ".")
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*)\./g, "$1")
                )
              }
              value={amountMint ? amountMint : ""}
            />
            {amountMint && (
              <i>
                {(
                  (((amountMint * getPriceRaw(prices, pool.syntPythId)) /
                    getPriceRaw(prices, tonPytnId)) *
                    state.masterState.data.config.targetCRatio) /
                    1e8 +
                  0.3
                ).toFixed(3)}
                tons to send
              </i>
            )}
            <ActionButton
              onClick={() => submitMinTx(amountMint, state, pool, tonConnectUI)}
            >
              send mint tx
            </ActionButton>
          </MintForm>
        )}

        {!mintFormStatus && (
          <>
            {state.userWallet.walletAddress &&
            dayjs().unix() - tokenPriceInfo.attestationTime <= 180 ? (
              <ActionButton
                onClick={() => {
                  setBurnFormStatus(false);
                  setMintFormStatus(true);
                  setAmountMint(undefined);
                  setAmountBurn(undefined);
                }}
              >
                mint
              </ActionButton>
            ) : (
              <ActionButton disabled>mint</ActionButton>
            )}
          </>
        )}

        {burnFormStatus && (
          <BurnForm>
            <ActionButton onClick={() => setBurnFormStatus(!burnFormStatus)}>
              X cancel
            </ActionButton>
            <FormInput
              placeholder="amount of synts to burn"
              onChange={(e: any) =>
                setAmountBurn(
                  e.target.value
                    .replace(",", ".")
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*)\./g, "$1")
                )
              }
              value={amountBurn ? amountBurn : ""}
            />
            {amountBurn && (
              <i>
                {(
                  (((amountBurn * getPriceRaw(prices, pool.syntPythId)) /
                    getPriceRaw(prices, tonPytnId)) *
                    state.masterState.data.config.targetCRatio) /
                  1e8
                ).toFixed(3)}
                tons be recived
              </i>
            )}
            <ActionButton
              onClick={() =>
                submitBurnTx(amountBurn, state, pool, tonConnectUI)
              }
            >
              send burn tx
            </ActionButton>
          </BurnForm>
        )}

        {!burnFormStatus && (
          <>
            {dayjs().unix() - tokenPriceInfo.attestationTime <= 180 &&
            state.userWallet.walletAddress &&
            state.userState.deployed &&
            state.userState.data.inited === -1 &&
            state.userState.data.dynamics.syntMinted > 0 ? (
              <ActionButton
                onClick={() => {
                  setMintFormStatus(false);
                  setBurnFormStatus(true);
                  setAmountMint(undefined);
                  setAmountBurn(undefined);
                }}
              >
                burn
              </ActionButton>
            ) : (
              <ActionButton disabled>!burn</ActionButton>
            )}
          </>
        )}

        {/*        {feesEpochs.map((e: any) => {
          const user = userFeesEpochs.find((u: any) => u.key === e.key);
          return (
            <ActionButton style={{ width: "200px" }} key={e.epochStartedAt}>
              epoch #{e.key} /{" "}
              {dayjs(e.epochStartedAt * 1000).format("DD.MM.YY")} <br />
              total staked: {(e.stakeAccumulated / 1e9).toFixed(4)}ton <br />
              total accumulated: {(e.feesAccumulated / 1e9).toFixed(4)}
              {syntName} <br />
              total withdrawn: {e.feesWithdrawn.toFixed(4)} {syntName}
            </ActionButton>
          );
        })}*/}
      </Actions>
    </PoolContainer>
  );
};

export default Pool;
