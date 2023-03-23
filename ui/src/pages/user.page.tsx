import PosiPage from "../../modules/posiPage";
import { useAccounts } from "../../modules/useAccounts";

export default function User() {
  const accounts = useAccounts();
  return <PosiPage type={"user"} accounts={accounts} />;
}
