import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { StdFee } from '@cosmjs/stargate';
import { ParaProtoSigner } from '@getpara/cosmjs-v0-integration';
import Para, { Environment } from '@getpara/react-sdk';
import React, { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';

type Env = {
  contract: string
  rpc: string
  apiKey: string
  environment: Environment
}

const env : Env = {
  contract: 'CHANGEME',
  rpc : 'CHANGEME',
  apiKey : 'CHANGEME',
  environment : Environment.PRODUCTION,
}

const para = new Para(env.environment, env.apiKey);

const openPopup = (url : string) => {
  return window.open(url, '_blank', 'popup=true,width=400');
}

const getWallet = () : string | undefined => {
  const wallet = para.getWalletsByType('COSMOS').at(0)
  return wallet ? para.getDisplayAddress(wallet.id) : undefined
}

const Main = () : JSX.Element => {
  const [email, setEmail] = useState('')
  const [otp, setOTP] = useState('')
  const [needsOTP, setNeedsOTP] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<string | undefined>(undefined)

  const updateEmail = useCallback(
    (e: { target: { value: React.SetStateAction<string>; }; }) => {
      setEmail(e.target.value)
    },
    [setEmail]
  )

  const updateOTP = useCallback(
    (e: { target: { value: React.SetStateAction<string>; }; }) => {
      setOTP(e.target.value)
    },
    [setEmail]
  )

  const handleConnect = useCallback(async (email: string) => {
    setConnectedWallet(undefined)
    setNeedsOTP(false)

    try {
      console.log(`Checking if user exists for email ${email}`)
      const userFound = await para.checkIfUserExists({ email })

      if(!userFound) {
        console.log('Creating user')
        await para.createUser({ email });
        console.log('Awaiting OTP')
        setNeedsOTP(true)
      } else {
        console.log('Initiating user login')
        const link = await para.initiateUserLogin({ email });

        const popup = openPopup(link)

        if(popup) {
          console.log('Waiting for login')

          const hasWallet = await para.waitForLoginAndSetup({
            popupWindow: popup
          });

          if (!hasWallet || hasWallet.isError || !hasWallet.isComplete) {
            console.error('No wallet after login')
          } else {
            const wallet = getWallet()

            if(wallet) {
              console.log('Logged in')
              setConnectedWallet(wallet)
            } else {
              console.error('No wallet in the para instance')
            }
          }        
        } else {
          console.error("Could not open popup")
          return
        }
      }
    } catch(e) {
      console.error(`Error when logging in: ${JSON.stringify(e)}`)
    }
  }, [
    openPopup,
    setConnectedWallet,
    setNeedsOTP
  ]);

  const handleVerify = useCallback(async (verificationCode: string) => {
    try {
      console.log('Verifying OTP')
      const link = await para.verifyEmail({ verificationCode })

      console.log('Waiting for verification popup')
      const popup = openPopup(link);

      if(popup) {
        console.log('Waiting for passkey')
        await para.waitForPasskeyAndCreateWallet();

        const wallet = getWallet()

        if(wallet) {
          console.log('Logged in')
          setConnectedWallet(wallet)
          setNeedsOTP(false)
        } else {
          console.error('No wallet in the para instance')
        }
      } else {
        console.error("Could not open verification popup")
      }
    } catch(e) {
      console.error(`Error when verifying: ${JSON.stringify(e)}`)
    }

    return false
  }, [
    email,
    openPopup,
    setConnectedWallet,
    setNeedsOTP
  ]);

  const sendTx = useCallback(
    async (address: string) => {
      const signer = new ParaProtoSigner(para, 'sge')
      const client = await SigningCosmWasmClient.connectWithSigner(env.rpc, signer)

      console.log('Broadcasting tx ...')
      const fee : StdFee = {
        amount: [{ amount: '5000', denom: 'usge' }],
        gas: '500000'
      }

      const res = client.execute(
        address,
        env.contract,
        { hi: {} },
        fee,
        'auto'
      )

      console.log(`TX result: ${JSON.stringify(res)}`)
    },
    []
  )
  
  return (
    <>
      <div>
        Hello User
      </div>

      { connectedWallet
          ? (
              <>
                <div>
                  You're connected with {connectedWallet}
                </div>

                <div>
                  <button onClick={() => { setConnectedWallet(undefined) }}>
                    Disconnect
                  </button>
                </div>

                <div>
                  <button onClick={() => { sendTx(connectedWallet) }}>
                    Send a transaction
                  </button>
                </div>
              </>
            )
          : (
              <>
                <div>
                  Type your email to start
                </div>

                <div>
                  <input placeholder='Email' type='text' value={email} onChange={updateEmail} />
                </div>

                <div>
                  <button
                    disabled={email === ''}
                    onClick={() => handleConnect(email)}
                  >
                    Connect wallet
                  </button>
                </div>

                { needsOTP &&
                    <>
                      <div>
                        <input placeholder='OTP' type='text' value={otp} onChange={updateOTP} />
                      </div>

                      <button
                        disabled={otp.length !== 6}
                        onClick={() => handleVerify(otp)}
                      >
                        Verify
                      </button>
                    </>
                }
              </>
            )
      }
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <Main />
);

