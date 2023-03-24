import type { AppProps } from "next/app";
import BlockchainStateProvider from "../../modules/blockchainContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <BlockchainStateProvider>
      <Component {...pageProps} />
    </BlockchainStateProvider>
  );
}
