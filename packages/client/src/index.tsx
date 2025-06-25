import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { setup } from "./mud/setup";
import { MUDProvider } from "./MUDContext";
import mudConfig from "../../contracts/mud.config";
import '@rainbow-me/rainbowkit/styles.css';
import './polyfills';
import {
  rainbowWallet,
  metaMaskWallet,
  okxWallet,
  coinbaseWallet,
  trustWallet,
  bitgetWallet,
  coin98Wallet,
  rabbyWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { getDefaultConfig, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { http } from 'viem';
import merge from 'lodash.merge';
import { BrowserRouter } from "react-router-dom";
import { supportedChains } from "./mud/supportedChains";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'buffer'
import { Terms } from "./components/terms";
import { Privacy } from "./components/privacy";

export const getChain = (id) => supportedChains.find((c) => c.id === id) || null;

// add new chain: change here
const redstone = getChain(690);
const metacatDev = getChain(31338);
const mintchain = getChain(185);
const morph = getChain(2818);
const b3 = getChain(8333);
const base = getChain(8453);
const happyTest = getChain(216);
const hashkey = getChain(177);
const local = getChain(31337);

if (!redstone || !metacatDev || !mintchain || !morph || !b3) {
  console.error("Some chains are not defined in supportedChains!");
}

const config = getDefaultConfig({
  appName: 'PixeLAW',
  projectId: 'YOUR_PROJECT_ID',
  wallets: [{
    groupName: 'Recommended',
    wallets: [metaMaskWallet, coinbaseWallet, okxWallet, trustWallet, bitgetWallet, coin98Wallet, rabbyWallet],
  }],
  chains: [
    morph,
    hashkey,
    // b3,
    // base,
    // happyTest,
    // redstone,
    // mintchain,
    // metacatDev,
    // local,
  ],
  ssr: true,
});

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);
const queryClient = new QueryClient();

const path = (location.pathname.split("/").filter(Boolean)[0] ?? "").toLowerCase()
const showTerms = path === 'terms';
const showPrivacy = path === 'privacy';

setup().then(async (result) => {
  root.render(
    <React.StrictMode>
      {
        showTerms ? (<Terms/>) : showPrivacy ? (<Privacy/>) : (
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider theme={lightTheme()}>
                <MUDProvider value={result}>
                  <BrowserRouter>
                    <App />
                  </BrowserRouter>
                </MUDProvider>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        )
      }
    </React.StrictMode>
  );

  // https://vitejs.dev/guide/env-and-mode.html
  // if (import.meta.env.DEV) {
  //   const { mount: mountDevTools } = await import("@latticexyz/dev-tools");
  //   mountDevTools({
  //     config: mudConfig,
  //     publicClient: result.network.publicClient,
  //     walletClient: result.network.walletClient,
  //     latestBlock$: result.network.latestBlock$,
  //     storedBlockLogs$: result.network.storedBlockLogs$,
  //     worldAddress: result.network.systemContract.address,
  //     worldAbi: result.network.systemContract.abi,
  //     write$: result.network.write$,
  //     recsWorld: result.network.world,
  //   });
  // }

  // 如果是生产环境，动态加载 Google Analytics
  const allowedChainIds = [690, 185, 2818, 8333];
  const currentChainId = await result.network.publicClient.getChainId();

  if (allowedChainIds.includes(currentChainId)) {
    // 动态加载 Google Analytics 脚本
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-WLG8G8V3JB';
    document.head.appendChild(script);

    // 初始化 Google Analytics
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'G-WLG8G8V3JB');
    };
  }
});
