#!/bin/bash

set -e

echo -e "Check if anvil is running, if not will try to start, since all subsequent processes rely on it."
if [ $(lsof -i:8545 | grep anvil -c) -eq 0 ]
then
    nohup anvil --fork-url https://happy-testnet-sepolia.rpc.caldera.xyz/http --chain-id 31337 --block-time 1 > ./anvil.log 2>&1 &
    echo -e "anvil started successfully!"
fi

RPC_URL="http://127.0.0.1:8545"
CHAIN_ID="31337"

for arg in "$@"; do
    # Use '=' to separate key-value pairs
    key=$(echo "$arg" | cut -d '=' -f1)
    value=$(echo "$arg" | cut -d '=' -f2-)
    
    # Process based on keys
    case $key in
        RPC_URL)
            RPC_URL=$value
            ;;
        CHAIN_ID)
            CHAIN_ID=$value
            ;;
    esac
done

echo -e "Run 'pnpm mud deploy' to deploy contracts to RPC , which anvil listening on."
cd packages/contracts
pnpm mud deploy --rpc $RPC_URL

WORLD_ADDRESS=$(cat ./worlds.json | jq -r --arg chain_id $CHAIN_ID '.[$chain_id].address')

echo -e "Run 'pnpm vite' to start the frontend server of PixeLAW Core, which will listening on http://127.0.0.1:3000."
cd ../client

vite_p_total=`ps -ef | grep vite.js | grep -v grep | wc -l`
if [ $vite_p_total -eq 0 ]
then
    pnpm vite > /dev/null 2>&1 &
fi

echo -e "Congratulations! Everything is ok! Just visit http://127.0.0.1:3000 to play."
