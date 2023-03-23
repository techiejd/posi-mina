import { useEffect, useState } from "react";
import { Mina, PrivateKey, PublicKey, isReady } from "snarkyjs";
type Keys = {
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
  useEffect(() => {
    (async () => {
      await isReady;
      const local = Mina.LocalBlockchain();

      setAccounts({
        admin: local.testAccounts[0],
        user: local.testAccounts[1],
        supporter: local.testAccounts[2],
      });
    })();
  }, []);
  return accounts;
}