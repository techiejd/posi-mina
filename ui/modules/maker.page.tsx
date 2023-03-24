import PosiPage from "./posiPage";
import { useAccounts } from "./useAccounts";

export default function Maker() {
  const accounts = useAccounts();
  return <PosiPage type={"maker"} accounts={accounts} />;
}
