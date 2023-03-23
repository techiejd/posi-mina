import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";
import { AccountsState } from "./useAccounts";

const PosiPage = ({
  type,
  accounts,
  children,
}: {
  type: "user" | "admin" | "supporter";
  accounts: AccountsState;
  children?: ReactNode;
}) => {
  return (
    <div>
      <main>
        <Box>
          <Typography>
            You're acting as {type} with key:{" "}
            {accounts == "loading"
              ? "loading"
              : accounts[type].publicKey.toBase58()}
            .
          </Typography>
          {children}
        </Box>
      </main>
    </div>
  );
};

export default PosiPage;
