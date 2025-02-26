import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { StdFee } from '@cosmjs/stargate';
import { ParaProtoSigner } from '@getpara/cosmjs-v0-integration';
import Para, { ParaModal, ParaProvider } from '@getpara/react-sdk';
import React, { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { env } from './env';
import "@getpara/react-sdk/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const para = new Para(env.environment, env.apiKey);
const queryClient = new QueryClient();


const Modal = () => {
  return (
    <ParaModal
      para={para}
      isOpen={true}
      onClose={() => {}}
    />
  )
}

const Main = () : JSX.Element => {  
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          env: env.environment,
          apiKey: env.apiKey,
        }}
        callbacks={{
          onLogout: (event) => console.log("Logout:", event.detail),
          onLogin: (event) => console.log("Login:", event.detail),
          onSignMessage: (event) => console.log("Message Signed:", event.detail),
        }}
      >
        <div>
          Hello User
        </div>

        <Modal />
      </ParaProvider>
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <Main />
);

