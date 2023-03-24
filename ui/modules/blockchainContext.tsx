import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Field, Mina, PublicKey, UInt64, isReady } from "snarkyjs";

export type BlockchainState = {
  local: any;
  node: {
    getBalance: (publicKey: PublicKey, tokenId?: Field) => UInt64;
  };
};

export const BlockchainContext = createContext<BlockchainState | undefined>(
  undefined
);

const BlockchainStateProvider = ({ children }: { children: ReactNode }) => {
  const [blockchainState, setBlockchainState] = useState<
    BlockchainState | undefined
  >(undefined);
  useEffect(() => {
    (async () => {
      await isReady;
      const local = Mina.LocalBlockchain();
      Mina.setActiveInstance(local);
      setBlockchainState({
        local,
        node: Mina,
      });
    })();
  }, []);

  return (
    <BlockchainContext.Provider value={blockchainState}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchainState = () => {
  return useContext(BlockchainContext);
};

export default BlockchainStateProvider;
