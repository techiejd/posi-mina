import { useEffect, useState } from "react";
import { Mina, PrivateKey, PublicKey, isReady } from "snarkyjs";
import { useBlockchainState } from "./blockchainContext";
export type Keys = {
  publicKey: PublicKey;
  privateKey: PrivateKey;
}

type Accounts = {
  admin: Keys,
  user: Keys,
  supporter: Keys,
}
export type AccountsState = "loading" | Accounts;


export const useAccounts = () => {
  // This is supposed to mock some local storage of your keys.
  const [accounts, setAccounts] = useState<AccountsState>("loading");
  const blockchainState = useBlockchainState();
  useEffect(() => {
    if (blockchainState) {
      setAccounts({
        admin: blockchainState.local.testAccounts[0],
        user: blockchainState.local.testAccounts[1],
        supporter: blockchainState.local.testAccounts[2],
      });
    }
  }, [blockchainState]);
  return accounts;
}