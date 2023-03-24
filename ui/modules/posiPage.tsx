import { Box, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { AccountsState, Keys } from "./useAccounts";
import { useBlockchainState } from "./blockchainContext";

const PosiPage = ({
  type,
  accounts,
  children,
}: {
  type: "user" | "admin" | "supporter";
  accounts: AccountsState;
  children?: ReactNode;
}) => {
  const [myKeys, setMyKeys] = useState<Keys | undefined>();
  const bState = useBlockchainState();

  useEffect(() => {
    if (accounts != "loading") {
      setMyKeys(accounts[type]);
    }
  }, [accounts]);

  return (
    <div>
      <main>
        <Box>
          <Typography>
            You're acting as {type} with key:{" "}
            {myKeys == undefined ? "loading" : myKeys.publicKey.toBase58()}.
          </Typography>
          <Typography>
            {myKeys && bState && (
              <Typography>
                And your balance is currently:{" "}
                {bState.node.getBalance(myKeys.publicKey).toString()}
              </Typography>
            )}
          </Typography>
          {children}
        </Box>
      </main>
    </div>
  );
};

export default PosiPage;
