import {
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { usePosiPageState } from "./posiPage";
import { useState } from "react";
import { AccountUpdate, PrivateKey, PublicKey } from "snarkyjs";
import { useBlockchainState } from "./blockchainContext";

export default function Admin() {
  const pageState = usePosiPageState();
  const bState = useBlockchainState();
  const [posiContract, setPosiContract] = useState<PublicKey | undefined>();
  const [weRaceContracts, setWeRaceContracts] = useState<PublicKey[]>([]);

  const deployPosi = async () => {
    // TODO(techiejd): Change to deploy Posi Contract.
    const { Add } = await import("posi");
    if (!pageState || !bState) return;
    const { myKeys } = pageState;
    const { node } = bState;
    const zkAppPrivateKey = PrivateKey.random();
    const zkAppAddress = zkAppPrivateKey.toPublicKey();
    const posiContract = new Add(zkAppAddress);

    const txn = await node.transaction(myKeys.publicKey, () => {
      AccountUpdate.fundNewAccount(myKeys.publicKey);
      posiContract.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([myKeys.privateKey, zkAppPrivateKey]).send();

    setPosiContract(zkAppAddress);
  };

  const deployWeRace = () => {
    // TODO(techiejd): Change to actual deploy.
    setWeRaceContracts((weRaceContracts) => {
      return [...weRaceContracts, bState?.local.testAccounts[0].publicKey];
    });
  };

  return (
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
  );
}
