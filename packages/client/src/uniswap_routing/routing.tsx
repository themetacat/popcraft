import { TradeType, CurrencyAmount, Percent, Token, ChainId } from '@uniswap/sdk-core'
import {
    AlphaRouter,
    SwapOptionsUniversalRouter,
    SwapRoute,
    SwapType,
    nativeOnChain,
} from '@uniswap/smart-order-router'
import {
    getMainnetProvider,
} from './providers'
import { fromReadableAmount } from './conversion'
import {
    TOKEN_MAP
} from './constants'
export async function generateRoute(tokenAddress: string, amount: number): Promise<SwapRoute | null> {
    const router = new AlphaRouter({
        chainId: ChainId.REDSTONE,
        provider: getMainnetProvider(),
    })
    const currencyIn = nativeOnChain(690)
    const options: SwapOptionsUniversalRouter = {
        type: SwapType.UNIVERSAL_ROUTER,
        recipient: "0xdfa57287c291e763a9452738b67ac56179ab5f69",
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
