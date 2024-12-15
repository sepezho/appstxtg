import { useEffect, useState } from "react";
import { Address } from "ton";
import { useTonAddress } from "@tonconnect/ui-react";
import { TonConnectButton } from "@tonconnect/ui-react";

import type { RootState } from "src/store/reducers";
import { useSelector, useDispatch } from "react-redux";
import { setWalletAddress, setBalance } from "src/store/slices/userWallet";
import { getClient } from "src/helpers/client";
import { loadImage } from "src/helpers/getLoadImage";
import { HeaderContainer, Logo } from "./styles";

import { pools, tonPytnId } from "src/config";
import { loadWormholeData } from "src/helpers/loadWormholeData";
import { setPrices } from "src/store/slices/prices";


const Header = () => {
  const userFriendlyAddress = useTonAddress();
  const user = useSelector((state: RootState) => state.userWallet);
  const dispatch = useDispatch();
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (userFriendlyAddress) {
      (async () => {
        const balance = await (
          await getClient()
        ).getBalance(Address.parseFriendly(userFriendlyAddress).address);
        dispatch(setWalletAddress(userFriendlyAddress));
        dispatch(setBalance(Number(balance)));
      })();
    } else {
      dispatch(setWalletAddress(userFriendlyAddress));
      dispatch(setBalance(Number(0)));
    }
  }, [userFriendlyAddress]);

  useEffect(() => {
    let sett = setTimeout(() => {
      setTrigger(!trigger);
    }, 5000);
    return () => clearTimeout(sett);
  }, [trigger]);

  useEffect(() => {
    (async () => {
      const whResult = await loadWormholeData();
      dispatch(setPrices(whResult));
    })();
  }, [trigger]);

  return (
    <HeaderContainer>
      <TonConnectButton />
      <br />
      <a href={"https://syde.fi"}>
        <Logo src={loadImage("s.png")} />
      </a>
      beta testnet v0.1.2
      {user.walletAddress ? (
        <span>balance: {(user.balance / 1e9).toFixed(3)}ton</span>
      ) : (
        ""
      )}
      <br />
    </HeaderContainer>
  );
};

export default Header;
