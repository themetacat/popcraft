import {
    AlphaRouter,
    SwapOptionsUniversalRouter,
    SwapRoute,
    SwapType,
    nativeOnChain,
} from '@uniswap/smart-order-router'
import { TradeType, CurrencyAmount, Percent, Token, ChainId } from '@uniswap/sdk-core'
import { CurrentConfig } from './config'
import {
    getMainnetProvider,
} from './providers'
import { fromReadableAmount } from './conversion'

export async function generateRoute(): Promise<SwapRoute | null> {
    const router = new AlphaRouter({
        chainId: ChainId.REDSTONE,
        provider: getMainnetProvider(),
    })
    // console.log(router);
    // const currencyIn = nativeOnChain(690)

    // const options: SwapOptionsUniversalRouter = {
    //     type: SwapType.UNIVERSAL_ROUTER,
    //     recipient: "0x784844480280ca865ac8ef89bb554283dddff737",
    //     slippageTolerance: new Percent(50, 10_000),
    //     deadlineOrPreviousBlockhash: Math.floor(Date.now() / 1000 + 1800),
    // };

    // const route = await router.route(
    //     CurrencyAmount.fromRawAmount(
    //         CurrentConfig.tokens.out,
    //         fromReadableAmount(
    //             5,
    //             CurrentConfig.tokens.in.decimals
    //         ).toString()
    //     ),
    //     currencyIn,
    //     TradeType.EXACT_OUTPUT,
    //     options
    // )
    // console.log(route);
    return null
}