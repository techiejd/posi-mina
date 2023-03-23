import { Box, Typography } from "@mui/material";
import { useAccounts } from "../../modules/useAccounts";

export default function User() {
  const accounts = useAccounts();

  return (
    <div>
      <main>
        <Box>
          <Typography>
            You're acting as user with key:{" "}
            {accounts == "loading"
              ? "loading"
              : accounts.user.publicKey.toBase58()}
            .
          </Typography>
        </Box>
      </main>
    </div>
  );
}
