import { TradeType, CurrencyAmount, Percent, Token, ChainId } from '@uniswap/sdk-core'
import {
    AlphaRouter,
    SwapOptionsUniversalRouter,
    SwapRoute,
    SwapType,
    nativeOnChain,
} from '@uniswap/smart-order-router'
import { getMainnetProvider, } from './providers'
import { fromReadableAmount } from './conversion'
import { TOKEN_MAP } from './constants'
import { Pool, SwapRouter, Trade, Route } from "@uniswap/v3-sdk"


export async function generateRoute(tokenAddress: string, amount: number, recipient: string): Promise<SwapRoute | null> {
    
    const router = new AlphaRouter({
        chainId: ChainId.REDSTONE,
        provider: getMainnetProvider(),
    })
    const currencyIn = nativeOnChain(690)
    const options: SwapOptionsUniversalRouter = {
        type: SwapType.UNIVERSAL_ROUTER,
        // recipient: "0xdfa57287c291e763a9452738b67ac56179ab5f69",  //pixeLaw core world contract address
        recipient: recipient,
        slippageTolerance: new Percent(50, 10_000),
        deadlineOrPreviousBlockhash: Math.floor(Date.now() / 1000 + 600),
    };
    const route = await router.route(
        CurrencyAmount.fromRawAmount(
            TOKEN_MAP[tokenAddress],
            fromReadableAmount(
                amount,
                18
            ).toString()
        ),
        currencyIn,
        TradeType.EXACT_OUTPUT,
        options
    )
    return route
}

export async function generateRouteMintChain(tokenAddress: string, amount: number, recipient: string) {
    const tokenIn = TOKEN_MAP["0x4200000000000000000000000000000000000006"];
    const lowerCaseTokenAddress = tokenAddress.toLowerCase()
    const tokenOut = TOKEN_MAP[lowerCaseTokenAddress];
    const outputAmount = amount * 10 ** tokenOut.decimals

    const response = await fetch('https://api.mintswap.finance/api/v2/quote/best-route?tokenIn=0x4200000000000000000000000000000000000006&tokenOut=' + lowerCaseTokenAddress + '&amount=' + outputAmount + '&tradeType=output');
    const data = await response.json();

    const bestRoute = data.data.bestRoutes.route;
    
    const pools = bestRoute.map((pool: any) => {
        
        return new Pool(
            TOKEN_MAP[pool.token0Info.address],
            TOKEN_MAP[pool.token1Info.address],
            pool.fee,
            pool.sqrtPrice,
            pool.liquidity,
            pool.currentTick,
        )
    })
    
    const route = new Route(pools, tokenIn, tokenOut);
    
    const inputAmount = data.data.bestRoutes.quote;    

    const uncheckedTrade = Trade.createUncheckedTrade({
        route: route,
        inputAmount: CurrencyAmount.fromRawAmount(
            tokenIn,
            fromReadableAmount(
                Number(inputAmount),
                18
            )
        ),
        outputAmount: CurrencyAmount.fromRawAmount(
            tokenOut,
            outputAmount,
        ),
        tradeType: TradeType.EXACT_OUTPUT,
    });
    const methodParameters = SwapRouter.swapCallParameters([uncheckedTrade], {
        slippageTolerance: new Percent(50, 100_000), // 5 bips, or 0.05%
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
        recipient: recipient,
    })
    methodParameters.value = inputAmount

    const res = {
        methodParameters: methodParameters,
        price: inputAmount/1e18,
      };
      
    return res
}
