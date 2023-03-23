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
export const useAccounts = () => {
  const [accounts, setAccounts] = useState<"loading" | Accounts>("loading");
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