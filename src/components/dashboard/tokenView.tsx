import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { createChart, ColorType } from 'lightweight-charts';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import XIcon from '@mui/icons-material/X';
import TelegramIcon from '@mui/icons-material/Telegram';
import { buy, getMeme, getSPLTokenBalance, sell } from '../testToken/swapfunction';
import { useWallet } from '@solana/wallet-adapter-react';

type StatItem = {
  label: string;
  oppositeLabel: string;
  buyPercentage: number;
  sellPercentage: number;
  buyTag: number;
  sellTag: number;
  timeFrame: string;
}

export default function TradingInterface() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [pairData, setPairData] = useState<any>(null);
  const [orderAmount, setOrderAmount] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [stats, setStats] = useState<StatItem[]>([]);
  const { publicKey, sendTransaction } = useWallet();
  const [swap, setSwap] = useState<'Buy' | "Sell">('Buy');
  const [XTokenMint, setXTokenMint] = useState<string>('');
  const [XSol, setXSol] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [updateBal, setUpdateBal] = useState<boolean>(false);

  useEffect(() => {
    if (location.state && location.state.pairData) {
      setPairData(location.state.pairData);
      setPrice(parseFloat(location.state.pairData.priceUsd));
      updateStats(location.state.pairData);
    }
  }, [location.state]);

  useEffect(() => {
    if (pairData) {
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
      const dummyData = [
        { time: '2023-01-01', open: 10, high: 15, low: 8, close: 12 },
        { time: '2023-01-02', open: 12, high: 17, low: 10, close: 15 },
      ];
      candlestickSeries.setData(dummyData);

      // Set up interval for periodic updates
      const intervalId = setInterval(fetchData, 5000); // Update every 5 seconds

      return () => {
        chart.remove();
        clearInterval(intervalId);
      };
    }
  }, [pairData]);

  useEffect(() => {
    const get = async () => {
      if (!pairData) return;
      if (!publicKey) { setXSol('0'); setXTokenMint('0'); return; }
      try {
        console.log("checking balance")
        const Xdegen_mint = '3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce';
        const getXdegenTokenMint = await getMeme(pairData.baseToken.address);
        const xXSol = await getSPLTokenBalance(publicKey, Xdegen_mint);
        if (!getXdegenTokenMint) {
          setXTokenMint('0')
        } else {
          const xXToken = await getSPLTokenBalance(publicKey, getXdegenTokenMint);
          setXTokenMint(xXToken);
        }
        if (!xXSol) {
          setXSol('0')
        } else {
          setXSol(xXSol);
        }
      } catch (error) {
        console.error("Failed to fetch trading :", error);
      }
    };
    get();
  }, [pairData, publicKey, updateBal]);

  const fetchData = async () => {
    if (!pairData) return;

    try {
      // Replace with your actual API endpoint
      const response = await fetch(`https://api.example.com/trading-stats/${pairData.pairAddress}`);
      const data = await response.json();

      setPrice(data.price);
      updateStats(data);
    } catch (error) {
      console.error("Failed to fetch trading statistics:", error);
    }
  };

  const updateStats = (data: any) => {
    const timeFrames = ['m5', 'h1', 'h6', 'h24'];
    const newStats = timeFrames.map(tf => {
      const buys = data.txns[tf].buys;
      const sells = data.txns[tf].sells;
      const total = buys + sells;
      const buyPercentage = (buys / total) * 100;
      const sellPercentage = (sells / total) * 100;
      return {
        label: "Buys",
        oppositeLabel: "Sells",
        buyPercentage,
        sellPercentage,
        buyTag: buys,
        sellTag: sells,
        timeFrame: tf,
      };
    });
    setStats(newStats);
  };
  const setOption = (option: 'Buy' | 'Sell') => {
    setSwap(option)
  }

  const handleBuy = async () => {
    if (!publicKey) {
      alert('Please connect your wallet!');
      return;
    }
    try {
      setLoading(true)
      console.log(pairData.baseToken)
      const price = parseFloat(parseFloat(pairData.priceNative).toFixed(9))
      const tokenAmount = +orderAmount / parseFloat(parseFloat(pairData.priceNative).toFixed(9));
      const tokenName = pairData.baseToken.symbol
      const tokenMint = pairData.baseToken.address
      const buyNow = await buy(+orderAmount, publicKey, tokenName, tokenMint, tokenAmount, sendTransaction)
      console.log(buyNow)
      console.log(`Buying ${orderAmount} ${pairData?.baseToken.symbol} at ${price}`);
    } catch (error) {
      console.log(error)
    } finally {
      if (updateBal) {
        setUpdateBal(false);
      } else {
        setUpdateBal(true);
      }
      setLoading(false);
    }
  };

  const handleSell = async () => {
    if (!publicKey) {
      alert('Please connect your wallet!');
      return;
    }
    try {
      setLoading(true)
      console.log(pairData.baseToken)
      const price = parseFloat(parseFloat(pairData.priceNative).toFixed(9))
      const xSolAmount = +orderAmount * parseFloat(parseFloat(pairData.priceNative).toFixed(9));
      const sellNow = await sell(xSolAmount, publicKey, pairData.baseToken.address, +orderAmount, sendTransaction)
      console.log(sellNow)
      console.log(`Selling ${orderAmount} ${pairData?.baseToken.symbol} at ${price}`);
    } catch (error) {
      console.log(error)
    } finally {
      if (updateBal) {
        setUpdateBal(false);
      } else {
        setUpdateBal(true);
      }
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const getTimeFrameLabel = (tf: string) => {
    switch (tf) {
      case 'm5': return '5m';
      case 'h1': return '1h';
      case 'h6': return '6h';
      case 'h24': return '24h';
      default: return tf;
    }
  };

  if (!pairData) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className='flex flex-col w-full h-full bg-secondary'>
      <h1 className="text-2xl font-bold mb-4 text-white p-4">{pairData.baseToken.symbol}/{pairData.quoteToken.symbol}</h1>
      <div className="flex items-start justify-start gap-10 min-h-screen bg-secondary text-white p-4">
        <div className='flex flex-col gap-4'>
          <div className='bg-background p-4 rounded-xl'>
            <div id="chart" className="mb-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-background p-4 rounded-lg">
              <span className="flex space-x-2 mb-4">
                <XIcon />
                <TelegramIcon />
              </span>

              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-white/20">
                <div>
                  <p className="text-gray-400 text-sm">USD price</p>
                  <p className="text-sm font-normal">${price !== null ? price.toFixed(6) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{pairData.quoteToken.symbol} Price</p>
                  <p className="text-sm font-normal">{parseFloat(pairData.priceNative).toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Supply</p>
                  <p className="text-sm font-normal">{(pairData.fdv / parseFloat(pairData.priceUsd)).toFixed(0)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 justify-start">
                <div>
                  <p className="text-gray-400 text-sm">Liquidity</p>
                  <p className="text-sm font-normal">${pairData.liquidity.usd.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Market cap</p>
                  <p className="text-sm font-normal">${pairData.fdv.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">{pairData.pairAddress.slice(0, 4)}...{pairData.pairAddress.slice(-4)}</div>
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"></path></svg>
              </div>

              <div className="flex items-center space-x-2">
                <p className="font-semibold">{pairData.dexId}</p>
                <span className="text-green-400 text-sm">Verify profile</span>
              </div>
            </div>

            <Card className="w-full bg-background text-white border-b border-secondary">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {stats.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs text-[#666666]">
                        <p>{item.label} ({getTimeFrameLabel(item.timeFrame)})</p>
                        <p>{item.oppositeLabel}</p>
                      </div>
                      <div className="flex justify-between text-xs text-[#666666]">
                        <p>{formatNumber(item.buyTag)}</p>
                        <p>{formatNumber(item.sellTag)}</p>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full flex"
                        >
                          <div
                            className="h-full bg-[#319631]"
                            style={{ width: `${item.buyPercentage}%` }}
                          ></div>
                          <div
                            className="h-full bg-[#830f0f]"
                            style={{ width: `${item.sellPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className='p-4 rounded-xl bg-background w-full'>
          <div className='py-6'>
            <div className="flex space-x-4 mb-4 w-full">
              <Button onClick={() => setOption('Buy')} className="bg-blue-500 hover:bg-blue-600 w-full" disabled={loading}>Buy</Button>
              <Button onClick={() => setOption('Sell')} className="bg-red-500 hover:bg-red-600 w-full" disabled={loading}>Sell</Button>
            </div>
            {swap === 'Buy' ?
              <div>
                <div className="grid grid-cols-5 justify-center items-center gap-4 mb-4">
                  {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((amount, index) => (
                    <Button key={index} className='flex text-[12px] justify-center w-auto  items-center gap-2 bg-secondary rounded-full hover:bg-white/10 cursor-pointer' onClick={() => setOrderAmount(amount.toString())} disabled={loading}>
                      <img src="/images/solana.svg" alt='solana' />{amount}
                    </Button>
                  ))}
                </div>
              </div> :
              ""}
            <Input
              type="number"
              placeholder={swap === "Buy" ? "Amount of XDEGEN SOL" : `Amount of ${pairData.baseToken.symbol}`}
              value={orderAmount}
              onChange={(e) => setOrderAmount(e.target.value)}
              className="mb-4 text-white border border-white/30 focus:border-white/40 rounded-full overflow-hidden"
            />
            <div className='flex flex-col gap-2'>
              <Button onClick={swap === 'Buy' ? handleBuy : handleSell} disabled={swap === 'Sell' && XTokenMint === '0' || swap === 'Buy' && XSol === '0' || orderAmount === '' || loading} className={swap === 'Sell' ? "bg-red-500 hover:bg-red-600 w-full rounded-full" : "bg-blue-500 hover:bg-blue-600 w-full rounded-full"}>{loading ? 'Processing...' : swap}</Button>
              <p className='text-white/70 text-[12px]'>{swap === 'Buy' ? `XDEGEN SOL: ${XSol}` : `XDEGEN ${pairData.baseToken.symbol}: ${XTokenMint}`}</p>
              {/* <p className='text-white/70 text-[12px]'>Once you click on Quick buy, your transaction is sent immediately.</p> */}
            </div>
          </div>
          <div className="border-t border-secondary py-4 flex gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <a href="/setting">Advanced settings</a>
          </div>
        </div>
      </div>
    </div>
  );
}