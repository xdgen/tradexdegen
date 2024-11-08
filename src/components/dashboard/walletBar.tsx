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

interface Token {
    name: string
    amount: string
    symbol: string
    value: number
}

interface HoldingsProps {
    tokens: Token[]
}


export default function WalletBar ({ tokens = [
    { name: "Jito staked SOL", amount: "0.870309", symbol: "JitoSOL", value: 159.55 },
    { name: "Dean's List", amount: "10.30313", symbol: "DEAN", value: 159.55 },
    { name: "Solana", amount: "0.147080", symbol: "SOL", value: 159.55 },
    { name: "KIN I", amount: "B4vF...KcCu", symbol: "", value: 159.55 },
    { name: "Wen", amount: "B4vF...KcCu", symbol: "", value: 159.55 },
    { name: "Pyth network", amount: "B4vF...KcCu", symbol: "", value: 159.55 },
] }: HoldingsProps) {

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
                            <span className='text-xl text-white'>$234.74</span>
                            <span className='text-[12px] text-white/80'>1.7784 SOL</span>
                        </div>
                    </SheetTitle>
                    <SheetDescription>
                    <div className="bg-secondary text-white p-6 rounded-lg max-w-md">
                        <div className="mb-6 pb-6 border-white/10 border-b">
                            <h2 className="text-xl font-semibold">Holdings</h2>
                            <p className="text-sm text-gray-400">12 tokens</p>
                        </div>

                        <div className="space-y-4">
                            {tokens.map((token, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <img src='/images/solana.svg' className="w-8 h-8 rounded-full" />
                                        <div>
                                            <h3 className="font-medium">{token.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {token.amount} {token.symbol}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            ${token.value.toFixed(2)}
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
