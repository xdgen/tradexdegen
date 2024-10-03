import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createChart, ColorType } from 'lightweight-charts';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import EngineeringIcon from '@mui/icons-material/Engineering';
import { ArrowLeft, Twitter, MessageSquare } from "lucide-react"

// Mock data for the chart
const initialData = [
    { time: '2018-12-22', open: 75.16, high: 82.84, low: 36.16, close: 45.72 },
    { time: '2018-12-23', open: 45.12, high: 53.90, low: 45.12, close: 48.09 },
    { time: '2018-12-24', open: 60.71, high: 60.71, low: 53.39, close: 59.29 },
    { time: '2018-12-25', open: 68.26, high: 68.26, low: 59.04, close: 60.50 },
    { time: '2018-12-26', open: 67.71, high: 105.85, low: 66.67, close: 91.04 },
    { time: '2018-12-27', open: 91.04, high: 121.40, low: 82.70, close: 111.40 },
    { time: '2018-12-28', open: 111.51, high: 142.83, low: 103.34, close: 131.25 },
    { time: '2018-12-29', open: 131.33, high: 151.17, low: 77.68, close: 96.43 },
    { time: '2018-12-30', open: 106.33, high: 110.20, low: 90.39, close: 98.10 },
    { time: '2018-12-31', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
];

const quickBuy = [
    { id: "1", buyOne: '0.25' },
    { id: "2", buyTwo: '0.5' },
    { id: "3", buyThree: '1' },
    { id: "4", buyFour: '2' },
    { id: "5", buyFive: '5' },
    { id: "6", buySix: '10' },
]

export default function TradingInterface() {
    const { id } = useParams<{ id: string }>();
    const [price, setPrice] = useState(0.03420);
    const [orderAmount, setOrderAmount] = useState('');
    const [wallet, setWallet] = useState(null);

    useEffect(() => {
        const chart = createChart(document.getElementById('chart') as HTMLElement, {
            width: 600,
            height: 400,
            layout: {
                background: { type: ColorType.Solid, color: '#09090A' },
                textColor: 'white',
            },
            grid: {
                vertLines: { color: 'rgba(197, 203, 206, 0.1)' },
                horzLines: { color: 'rgba(197, 203, 206, 0.1)' },
            },
        });

        const candlestickSeries = chart.addCandlestickSeries();
        candlestickSeries.setData(initialData);

        return () => {
            chart.remove();
        };
    }, []);

    const connectWallet = async () => {
        console.log('Connecting to Solflare wallet...');
        // Implement Solflare wallet connection logic here
    };

    const handleBuy = () => {
        console.log(`Buying ${orderAmount} ${id} at ${price}`);
    };

    const handleSell = () => {
        console.log(`Selling ${orderAmount} ${id} at ${price}`);
    };

    return (
        <div className='flex flex-col w-full h-full bg-secondary'>
            <h1 className="text-2xl font-bold mb-4 text-white p-4">{id}</h1>
            <div className="flex items-start justify-start gap-10 min-h-screen bg-secondary text-white p-4">
                <div className='flex flex-col gap-4'>
                    <div className='bg-background p-4 rounded-xl'>
                        <div id="chart" className="mb-4"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4 bg-background p-4 rounded-lg">
                            <span className="flex space-x-2 mb-4">
                                <ArrowLeft className="w-4 h-4" />
                                <Twitter className="w-4 h-4" />
                                <MessageSquare className="w-4 h-4" />
                            </span>

                            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-white/20">
                                <div>
                                    <p className="text-gray-400 text-sm">USD price</p>
                                    <p className="text-sm font-normal">0.044</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Sol Price</p>
                                    <p className="text-sm font-normal">0.0284</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Supply</p>
                                    <p className="text-sm font-normal">998M</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 justify-start">
                                <div>
                                    <p className="text-gray-400 text-sm">Liquidity</p>
                                    <p className="text-sm font-normal">$28.3k</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Market cap</p>
                                    <p className="text-sm font-normal">$41.03k</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">B4vF...KcCu</div>
                                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"></path></svg>
                            </div>

                            <div className="flex items-center space-x-2">
                                <p className="font-semibold">RadiumV4</p>
                                <span className="text-green-400 text-sm">Verify profile</span>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4 bg-background p-4 rounded-lg">
                            <div className='flex gap-4 pb-4 border-b border-white/20'>
                                {["0.044", "0.044", "0.044", "0.044"].map((price, index) => (
                                    <div key={index} className="">
                                        <p className="text-gray-400 text-[11px]">USD price</p>
                                        <p className="font-semibold text-[12px]">{price}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: "Buys", oppositeLabel: "Sells", value: 100 },
                                    { label: "Buy Vol", oppositeLabel: "Sell Vol", value: 100 },
                                    { label: "Buyers", oppositeLabel: "Sellers", value: 100 },
                                ].map((item, index) => (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between text-xs text-[#666666]">
                                            <p>{item.label}</p>
                                            <p>{item.oppositeLabel}</p>
                                        </div>
                                        <div className="h-1 bg-[#333333] rounded-full overflow-hidden">
                                            <div
                                                className="h-full w-full bg-gradient-to-r from-70% from-[#319631] to-[#830f0f] to-30%"
                                                style={{ width: `${item.value}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='p-4 rounded-xl bg-background w-full'>
                    <div className='py-6'>
                        <div className="flex space-x-4 mb-4 w-full">
                            <Button onClick={handleBuy} className="bg-blue-500 hover:bg-blue-600 w-full">Buy</Button>
                            <Button onClick={handleSell} className="bg-red-500 hover:bg-red-600 w-full">Sell</Button>
                        </div>
                        <div>
                            <div className="grid grid-cols-5 justify-center items-center gap-4 mb-4">
                                <div className='flex text-[12px] justify-center w-auto items-center gap-2 bg-secondary rounded-full hover:bg-white/10'><img src="/images/solana.svg" alt='solana' />0.5</div>
                                <div className='flex text-[12px] justify-center w-auto items-center gap-2 bg-secondary rounded-full hover:bg-white/10'><img src="/images/solana.svg" alt='solana' />0.5</div>
                                <div className='flex text-[12px] justify-center w-auto items-center gap-2 bg-secondary rounded-full hover:bg-white/10'><img src="/images/solana.svg" alt='solana' />1</div>
                                <div className='flex text-[12px] justify-center w-auto items-center gap-2 bg-secondary rounded-full hover:bg-white/10'><img src="/images/solana.svg" alt='solana' />1.3</div>
                                <div className='flex text-[12px] justify-center w-auto items-center gap-2 bg-secondary rounded-full hover:bg-white/10'><img src="/images/solana.svg" alt='solana' />2</div>
                                <div className='flex text-[12px] justify-center w-auto items-center gap-2 bg-secondary rounded-full hover:bg-white/10'><img src="/images/solana.svg" alt='solana' />5</div>
                                <div className='flex text-[12px] justify-center w-auto items-center gap-2 bg-secondary rounded-full hover:bg-white/10'><img src="/images/solana.svg" alt='solana' />1.5</div>
                                <div className='flex text-[12px] justify-center w-auto items-center gap-2 bg-secondary rounded-full hover:bg-white/10'><img src="/images/solana.svg" alt='solana' />4</div>
                                <div className='flex text-[12px] justify-center w-auto items-center gap-2 bg-secondary rounded-full hover:bg-white/10'><img src="/images/solana.svg" alt='solana' />2.5</div>
                                <div className='flex text-[12px] justify-center w-auto items-center gap-2 bg-secondary rounded-full hover:bg-white/10'><img src="/images/solana.svg" alt='solana' />5</div>
                                <div className='flex text-[12px] justify-center w-auto items-center gap-2 bg-secondary rounded-full hover:bg-white/10'><img src="/images/solana.svg" alt='solana' />5.5</div>
                            </div>
                        </div>
                        <Input
                            type="number"
                            placeholder="Amount to buy or sell"
                            value={orderAmount}
                            onChange={(e) => setOrderAmount(e.target.value)}
                            className="mb-4 text-white border border-white/30 focus:border-white/40 rounded-full overflow-hidden"
                        />
                        <div className='flex flex-col gap-2'>
                            <Button onClick={handleSell} className="bg-green-500 hover:bg-green-600 w-full rounded-full text-black">Quick buy</Button>
                            <p className='text-white/70 text-[12px]'>Once you click on Quick buy, your transaction is sent immediately.</p>
                        </div>
                    </div>
                    <div className="border-t border-secondary py-4 flex gap-4">
                        <EngineeringIcon />
                        <a href="/setting">Advance settings</a>
                    </div>
                </div>
            </div>
        </div>
    );
}