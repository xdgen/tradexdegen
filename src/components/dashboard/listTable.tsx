import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { Skeleton } from "../../components/ui/skeleton";

export default function Component() {
    const [pairs, setPairs] = useState<any[]>([]);
    const [filteredPairs, setFilteredPairs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleRowClick = (pair: any) => {
        navigate(`/trading/${pair.pairAddress}`, { state: { pairData: pair } });
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = pairs.filter(
            (pair) =>
                pair.baseToken.symbol.toLowerCase().includes(value) ||
                pair.baseToken.address.toLowerCase().includes(value) ||
                pair.baseToken.name.toLowerCase().includes(value)
        );

        setFilteredPairs(filtered);
    };

    useEffect(() => {
        const fetchPairs = async () => {
            try {
                const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=sol/sol');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setPairs(data.pairs || []);
                setFilteredPairs(data.pairs || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load pairs');
                setLoading(false);
            }
        };

        fetchPairs();
    }, []);

    const formatNumber = (num: number | undefined, prefix: string = '') => {
        if (!num) return 'N/A';
        if (num >= 1e9) return `${prefix}${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${prefix}${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${prefix}${(num / 1e3).toFixed(2)}K`;
        return `${prefix}${num.toFixed(2)}`;
    };

    const formatAge = (timestamp: number | undefined) => {
        if (!timestamp) return 'N/A';
        const diff = Date.now() - timestamp;
        const hours = Math.floor(diff / 3600000);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    const renderPriceChange = (change: number | undefined) => {
        if (change === undefined) return 'N/A';
        const color = change >= 0 ? 'text-green-500' : 'text-red-500';
        const Icon = change >= 0 ? ArrowUpIcon : ArrowDownIcon;
        return (
            <span className={`flex items-center ${color}`}>
                <Icon className="w-4 h-4 mr-1" />
                {Math.abs(change).toFixed(2)}%
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-4 space-y-4 text-white">
                <h1 className="text-2xl font-bold">Token Listing</h1>
                <div className="space-y-2">
                    {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full bg-background" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) return <div className="text-white p-4">{error}</div>;

    return (
        <div className="p-4 space-y-4 text-white">
            <h1 className="text-2xl font-bold">Token Listing</h1>

            {/* Search Bar */}
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by symbol, address, or name"
                className="input-field w-full mb-4 p-2 border border-green-400/40 rounded bg-neutral-800 text-white"
            />

            <div className="overflow-x-auto">
                {filteredPairs.length > 0 ? (
                    <Table className="rounded-lg border border-secondary">
                        <TableHeader className="bg-background rounded-lg my-2 border-secondary hover:bg-background">
                            <TableRow className="bg-background rounded-lg my-2 border-secondary hover:bg-background">
                                <TableHead className="text-left">TOKEN</TableHead>
                                <TableHead className="text-right">PRICE</TableHead>
                                <TableHead className="text-right">AGE</TableHead>
                                <TableHead className="text-right">TXNS</TableHead>
                                <TableHead className="text-right">VOLUME</TableHead>
                                <TableHead className="text-right">MAKERS</TableHead>
                                <TableHead className="text-right">5M</TableHead>
                                <TableHead className="text-right">1H</TableHead>
                                <TableHead className="text-right">6H</TableHead>
                                <TableHead className="text-right">24H</TableHead>
                                <TableHead className="text-right">LIQUIDITY</TableHead>
                                <TableHead className="text-right">MCAP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPairs.map((pair) => (
                                <TableRow
                                    key={pair.pairAddress}
                                    onClick={() => handleRowClick(pair)}
                                    className="cursor-pointer hover:bg-white/10 transition-colors"
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <img
                                                src={pair.info?.imageUrl || '/placeholder.svg'}
                                                alt={pair.baseToken.symbol}
                                                className="w-6 h-6 mr-2 rounded-full"
                                            />
                                            {pair.baseToken.symbol}/{pair.quoteToken.symbol}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">${parseFloat(pair.priceUsd).toFixed(6)}</TableCell>
                                    <TableCell className="text-right">{formatAge(pair.pairCreatedAt)}</TableCell>
                                    <TableCell className="text-right">{(pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0)}</TableCell>
                                    <TableCell className="text-right">{formatNumber(pair.volume?.h24, '$')}</TableCell>
                                    <TableCell className="text-right">{pair.txns?.h24?.buys || 'N/A'}</TableCell>
                                    <TableCell className="text-right">{renderPriceChange(pair.priceChange?.m5)}</TableCell>
                                    <TableCell className="text-right">{renderPriceChange(pair.priceChange?.h1)}</TableCell>
                                    <TableCell className="text-right">{renderPriceChange(pair.priceChange?.h6)}</TableCell>
                                    <TableCell className="text-right">{renderPriceChange(pair.priceChange?.h24)}</TableCell>
                                    <TableCell className="text-right">{formatNumber(pair.liquidity?.usd, '$')}</TableCell>
                                    <TableCell className="text-right">{formatNumber(pair.marketCap, '$')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-center text-white">Token not found or not listed on Xdegen.</p>
                )}
            </div>
        </div>
    );
}
