import PosiPage from "./posiPage";
import { useAccounts } from "./useAccounts";

export default function Supporter() {
  const accounts = useAccounts();
  return <PosiPage type={"supporter"} accounts={accounts} />;
}
