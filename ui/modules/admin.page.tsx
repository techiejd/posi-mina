import {
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PosiPage from "./posiPage";
import { useAccounts } from "./useAccounts";
import { useState } from "react";
import { PublicKey } from "snarkyjs";
import { useBlockchainState } from "./blockchainContext";

export default function Admin() {
  const accounts = useAccounts();
  const bState = useBlockchainState();
  const [posiContract, setPosiContract] = useState<PublicKey | undefined>();
  const [weRaceContracts, setWeRaceContracts] = useState<PublicKey[]>([]);

  const deployPosi = () => {
    // TODO(techiejd): Change to actual deploy.
    setPosiContract(bState?.local.testAccounts[0].publicKey);
  };

  const deployWeRace = () => {
    // TODO(techiejd): Change to actual deploy.
    setWeRaceContracts((weRaceContracts) => {
      return [...weRaceContracts, bState?.local.testAccounts[0].publicKey];
    });
  };

  return (
    <PosiPage type={"admin"} accounts={accounts}>
      <Stack spacing={2} margin={2}>
        {posiContract == undefined ? (
          <Button onClick={deployPosi}>Deploy PoSI NFT Contract</Button>
        ) : (
          <Typography border={1}>
            PoSI NFT Contract: {posiContract.toBase58()}
          </Typography>
        )}
        <Button onClick={deployWeRace}>Deploy WeRace Contract</Button>
        {weRaceContracts.map((weRaceContract, i) => {
          return (
            <Card key={i}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <CardContent>
                  This WeRace's addy: {weRaceContract.toBase58()}
                  <TextField label="Winner?" required />
                </CardContent>
                <CardActions>
                  <Button size="small" type="submit" disabled>
                    Submit Winner
                  </Button>
                </CardActions>
              </form>
            </Card>
          );
        })}
      </Stack>
    </PosiPage>
  );
}
