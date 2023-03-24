import PosiPage from "./posiPage";
import { useAccounts } from "./useAccounts";

export default function User() {
  const accounts = useAccounts();
  return <PosiPage type={"user"} accounts={accounts} />;
}
