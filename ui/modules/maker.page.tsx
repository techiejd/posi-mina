import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
} from "@mui/material";
import PosiPage from "./posiPage";
import { useAccounts } from "./useAccounts";

export default function Maker() {
  const accounts = useAccounts();
  return (
    <PosiPage type={"maker"} accounts={accounts}>
      <form
        onSubmit={(e) => {
          e.preventDefault;
        }}
      >
        <Stack>
          <FormControl>
            <FormLabel>
              Ayo! Please upload your "Proof of Social Impact"!
            </FormLabel>
            <Input type="file" required />
          </FormControl>
          <Button type="submit" variant="contained">
            Upload
          </Button>
        </Stack>
      </form>
    </PosiPage>
  );
}
