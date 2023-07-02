import React, { useEffect } from "react";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { ConnectionProvider, useWallet } from "@solana/wallet-adapter-react";

import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import "../styles/App.css";

// set custom RPC server endpoint for the final website
// const endpoint = "https://explorer-api.devnet.solana.com";
const endpoint = "https://solana-devnet.g.alchemy.com/v2/jFn2wegh5B12OAmy9L8rQXs1qbvLV7R4";

// const endpoint = "https://ssc-dao.genesysgo.net";

const WalletProvider = dynamic(
  () => import("../contexts/ClientWalletProvider"),
  {
    ssr: false,
  }
);

function MyApp({ Component, pageProps }: AppProps) {
  const { wallet, connect, connecting, publicKey } = useWallet();

  useEffect(() => {
    if (!publicKey && wallet) {
      try {
        connect();
      } catch (error) {
        console.log("Error connecting to the wallet: ", (error as any).message);
      }
    }
  }, [wallet]);


  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider >
        <Component {...pageProps} />
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;
