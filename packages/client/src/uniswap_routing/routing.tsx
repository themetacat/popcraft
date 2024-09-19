import { TradeType, CurrencyAmount, Percent, Token, ChainId } from '@uniswap/sdk-core'
import {
    AlphaRouter,
    SwapOptionsUniversalRouter,
    SwapRoute,
    SwapType,
    nativeOnChain,
} from '@uniswap/smart-order-router'
import { CurrentConfig } from './config'
import {
    getMainnetProvider,
} from './providers'
import { fromReadableAmount } from './conversion'
import {
    TOKEN_MAP
} from './constants'

// function findTokenByAddress(tokenAddress: string): Token | null {
//     const tokens = [
//         USDC_TOKEN,
//         UREA_TOKEN,
//         FERTILIZER_TOKEN,
//         ANTIFREEZE_TOKEN,
//         LUBRICANT_TOKEN,
//         CORN_TOKEN,
//         TOBACCO_TOKEN,
//         PETROLEUM_TOKEN,
//         SAND_TOKEN,
//         YEAST_TOKEN,
//         RATS_TOKEN,
//         BUGS_TOKEN,
//         WETH_TOKEN
//     ]

//     for (const token of tokens) {
//         if (token.address.toLowerCase() === tokenAddress.toLowerCase()) {
//             return token
//         }
//     }
//     return null
// }

export async function generateRoute(tokenAddress: string, amount: number): Promise<SwapRoute | null> {
    const router = new AlphaRouter({
        chainId: ChainId.REDSTONE,
        provider: getMainnetProvider(),
    })
    // console.log(amount);
    const currencyIn = nativeOnChain(690)
    const options: SwapOptionsUniversalRouter = {
        type: SwapType.UNIVERSAL_ROUTER,
        recipient: "0x784844480280ca865ac8ef89bb554283dddff737",
        slippageTolerance: new Percent(50, 10_000),
        deadlineOrPreviousBlockhash: Math.floor(Date.now() / 1000 + 1800),
    };
    // const token = findTokenByAddress(tokenAddress)
    // if (!token) {
    //     throw new Error('Token not found')
    // }
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
    // console.log(route);
    return route
}
