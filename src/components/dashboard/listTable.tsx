
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Check, X } from "lucide-react";
import XIcon from '@mui/icons-material/X';
import TelegramIcon from '@mui/icons-material/Telegram';

interface Pair {
  id: string;
  created: string;
  liquidity: string;
  initialLiquidity: number;
  marketCap: string;
  fees: number;
  volume: string;
  auditResult: boolean;
  socialEnabled: boolean;
}

export default function CryptoListing() {
    const navigate = useNavigate();

    const pairs: Pair[] = [
        { id: "SHIB/SOL", created: "6h", liquidity: "$519.5K", initialLiquidity: 40, marketCap: "$2.75K", fees: 1, volume: "$0", auditResult: true, socialEnabled: false },
        { id: "DOGE/SOL", created: "8h", liquidity: "$423.7K", initialLiquidity: 40, marketCap: "$2.74K", fees: 1, volume: "$0", auditResult: true, socialEnabled: true },
        { id: "FLOKI/SOL", created: "9h", liquidity: "$325.1K", initialLiquidity: 30, marketCap: "$1.95K", fees: 2, volume: "$1K", auditResult: false, socialEnabled: true },
        { id: "SAMO/SOL", created: "10h", liquidity: "$710.2K", initialLiquidity: 50, marketCap: "$3.12K", fees: 1, volume: "$0", auditResult: true, socialEnabled: false },
        { id: "HOGE/SOL", created: "12h", liquidity: "$254.9K", initialLiquidity: 35, marketCap: "$1.64K", fees: 1, volume: "$0", auditResult: false, socialEnabled: true },
        { id: "KITTY/SOL", created: "14h", liquidity: "$480.7K", initialLiquidity: 45, marketCap: "$2.58K", fees: 1, volume: "$0", auditResult: true, socialEnabled: false },
    ];

    const handleRowClick = (pairId: string) => {
        navigate(`/trading/${encodeURIComponent(pairId)}`);
    };

    return (
        <div className="p-6 space-y-4 text-gray-100">
            <div className="flex justify-start items-start flex-col">
                <h1 className="text-3xl lg:text-4xl font-bold text-white">New Pairs</h1>
                <p className="text-sm ">New token pairs are updated in real-time</p>
            </div>
            <div className="overflow-x-auto">
                <Table className="rounded-lg border border-secondary">
                    <TableHeader className="bg-background rounded-lg my-2 border-secondary hover:bg-background">
                        <TableRow className="bg-background rounded-lg my-2 border-secondary hover:bg-background">
                            <TableHead className="w-[100px] text-white">Pair Info</TableHead>
                            <TableHead className="text-white">Created</TableHead>
                            <TableHead className="text-white">Liquidity</TableHead>
                            <TableHead className="text-white">Initial Liquidity</TableHead>
                            <TableHead className="text-white">Mkt Cap</TableHead>
                            <TableHead className="text-white">Txns</TableHead>
                            <TableHead className="text-white">Volume</TableHead>
                            <TableHead className="text-white">Audit Result</TableHead>
                            <TableHead className="text-white">Social</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="mt-4 w-full">
                        {pairs.map((pair) => (
                            <TableRow 
                                key={pair.id} 
                                className="border-secondary hover:bg-secondary cursor-pointer" 
                                onClick={() => handleRowClick(pair.id)}
                            >
                                <TableCell className="font-medium">{pair.id}</TableCell>
                                <TableCell>{pair.created}</TableCell>
                                <TableCell>{pair.liquidity}</TableCell>
                                <TableCell>{pair.initialLiquidity}</TableCell>
                                <TableCell>{pair.marketCap}</TableCell>
                                <TableCell>{pair.fees}</TableCell>
                                <TableCell>{pair.volume}</TableCell>
                                <TableCell className="flex gap-4">
                                    <div>
                                        {pair.auditResult ? (
                                            <div>
                                                <Check className="text-green-500" />
                                                Mint auth disabled
                                            </div>
                                        ) : (
                                            <div>
                                                <X className="text-red-500" />
                                                Free auth disabled
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center self-center items-center space-x-2 rounded-full border border-white/20 px-4 w-20 h-8">
                                        <a href='https://x.com/' className='rounded-full cursor-pointer' onClick={(e) => e.stopPropagation()}>
                                            <XIcon className='hover:scale-125 transition-all' />
                                        </a>
                                        <a href='https://t.me/' className='rounded-full cursor-pointer' onClick={(e) => e.stopPropagation()}>
                                            <TelegramIcon className='hover:scale-125 transition-all' />
                                        </a>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}