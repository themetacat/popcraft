/*
 * The MUD client code is built on top of viem
 * (https://viem.sh/docs/getting-started.html).
 * This line imports the functions we need from it.
 */

import { pad, createPublicClient, fallback, webSocket, http, createWalletClient, Hex, parseEther, ClientConfig, createTestClient, parseGwei } from "viem";
import { createFaucetService } from "@latticexyz/services/faucet";
import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
import { getNetworkConfig } from "./getNetworkConfig";
import { world } from "./world";
import IWorldAbi from "../../public/IWorld.abi.json";
import { createBurnerAccount, getContract, transportObserver, ContractWrite, resourceToHex } from "@latticexyz/common";
import { Subject, share } from "rxjs";
import { resolveConfig } from "@latticexyz/store/internal";
import tcmpopstarConfig from "./tcmpopstar.config";
/*
 * Import our MUD config, which includes strong types for
 * our tables and other config options. We use this to generate
 * things like RECS components and get back strong types for them.
 *
 * See https://mud.dev/templates/typescript/contracts#mudconfigts
 * for the source of this information.
 */
import mudConfig from "../../../contracts/mud.config";
import { useEffect } from "react";


export type SetupNetworkResult = {
  world: any;
  components: any;
  playerEntity: any;
  publicClient: any;
  walletClient: any;
  latestBlock$: any;
  storedBlockLogs$: any;
  waitForTransaction: any;
  worldContract: any;
  systemContract: any;
  palyerAddress: any;
  write$: any;
  write_sub: any;
  abi: any;
  clientOptions: any;
  maxFeePerGas: any;
  maxPriorityFeePerGas: any
  chainId: any
};
export async function setupNetwork(): Promise<SetupNetworkResult> {
  return new Promise<SetupNetworkResult>((resolve, reject) => {
    const networkConfigPromise = getNetworkConfig();
    networkConfigPromise.then(networkConfig => {
      // const baseUrl = "https://pixelaw-game.vercel.app";
      const passedValue = localStorage.getItem("manifest") as any;
      // 使用模板字符串拼接字符串
      const fullPath = `https://pixelaw-game.vercel.app/${passedValue?.replace("BASE/", "")}`;

      /*
       * Create a viem public (read only) client
       * (https://viem.sh/docs/clients/public.html)
       */
      const clientOptions = {
        chain: networkConfig.chain,
        transport: transportObserver(fallback([webSocket(), http()])),
        pollingInterval: 3000,
      } as const satisfies ClientConfig;
      const publicClient = createPublicClient(clientOptions);
      
      /*
       * Create a temporary wallet and a viem client for it
       * (see https://viem.sh/docs/clients/wallet.html).
       */
      const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
      
      // const burnerAccount = createBurnerAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
      const burnerWalletClient = createWalletClient({
        ...clientOptions,
        account: burnerAccount,
      });


      /*
       * Create an observable for contract writes that we can
       * pass into MUD dev tools for transaction observability.
       */
      const write$ = new Subject<ContractWrite>();
// console.log(networkConfig.worldAddress,'-------------------')
      /*
      * Create an object for communicating with the deployed World.
      */
      
      const worldContract = getContract({
        address: networkConfig.worldAddress as Hex, 
        abi: IWorldAbi,
        publicClient,
        walletClient: burnerWalletClient,
        onWrite: (write) => write$.next(write),
      });

      /*
       * Create an object for communicating with the deployed World.
       */
      const appName = localStorage.getItem('manifest')  as any
      
      const parts = appName?.split("/") as any;
      let worldAbiUrl:any;
      // console.log(parts[0]); // 输出 "Base"
      if(appName){
        if(parts[0] === 'BASE'){
          worldAbiUrl = "https://pixelaw-game.vercel.app/"+`${parts[1].replace(/\.abi\.json/g, '')}`+".abi.json" as any;
        }else{
          worldAbiUrl =appName
        }
      }else{
        worldAbiUrl="https://pixelaw-game.vercel.app/Snake.abi.json"
      }

      // add new chain: change here
      let indexerUrl = ""
      let maxFeePerGas = parseGwei('0')
      let maxPriorityFeePerGas = parseGwei('0')
      if (networkConfig.chain.id === 690) {
        maxFeePerGas = parseGwei('0.000106')
        maxPriorityFeePerGas = parseGwei('0.0001')
        indexerUrl = "https://popcraft-indexer.pixelaw.world/";
      }else if(networkConfig.chain.id === 31338){
        indexerUrl = "https://indexerdev.pixelaw.world/";
      }else if(networkConfig.chain.id === 185){
        indexerUrl = "https://indexermint.pixelaw.world/";
        maxFeePerGas = parseGwei('0.00104')
        maxPriorityFeePerGas = parseGwei('0.001')
      }else if(networkConfig.chain.id === 2818){
        indexerUrl = "https://indexermorph.pixelaw.world/";
        maxFeePerGas = parseGwei('0.0021')
        maxPriorityFeePerGas = parseGwei('0.001')
      }else if(networkConfig.chain.id === 8333){
        indexerUrl = "https://indexerb3.pixelaw.world/";
        maxFeePerGas = parseGwei('0.00105')
        maxPriorityFeePerGas = parseGwei('0.0005')
      }else if(networkConfig.chain.id === 8453){
        indexerUrl = "https://indexerbase.pixelaw.world/";
        maxPriorityFeePerGas = parseGwei('0.0001')
      }else if(networkConfig.chain.id === 216){
        indexerUrl = "https://mud.happy.tech/";
      }else if(networkConfig.chain.id === 177){
        indexerUrl = "https://indexerhashkey.pixelaw.world"
      }
      // else if(networkConfig.chain.id === 17069){
      //   indexerUrl = "https://indexertest.pixelaw.world/";
      // }
  
      fetch(worldAbiUrl)
    
        .then(response => response.json())
        .then(abi => {
          // 将获取到的ABI作为contract参数传递
          
          const systemContract = getContract({
            address: networkConfig.worldAddress as Hex,
            abi:abi,
            publicClient,
            walletClient: burnerWalletClient,
            onWrite: (write) => write$.next(write),
          });

          /*
           * Sync on-chain state into RECS and keeps our client in sync.
           * Uses the MUD indexer if available, otherwise falls back
           * to the viem publicClient to make RPC calls to fetch MUD
           * events from the chain.
           */

          syncToRecs({
            world,
            config: mudConfig,
            address: networkConfig.worldAddress as Hex,
            publicClient,
            startBlock: BigInt(networkConfig.initialBlockNumber),
            indexerUrl: indexerUrl,
            tables: resolveConfig(tcmpopstarConfig).tables,
            filters: [
              {
                tableId: resourceToHex({ type: "table", namespace: "", name: "App" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "", name: "AppName" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "", name: "Instruction" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "", name: "Alert" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "TCMPopStar" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "TokenBalance" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "RankingRecord" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "GameRecord" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "StarToScore" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "DayToScore" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "Token" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "GameFailedRecord" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "Plants" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "PlantsLevel" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "PlayerPlantingRecord" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "CurrentPlayerPlants" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "TotalPlants" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "PriTokenPrice" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "UserBenefitsToken" }),
              },
              {
                tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "NFTToTokenDiscount" }),
              },
              ...(networkConfig.chain.id === 2818 || networkConfig.chain.id === 31337 || networkConfig.chain.id === 177 
                ? [
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "SeasonTime" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "CurrentSeasonDimension" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "WeeklyRecord" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "SeasonPlantsRecord" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "DailyGames" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "GamesRewardsScores" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "StreakDays" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "ComboRewardGames" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "NFTRewards" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "InviterV2" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "InviteCodeToInviter" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "PlayerToInviteV2" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "InvitationScoreRecord" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "MorphBlack" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "MorphBlackRewards" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "GPConsumeValue" }) },
                  { tableId: resourceToHex({ type: "table", namespace: "popCraft", name: "PlantsToGP" }) },
                ]
                : [])
            ],
          }).then(({ components, latestBlock$, storedBlockLogs$, waitForTransaction }) => {
            /*
             * If there is a faucet, request (test) ETH if you have
             * less than 1 ETH. Repeat every 20 seconds to ensure you don't
             * run out.
             */
            const account_addr = burnerWalletClient.account.address
            
              const requestDrip = async () => {
                const [account] = await window.ethereum!.request({
                  method: "eth_accounts",
                });
                if (!account) {
                  return
                }
                
                const balance = await publicClient.getBalance({ address: account });
                console.info(`[Dev Faucet]: Player balance -> ${balance}`);
                const lowBalance = balance < parseEther("20");
                if (lowBalance) {
                  const testClient = createTestClient({
                    // ...clientOptions,
                    chain: networkConfig.chain,
                    mode: 'anvil',
                    transport: transportObserver(fallback([webSocket(), http()])),
                  })
                  console.info("[Dev Faucet]: Balance is low, dripping funds to player");
                  await testClient.setBalance({ address: account, value: parseEther('100') });
                };
              };
     
              async function sendPostRequest() {
                const balance = await publicClient.getBalance({ address: account_addr });
                console.info(`[Dev Faucet]: Player balance -> ${balance}`);
                const lowBalance = balance < parseEther("0.001");
                if(lowBalance){
                  console.info("[Dev Faucet]: Balance is low, dripping funds to player");
                  const url = 'https://17001-faucet.quarry.linfra.xyz/trpc/drip';
                
                  const data = {
                      address: account_addr
                  };
              
                  const response = await fetch(url, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(data)
                  });
              
                  const responseData = await response.json();
                  console.log(responseData);
                }
               
            }
            if(networkConfig.chain.id === 31338 || networkConfig.chain.id === 31337){
              requestDrip();
              setInterval(requestDrip, 5000)
            }
            // else if(networkConfig.chain.id === 17069){
            //   sendPostRequest();
            //   setInterval(sendPostRequest, 40000)
            // }

            resolve({
              world,
              components,
              playerEntity: encodeEntity({ address: "address" }, { address: burnerWalletClient.account.address }),
              publicClient,
              walletClient: burnerWalletClient,
              latestBlock$,
              storedBlockLogs$,
              waitForTransaction,
              worldContract,
              systemContract,
              palyerAddress:burnerWalletClient.account.address,
              write$: write$.asObservable().pipe(share()),
              write_sub: write$,
              abi: abi,
              clientOptions,
              maxFeePerGas,
              maxPriorityFeePerGas,
              chainId: networkConfig.chain.id
            });
          
          }).catch(reject);
        })
        .catch(reject);
    }).catch(reject);
  
  });
}
