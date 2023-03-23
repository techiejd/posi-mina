import PosiPage from "../../modules/posiPage";
import { useAccounts } from "../../modules/useAccounts";

export default function Supporter() {
  const accounts = useAccounts();
  return <PosiPage type={"supporter"} accounts={accounts} />;
}
