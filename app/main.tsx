import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { StdFee } from '@cosmjs/stargate';
import { ParaProtoSigner } from '@getpara/cosmjs-v0-integration';
import Para, { ParaModal, ParaProvider, useAccount, useClient, useLogout, useWallet } from '@getpara/react-sdk';
import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { env } from './env';
import "@getpara/react-sdk/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const para = new Para(env.environment, env.apiKey);
const queryClient = new QueryClient();


// const Modal = () => {
//   return (
//     <ParaModal
//       para={para}
//       isOpen={true}
//       onClose={() => {}}
//     />
//   )
// }

const Account = () => {
  const { data: account } = useAccount()
  const { data: wallet } = useWallet()
  const { logout } = useLogout()
  const para = useClient()

  console.log(`Is para defined?: ${para !== undefined}`)

  return (
    <>
      <div>
        Hello user.
      </div>

      {account?.isConnected 
        ? <div>
            <div>
              You are currently connected with { wallet?.address }
            </div>

            <div>
              <button onClick={() => { logout() }}>
                Disconnect
              </button>
            </div>
          </div>
        : <div>
            You are currently not connected
          </div>
      }
    </>
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
        <Account />
      </ParaProvider>
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <Main />
);

