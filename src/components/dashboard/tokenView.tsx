import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from "react-router-dom";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign, 
  Activity, 
  Volume2, 
  Target, 
  Settings, 
  CrosshairIcon, 
  LayersIcon, 
  ZoomInIcon,
  ZoomOutIcon,
  BarChartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from 'lucide-react';

import { CustomTooltip } from "../ui/tooltip";
import { Tooltip } from "@mui/material";

import { priceDataService, PriceData } from "../../utils/priceData";

import XIcon from "@mui/icons-material/X";
import TelegramIcon from "@mui/icons-material/Telegram";
import {
  buy,
  getMeme,
  getSPLTokenBalance,
  sell,
  Xdegen_mint,
} from "../testToken/swapfunction";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";

import { PublicKey } from "@solana/web3.js";
import { useAppKitAccount } from "@reown/appkit/react";
import { Button } from '../ui/button';

type StatItem = {
  label: string;
  oppositeLabel: string;
  buyPercentage: number;
  sellPercentage: number;
  buyTag: number;
  sellTag: number;
  timeFrame: string;
};

type CandlestickData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type ChartData = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

const ChartControls = () => {
  const [showGrid, setShowGrid] = useState(true);
  const chartRef = useRef<IChartApi | null>(null);
  const [chartType, setChartType] = useState<"candles" | "line" | "area">(
    "candles"
  );
  const [showVolume, setShowVolume] = useState(true);

  const handleZoomIn = () => {
    if (!chartRef.current) return;

    const timeScale = chartRef.current.timeScale();
    const visibleRange = timeScale.getVisibleRange();
    if (visibleRange) {
      const from = (visibleRange.from as UTCTimestamp) * 1000;
      const to = (visibleRange.to as UTCTimestamp) * 1000;

      const newRange = {
        from: (from + (to - from) * 0.1) / 1000,
        to: (to - (to - from) * 0.1) / 1000,
      };

      timeScale.setVisibleRange({
        from: newRange.from as UTCTimestamp,
        to: newRange.to as UTCTimestamp,
      });
    }
  };

  const handleZoomOut = () => {
    if (!chartRef.current) return;

    const timeScale = chartRef.current.timeScale();
    const visibleRange = timeScale.getVisibleRange();
    if (visibleRange) {
      const from = (visibleRange.from as UTCTimestamp) * 1000;
      const to = (visibleRange.to as UTCTimestamp) * 1000;

      const newRange = {
        from: (from - (to - from) * 0.1) / 1000,
        to: (to + (to - from) * 0.1) / 1000,
      };

      timeScale.setVisibleRange({
        from: newRange.from as UTCTimestamp,
        to: newRange.to as UTCTimestamp,
      });
    }
  };

  const toggleGrid = () => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      grid: {
        vertLines: { visible: !showGrid },
        horzLines: { visible: !showGrid },
      },
    });
    setShowGrid(!showGrid);
  };

  const toggleChartType = (type: "candles" | "line" | "area") => {
    setChartType(type);
  };

  const toggleVolume = () => {
    setShowVolume((prevShowVolume) => !prevShowVolume);
    // Add logic to toggle volume visibility on the chart if needed
  };

  return (
    <div className="flex items-center gap-2 mb-4 p-2 bg-background/50 rounded-lg">
      <CustomTooltip content="">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="hover:bg-white/10"
        >
          <ZoomInIcon className="h-4 w-4" />
        </Button>
      </CustomTooltip>

      <CustomTooltip content="">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="hover:bg-white/10"
        >
          <ZoomOutIcon className="h-4 w-4" />
        </Button>
      </CustomTooltip>

      <div className="w-[1px] h-6 bg-white/20 mx-2" />

      <CustomTooltip content="">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleChartType("candles")}
          className={`hover:bg-white/10 ${chartType === "candles" ? "bg-white/20" : ""
            }`}
        >
          <BarChartIcon className="h-4 w-4" />
        </Button>
      </CustomTooltip>

      <CustomTooltip content="">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleChartType("line")}
          className={`hover:bg-white/10 ${chartType === "line" ? "bg-white/20" : ""
            }`}
        >
          <TrendingUpIcon className="h-4 w-4" />
        </Button>
      </CustomTooltip>

      <CustomTooltip content="">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleChartType("area")}
          className={`hover:bg-white/10 ${chartType === "area" ? "bg-white/20" : ""
            }`}
        >
          <TrendingDownIcon className="h-4 w-4" />
        </Button>
      </CustomTooltip>

      <div className="w-[1px] h-6 bg-white/20 mx-2" />

      <Tooltip title="Toggle Volume">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVolume}
          className={`hover:bg-white/10 ${showVolume ? "bg-white/20" : ""}`}
        >
          <LayersIcon className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip title="Toggle Grid">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleGrid}
          className={`hover:bg-white/10 ${showGrid ? "bg-white/20" : ""}`}
        >
          <CrosshairIcon className="h-4 w-4" />
        </Button>
      </Tooltip>
    </div>
  );
};

const formatPrice = (price: number) => price.toFixed(6);
const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", { hour12: false });
};

export default function TokenView() {
  const { id } = useParams();
  const location = useLocation();
  const [pairData, setPairData] = useState<any>(null);
  const [swap, setSwap] = useState<"Buy" | "Sell">("Buy");
  const [orderAmount, setOrderAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [XSol, setXSol] = useState("0");
  const [XTokenMint, setXTokenMint] = useState("0");
  const [updateBal, setUpdateBal] = useState(false);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [priceInput, setPriceInput] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [chartData, setChartData] = useState<CandlestickData[]>([]);

  const [timeframe, setTimeframe] = useState<
    "1m" | "5m" | "15m" | "1h" | "4h" | "1d"
  >("5m");

  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [showVolume, setShowVolume] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [indicators, setIndicators] = useState<string[]>([]);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const { publicKey, sendTransaction } = useWallet();
  const { address } = useAppKitAccount();

  useEffect(() => {
    if (location.state && location.state.pairData) {
      setPairData(location.state.pairData);
      setPrice(parseFloat(location.state.pairData.priceUsd));
      updateStats(location.state.pairData);
    }
  }, [location.state]);

  useEffect(() => {
    if (!chartContainerRef.current || !pairData) return;

    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (e) {
        console.log("Chart already disposed");
      }
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: "#0E1217" },
        textColor: "#D1D4DC",
      },
      grid: {
        vertLines: { color: "rgba(42, 46, 57, 0.6)" },
        horzLines: { color: "rgba(42, 46, 57, 0.6)" },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (timestamp: number) => formatTimestamp(timestamp),
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: "rgba(255, 255, 255, 0.4)",
          style: 0,
        },
        horzLine: {
          width: 1,
          color: "rgba(255, 255, 255, 0.4)",
          style: 0,
        },
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "price",
        precision: 6,
        minMove: 0.000001,
      },
    });

    const volumeSeries = chart.addHistogramSeries({
      color: "#26a69a",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Add price line
    candleSeries.createPriceLine({
      price: currentPrice || 0,
      color: "#2962FF",
      lineWidth: 1,
      lineStyle: 2,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const fetchData = async () => {
      const data = await priceDataService.getPriceData(
        pairData.baseToken.address,
        timeframe
      );

      if (data.length && candleSeriesRef.current) {
        const transformedData = data.map((item) => ({
          time: item.time as UTCTimestamp,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        candleSeriesRef.current.setData(transformedData);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
          chartRef.current = null;
        } catch (e) {
          console.log("Chart already disposed");
        }
      }
    };
  }, [pairData, timeframe]);

  // const currentPrice = price || (pairData ? parseFloat(pairData.priceUsd) : 0);

  // Initialize TradingView chart
  // useEffect(() => {
  //   if (pairData && chartContainerRef.current) {
  //     // Remove existing script
  //     const existingScript = chartContainerRef.current.querySelector('script');
  //     if (existingScript) {
  //       existingScript.remove();
  //     }

  //     // Clear container
  //     chartContainerRef.current.innerHTML = '';

  //     // Create new script
  //     const script = document.createElement('script');
  //     script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
  //     script.type = 'text/javascript';
  //     script.async = true;

  //     const possibleSymbols = [
  //       `${pairData.baseToken.symbol.toUpperCase()}/${pairData.quoteToken.symbol.toUpperCase()}`, // CANCERSOL
  //       `${pairData.baseToken.symbol.toUpperCase()}/SOL`, // CANCER/SOL
  //       `RAYDIUM:${pairData.baseToken.symbol.toUpperCase()}_SOL`, // RAYDIUM:CANCER_SOL
  //       `${pairData.baseToken.symbol.toUpperCase()}USD` // Fallback to USD
  //     ];

  //     console.log('pairData', pairData)
      
  //     script.innerHTML = JSON.stringify({
  //       autosize: true,
  //       symbol: possibleSymbols[0],
  //       interval: '1',
  //       timezone: 'Etc/UTC',
  //       theme: 'dark',
  //       style: '1',
  //       locale: 'en',
  //       toolbar_bg: '#000000',
  //       enable_publishing: false,
  //       backgroundColor: '#000000',
  //       gridColor: '#1a1a1a',
  //       hide_top_toolbar: false,
  //       hide_legend: false,
  //       save_image: false,
  //       container_id: 'tradingview_chart',
  //       onChartReady: function() {
  //         console.log('TradingView chart loaded successfully');
  //       },
  //       studies: []
  //     });

  //     chartContainerRef.current.appendChild(script);
  //   }
  // }, [pairData]);

  useEffect(() => {
    if (!pairData?.baseToken?.address || !candleSeriesRef.current) return;

    const updateChart = (data: PriceData[]) => {
      if (!candleSeriesRef.current) return;

      const lastCandle = data[data.length - 1];

      // High-frequency update of latest candle only
      candleSeriesRef.current.update({
        time: lastCandle.time as UTCTimestamp,
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
      });

      // Full data update at lower frequency to prevent performance issues
      if (!window.requestAnimationFrame) {
        candleSeriesRef.current.setData(
          data.map((item) => ({
            time: item.time as UTCTimestamp,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }))
        );
      }
    };

    // Initial setup
    const setup = async () => {
      const data = await priceDataService.getPriceData(
        pairData.baseToken.address,
        timeframe
      );
      if (data.length && candleSeriesRef.current) {
        candleSeriesRef.current.setData(
          data.map((item) => ({
            time: item.time as UTCTimestamp,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }))
        );
      }
    };

    setup();
    priceDataService.subscribe(pairData.baseToken.address, updateChart);

    return () => {
      priceDataService.unsubscribe(pairData.baseToken.address, updateChart);
    };
  }, [pairData, timeframe]);

  useEffect(() => {
    const get = async () => {
      if (!pairData) return;
      const walletPublicKey = publicKey;

      if (!walletPublicKey) {
        setXSol("0");
        setXTokenMint("0");
        return;
      }
      try {
        console.log("checking balance");
        const Xdegen_mint = "3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce";
        const getXdegenTokenMint = await getMeme(pairData.baseToken.address);
        const xXSol = await getSPLTokenBalance(walletPublicKey, Xdegen_mint);
        if (!getXdegenTokenMint) {
          setXTokenMint("0");
        } else {
          const xXToken = await getSPLTokenBalance(
            walletPublicKey,
            getXdegenTokenMint
          );
          setXTokenMint(xXToken);
        }
        if (!xXSol) {
          setXSol("0");
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
      const response = await fetch(
        `https://api.example.com/trading-stats/${pairData.pairAddress}`
      );
      const data = await response.json();

      setPrice(data.price);
      updateStats(data);
    } catch (error) {
      console.error("Failed to fetch trading statistics:", error);
    }
  };

  const updateStats = (data: any) => {
    const timeFrames = ["m5", "h1", "h6", "h24"];
    const newStats = timeFrames.map((tf) => {
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

  const setOption = (option: "Buy" | "Sell") => {
    setSwap(option);
  };

  const handleBuy = async () => {
    setLoading(true);
    const loadingId = toast.loading("Processing ... ");
    try {
      const walletPublicKey = publicKey ? publicKey : address ? new PublicKey(address) : undefined;

      if (!walletPublicKey) {
        throw new Error("Please connect your wallet!");
      }
      console.log(pairData.baseToken);
      const price = parseFloat(parseFloat(pairData.priceNative).toFixed(9));
      const tokenAmount =
        +orderAmount / parseFloat(parseFloat(pairData.priceNative).toFixed(9));
      const tokenName = pairData.baseToken.symbol;
      const tokenMint = pairData.baseToken.address;
      const buyNow = await buy(
        Xdegen_mint,
        +orderAmount,
        walletPublicKey,
        tokenName,
        tokenMint,
        tokenAmount,
        sendTransaction
      );

      const { signature, confirmation } = buyNow;

      if (confirmation){
        console.log(
          `Buying ${orderAmount} ${pairData?.baseToken.symbol} at ${price}`
        );
        toast.success(
          `Swapped ${orderAmount} XSol to ${tokenAmount} ${pairData?.baseToken.symbol} `,
          {
            action: {
              label: "View Transaction",
              onClick: () => window.open(`https://solscan.io/tx/${signature}?cluster=devnet`, "_blank")
            }
          }
        );
      } else {
        toast.success(
          `Transaction not confirmed`,
          {
            action: {
              label: "View Transaction",
              onClick: () => window.open(`https://solscan.io/tx/${signature}?cluster=devnet`, "_blank")
            }
          }
        );
      }
    } catch (error) {
      toast.warning(error instanceof Error ? error.message : "Transaction might have failed");
      console.log(error);
    } finally {
      if (updateBal) {
        setUpdateBal(false);
      } else {
        setUpdateBal(true);
      }
      setLoading(false);
      toast.dismiss(loadingId);
    }
  };

  const handleSell = async () => {
    setLoading(true);
    const loadingId = toast.loading("Processing ... ");
    try {
      const walletPublicKey = publicKey ? publicKey : address ? new PublicKey(address) : undefined;

      if (!walletPublicKey) {
        throw new Error("Please connect your wallet!");
      }
      console.log(pairData.baseToken);
      const price = parseFloat(parseFloat(pairData.priceNative).toFixed(9));
      const xSolAmount =
        +orderAmount * parseFloat(parseFloat(pairData.priceNative).toFixed(9));
      const sellNow = await sell(
        xSolAmount,
        walletPublicKey,
        pairData.baseToken.address,
        +orderAmount,
        sendTransaction
      );

      const { signature, confirmation } = sellNow;
      
      if(!confirmation.value.err) {
        console.log(
          `Selling ${orderAmount} ${pairData?.baseToken.symbol} at ${price}`
        );
        toast.success(
          `Swapped ${orderAmount} ${pairData?.baseToken.symbol} to ${xSolAmount} XSol `,
          {
            action: {
              label: "View Transaction",
              onClick: () => window.open(`https://solscan.io/tx/${signature}?cluster=devnet`, "_blank")
            }
          }
        );
      } else {
        toast.success(
          `Transaction not confirmed`,
          {
            action: {
              label: "View Transaction",
              onClick: () => window.open(`https://solscan.io/tx/${signature}?cluster=devnet`, "_blank")
            }
          }
        );
      }
    } catch (error) {
      toast.warning(error instanceof Error ? error.message : "Transaction might have failed");
      console.log(error);
    } finally {
      if (updateBal) {
        setUpdateBal(false);
      } else {
        setUpdateBal(true);
      }
      setLoading(false);
      toast.dismiss(loadingId);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
  };

  const getTimeFrameLabel = (tf: string) => {
    switch (tf) {
      case "m5":
        return "5m";
      case "h1":
        return "1h";
      case "h6":
        return "6h";
      case "h24":
        return "24h";
      default:
        return tf;
    }
  };

  const TimeframeSelector = () => (
    <div className="flex gap-2 mb-4">
      {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
        <Button
          key={tf}
          onClick={() => setTimeframe(tf as any)}
          className={`px-3 py-1 ${timeframe === tf ? "bg-blue-500" : "bg-secondary"
            }`}
        >
          {tf}
        </Button>
      ))}
    </div>
  );

  useEffect(() => {
    if (!pairData?.baseToken?.address || !candleSeriesRef.current) return;

    const updateChart = (data: PriceData[]) => {
      if (!candleSeriesRef.current) return;

      const lastCandle = data[data.length - 1];

      // High-frequency update of latest candle only
      candleSeriesRef.current.update({
        time: lastCandle.time as UTCTimestamp,
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
      });

      // Full data update at lower frequency to prevent performance issues
      if (!window.requestAnimationFrame) {
        candleSeriesRef.current.setData(
          data.map((item) => ({
            time: item.time as UTCTimestamp,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }))
        );
      }
    };

    // Initial setup
    const setup = async () => {
      const data = await priceDataService.getPriceData(
        pairData.baseToken.address,
        timeframe
      );
      if (data.length && candleSeriesRef.current) {
        candleSeriesRef.current.setData(
          data.map((item) => ({
            time: item.time as UTCTimestamp,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }))
        );
      }
    };

    setup();
    priceDataService.subscribe(pairData.baseToken.address, updateChart);

    return () => {
      priceDataService.unsubscribe(pairData.baseToken.address, updateChart);
    };
  }, [pairData, timeframe]);

  const toggleIndicator = (indicator: string) => {
    setIndicators((prev) =>
      prev.includes(indicator)
        ? prev.filter((i) => i !== indicator)
        : [...prev, indicator]
    );
  };

  if (!pairData) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Token Info */}
        <div className="w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 flex flex-col h-screen">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={pairData.info?.imageUrl || `https://via.placeholder.com/40/333/fff?text=${pairData.baseToken.symbol.charAt(0)}`}
                alt={pairData.baseToken.name}
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/40/333/fff?text=${pairData.baseToken.symbol.charAt(0)}`;
                }}
              />
              <div>
                <h2 className="text-lg font-bold">{pairData.baseToken.name}</h2>
                <span className="text-gray-400">{pairData.baseToken.symbol.toUpperCase()}/{pairData.quoteToken.symbol.toUpperCase()}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${parseFloat(pairData.priceUsd).toFixed(6)}</div>
              <div className={`flex items-center space-x-1 ${
                (pairData.priceChange?.h24 || 0) > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(pairData.priceChange?.h24 || 0) > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{(pairData.priceChange?.h24 || 0).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Token Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-300">Token Info</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Market Cap</span>
                  </div>
                  <span className="text-sm font-medium">${pairData.marketCap ? pairData.marketCap.toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">24h Volume</span>
                  </div>
                  <span className="text-sm font-medium">${pairData.volume?.h24 ? pairData.volume.h24.toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Liquidity</span>
                  </div>
                  <span className="text-sm font-medium">${pairData.liquidity?.usd ? pairData.liquidity.usd.toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Trading Stats */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-300">Trading Stats</h4>
              <div className="space-y-3">
                {stats.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <p>{item.label} ({getTimeFrameLabel(item.timeFrame)})</p>
                      <p>{item.oppositeLabel}</p>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <p>{formatNumber(item.buyTag)}</p>
                      <p>{formatNumber(item.sellTag)}</p>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full flex">
                        <div
                          className="h-full bg-green-600"
                          style={{ width: `${item.buyPercentage}%` }}
                        ></div>
                        <div
                          className="h-full bg-red-600"
                          style={{ width: `${item.sellPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-300">Social</h4>
              <div className="flex space-x-2">
                <XIcon className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <TelegramIcon className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* Center - Chart */}
        <div className="flex-1 flex flex-col">
          {pairData && (
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={pairData.info?.imageUrl || `https://via.placeholder.com/40/333/fff?text=${pairData.baseToken.symbol.charAt(0)}`}
                    alt={pairData.baseToken.name}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/40/333/fff?text=${pairData.baseToken.symbol.charAt(0)}`;
                    }}
                  />
                  <div>
                    <h2 className="text-xl font-bold">{pairData.baseToken.name}</h2>
                    <span className="text-gray-400">{pairData.baseToken.symbol.toUpperCase()}/{pairData.quoteToken.symbol.toUpperCase()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${parseFloat(pairData.priceUsd).toFixed(6)}</div>
                  <div className={`flex items-center space-x-1 ${
                    (pairData.priceChange?.h24 || 0) > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(pairData.priceChange?.h24 || 0) > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{(pairData.priceChange?.h24 || 0).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 bg-gray-900/30">
            {/* <div className="flex flex-col justify-start items-start">
              <TimeframeSelector />
              <ChartControls />
            </div> */}
            <div
              ref={chartContainerRef}
              className="w-full h-[500px]"
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>

        {/* Right Sidebar - Trading Panel */}
        <div className="w-80 bg-gray-900/50 backdrop-blur-sm border-l border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-lg font-bold mb-4">Trade</h3>
            
            {/* Buy/Sell Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
              <button
                onClick={() => setOption("Buy")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  swap === "Buy"
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setOption("Sell")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  swap === "Sell"
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Market/Limit Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
              <button
                onClick={() => setOrderType('market')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  orderType === 'market'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setOrderType('limit')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  orderType === 'limit'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Limit
              </button>
            </div>

            {/* Price Input (for limit orders) */}
            {orderType === 'limit' && (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Quick Amount Buttons (for Buy) */}
            {swap === "Buy" && (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Quick Amount</label>
                <div className="grid grid-cols-5 gap-2">
                  {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(
                    (amount, index) => (
                      <button
                        key={index}
                        className="flex text-xs justify-center items-center gap-1 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer py-2 px-1 border border-gray-700 hover:border-yellow-400/30 transition-all"
                        onClick={() => setOrderAmount(amount.toString())}
                        disabled={loading}
                      >
                        <img src="/images/solana.svg" alt="solana" className="w-3 h-3" />
                        {amount}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Amount</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  placeholder={
                    swap === "Buy"
                      ? "Amount of XDEGEN SOL"
                      : `Amount of ${pairData.baseToken.symbol}`
                  }
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Slippage */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">Slippage</label>
                <span className="text-sm text-yellow-400">{slippage}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Trade Button */}
            <button
              onClick={swap === "Buy" ? handleBuy : handleSell}
              disabled={
                (swap === "Sell" && XTokenMint === "0") ||
                (swap === "Buy" && XSol === "0") ||
                orderAmount === "" ||
                loading
              }
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                swap === "Buy"
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Processing..." : `${swap} ${pairData.baseToken.symbol.toUpperCase()}`}
            </button>

            {/* Balance Info */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-white/70 text-sm">
                {swap === "Buy"
                  ? `XDEGEN SOL: ${XSol}`
                  : `XDEGEN ${pairData.baseToken.symbol}: ${XTokenMint}`}
              </p>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-2 text-gray-400 hover:text-white cursor-pointer">
              <Settings className="w-4 h-4" />
              <a href="/setting" className="text-sm">Advanced settings</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}