import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { getTokens } from '../testToken/tokenBalance';
import { useWallet } from '@solana/wallet-adapter-react';

interface Token {
    name: string
    amount: string
    symbol: string
    value: string
    mintAddress: string
    h24: string
    imageUrl: string
}

export const WalletBar = () => {

    const { publicKey } = useWallet();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [total, setTotal] = useState<{amountTotal: number, solTotal: number, totalPercentage: string}>()

    useEffect(() => {
        if (!publicKey) return;

        const fetchTokenBalances = async () => {
            console.log("Fetching token...")
            setIsLoading(true);
            try {
                const tokens_fetch = await getTokens(publicKey.toBase58());
                if (Array.isArray(tokens_fetch)) {
                    setTokens(tokens_fetch || []);
                } else {
                    setTokens(tokens_fetch.tokens || []);
                    setTotal({ amountTotal: tokens_fetch.totalValue, solTotal: tokens_fetch.totalValueInSol, totalPercentage: tokens_fetch.totalPercentage.toString() });
                }
            } catch (error) {
                console.error("Failed to fetch token balances:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTokenBalances();
    }, [publicKey]);

    return (
        <Sheet>
            <SheetTrigger className='bg-white/10 rounded-full p-3 hover:bg-primary/20 border-white/10 border hover:border hover:border-primary'>
                <KeyboardArrowDownIcon />
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>
                        <WalletMultiButton style={{ padding: '10px 20px', borderRadius: '8px' }} />
                        <div className='flex flex-col justify-start items-start mt-6'>
                            <span className='text-xl text-white'>${total?.amountTotal ? total?.amountTotal.toFixed(2).toLocaleString() : 0}</span>
                            
                            {/* <span className='text-[12px] text-white/80'>{total?.solTotal ? total?.solTotal.toLocaleString() : 0} SOL</span> */}
                            <span className={total?.totalPercentage ? String(total?.totalPercentage).startsWith('-') ? 'text-red-500 text-[12px]' : 'text-green-500 text-[12px]' : "text-[12px] text-white/80" }>
                            {total?.totalPercentage ? total?.totalPercentage + '%' + (String(total?.totalPercentage).startsWith('-') ? '▼' : '▲') + ' ($' + (+total?.totalPercentage * +total?.amountTotal / 100).toFixed(2) + ')' : '0%'}
                            </span>
                        </div>
                    </SheetTitle>
                    <SheetDescription>
                        <div className="bg-secondary text-white p-6 rounded-lg max-w-md">
                            <div className="mb-6 pb-6 border-white/10 border-b">
                                <h2 className="text-xl font-semibold">Holdings</h2>
                                <p className="text-sm text-gray-400">
                                    {isLoading ? "Loading..." : `${tokens.length} tokens`}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {!publicKey ? 'Connect Wallet' : tokens.map((token, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <img src={token.imageUrl} className="w-8 h-8 rounded-full" />
                                            <div>
                                                <h3 className="font-medium">{token.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {token.amount} {token.symbol}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                ${token.value}
                                            </p>
                                            <p className={String(token.h24).startsWith('-') ? 'text-red-500' : 'text-green-500'}>
                                                {token.h24 + '%' + (String(token.h24).startsWith('-') ? '▼' : '▲') + ' ($' + (+token.h24 * +token.value / 100).toFixed(2) + ')'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet >

    )
}
