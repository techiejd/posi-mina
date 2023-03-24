import { Box, Typography } from "@mui/material";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { AccountsState, Keys } from "./useAccounts";
import { useBlockchainState } from "./blockchainContext";

export type PosiPageState = {
  myKeys: Keys;
};

export const PosiPageContext = createContext<PosiPageState | undefined>(
  undefined
);

export const usePosiPageState = () => {
  return useContext(PosiPageContext);
};

const PosiPage = ({
  type,
  accounts,
  children,
}: {
  type: "admin" | "maker" | "supporter";
  accounts: AccountsState;
  children?: ReactNode;
}) => {
  const [pageState, setPageState] = useState<PosiPageState | undefined>();
  const bState = useBlockchainState();

  useEffect(() => {
    if (accounts != "loading") {
      setPageState({ myKeys: accounts[type] });
    }
  }, [accounts]);

  return (
    <div>
      <Box>
        <Typography>
          You're acting as {type} with key:{" "}
          {pageState == undefined ? "loading" : myKeys.publicKey.toBase58()}.
        </Typography>
        <Typography>
          {pageState &&
            bState &&
            `And your balance is currently: ${bState.node
              .getBalance(pageState.myKeys.publicKey)
              .toString()}`}
        </Typography>
        <PosiPageContext.Provider value={pageState}>
          {children}
        </PosiPageContext.Provider>
      </Box>
    </div>
  );
};

export default PosiPage;
