import PosiPage from "../../modules/posiPage";
import { useAccounts } from "../../modules/useAccounts";

export default function Admin() {
  const accounts = useAccounts();
  return <PosiPage type={"admin"} accounts={accounts} />;
}
