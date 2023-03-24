import PosiPage from "./posiPage";
import { useAccounts } from "./useAccounts";

export default function Admin() {
  const accounts = useAccounts();
  return <PosiPage type={"admin"} accounts={accounts} />;
}
