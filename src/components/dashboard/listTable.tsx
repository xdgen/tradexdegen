import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { ChevronDown, ArrowUpDown, Check, X } from "lucide-react"

export default function CryptoListing() {
    const pairs = [
        { id: "USD/SOL", created: "6h", liquidity: "$519.5K", initialLiquidity: 40, marketCap: "$2.75K", fees: 1, volume: "$0", auditResult: true, socialEnabled: false },
        { id: "USD/OL", created: "8h", liquidity: "$423.7K", initialLiquidity: 40, marketCap: "$2.74K", fees: 1, volume: "$0", auditResult: true, socialEnabled: true },
        { id: "USD/SOL", created: "9h", liquidity: "$519.5K", initialLiquidity: 40, marketCap: "$2.75K", fees: 1, volume: "$0", auditResult: false, socialEnabled: true },
        { id: "USD/SOL", created: "10h", liquidity: "$519.5K", initialLiquidity: 40, marketCap: "$2.75K", fees: 1, volume: "$0", auditResult: true, socialEnabled: false },
        { id: "USD/OL", created: "12h", liquidity: "$423.7K", initialLiquidity: 40, marketCap: "$2.74K", fees: 1, volume: "$0", auditResult: false, socialEnabled: true },
    ]

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
                            {/* <TableHead className="w-[100px]"></TableHead> */}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="mt-4 w-full">
                        {pairs.map((pair) => (
                            <TableRow key={pair.id} className="border-secondary hover:bg-secondary">
                                <TableCell className="font-medium">{pair.id}</TableCell>
                                <TableCell>{pair.created}</TableCell>
                                <TableCell>{pair.liquidity}</TableCell>
                                <TableCell>{pair.initialLiquidity}</TableCell>
                                <TableCell>{pair.marketCap}</TableCell>
                                <TableCell>{pair.fees}</TableCell>
                                <TableCell>{pair.volume}</TableCell>
                                <TableCell className="flex gap-4">
                                    <div>
                                        {pair.auditResult ?
                                            <div className="">
                                                <Check className="text-green-500" />
                                                Mint auth
                                                disabled
                                            </div>
                                            :
                                            <div>
                                                <X className="text-red-500" />
                                                Free auth
                                                disabled
                                            </div>
                                        }
                                    </div>
                                    {/* <div>
                                        {pair.socialEnabled ?
                                            <div className="">
                                                <Check className="text-green-500" />
                                                Free auth
                                                disabled
                                            </div>
                                            : <X className="text-red-500" />}
                                    </div> */}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end space-x-2">
                                        <button className="p-1 bg-gray-800 rounded"><ArrowUpDown size={16} /></button>
                                        <button className="p-1 bg-gray-800 rounded"><ChevronDown size={16} /></button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}