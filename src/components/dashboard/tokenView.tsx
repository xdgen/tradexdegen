import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
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
  Loader2,
} from "lucide-react";

import { CustomTooltip } from "../ui/tooltip";
import { Tooltip } from "@mui/material";

import { priceDataService, PriceData } from "../../utils/priceData";

import XIcon from "@mui/icons-material/X";
import TelegramIcon from "@mui/icons-material/Telegram";
import { getMeme, getSPLTokenBalance } from "../testToken/swapfunction";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
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
import { TokenParams, useTrade } from '../../hooks/useTrade';

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

// Constants
const XDEGEN_MINT = "3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce";
const BALANCE_REFRESH_INTERVAL = 30000; // 30 seconds
const BALANCE_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  initialDelay: 300
};

// Balance cache to prevent unnecessary re-fetches
const balanceCache = new Map<string, { balance: string; timestamp: number }>();
const CACHE_DURATION = 10000; // 10 seconds

// Optimized ChartControls component
const ChartControls = ({ 
  chartRef, 
  chartType, 
  setChartType, 
  showVolume, 
  setShowVolume,
  showGrid,
  setShowGrid 
}: {
  chartRef: React.RefObject<IChartApi | null>;
  chartType: "candles" | "line" | "area";
  setChartType: (type: "candles" | "line" | "area") => void;
  showVolume: boolean;
  setShowVolume: (show: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
}) => {
  const handleZoomIn = useCallback(() => {
    if (!chartRef.current) return;

    const timeScale = chartRef.current.timeScale();
    const visibleRange = timeScale.getVisibleRange();
    if (visibleRange) {
      const from = (visibleRange.from as UTCTimestamp) * 1000;
      const to = (visibleRange.to as UTCTimestamp) * 1000;
      const rangeDiff = to - from;

      timeScale.setVisibleRange({
        from: (from + rangeDiff * 0.1) / 1000 as UTCTimestamp,
        to: (to - rangeDiff * 0.1) / 1000 as UTCTimestamp,
      });
    }
  }, [chartRef]);

  const handleZoomOut = useCallback(() => {
    if (!chartRef.current) return;

    const timeScale = chartRef.current.timeScale();
    const visibleRange = timeScale.getVisibleRange();
    if (visibleRange) {
      const from = (visibleRange.from as UTCTimestamp) * 1000;
      const to = (visibleRange.to as UTCTimestamp) * 1000;
      const rangeDiff = to - from;

      timeScale.setVisibleRange({
        from: (from - rangeDiff * 0.1) / 1000 as UTCTimestamp,
        to: (to + rangeDiff * 0.1) / 1000 as UTCTimestamp,
      });
    }
  }, [chartRef]);

  const toggleGrid = useCallback(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      grid: {
        vertLines: { visible: !showGrid },
        horzLines: { visible: !showGrid },
      },
    });
    setShowGrid(!showGrid);
  }, [chartRef, showGrid, setShowGrid]);

  const toggleChartType = useCallback((type: "candles" | "line" | "area") => {
    setChartType(type);
  }, [setChartType]);

  const toggleVolume = useCallback(() => {
    setShowVolume(!showVolume);
  }, [showVolume, setShowVolume]);

  const controlButtons = [
    { icon: ZoomInIcon, onClick: handleZoomIn, tooltip: "Zoom In" },
    { icon: ZoomOutIcon, onClick: handleZoomOut, tooltip: "Zoom Out" },
  ];

  const chartTypeButtons = [
    { type: "candles" as const, icon: BarChartIcon, tooltip: "Candlestick" },
    { type: "line" as const, icon: TrendingUpIcon, tooltip: "Line Chart" },
    { type: "area" as const, icon: TrendingDownIcon, tooltip: "Area Chart" },
  ];

  return (
    <div className="flex items-center gap-2 mb-4 p-2 bg-background/50 rounded-lg">
      {controlButtons.map(({ icon: Icon, onClick, tooltip }) => (
        <CustomTooltip key={tooltip} content={tooltip}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="hover:bg-white/10"
          >
            <Icon className="h-4 w-4" />
          </Button>
        </CustomTooltip>
      ))}

      <div className="w-[1px] h-6 bg-white/20 mx-2" />

      {chartTypeButtons.map(({ type, icon: Icon, tooltip }) => (
        <CustomTooltip key={type} content={tooltip}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleChartType(type)}
            className={`hover:bg-white/10 ${
              chartType === type ? "bg-white/20" : ""
            }`}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </CustomTooltip>
      ))}

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

// Utility functions
const formatPrice = (price: number) => price.toFixed(6);

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", { hour12: false });
};

const formatNumber = (num: number) => {
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

const getTimeFrameLabel = (tf: string) => {
  const timeFrameMap: Record<string, string> = {
    "m5": "5m",
    "h1": "1h", 
    "h6": "6h",
    "h24": "24h"
  };
  return timeFrameMap[tf] || tf;
};

// Timeframe Selector Component
const TimeframeSelector = ({ 
  timeframe, 
  setTimeframe 
}: { 
  timeframe: string; 
  setTimeframe: (tf: any) => void 
}) => {
  const timeframes = ["1m", "5m", "15m", "1h", "4h", "1d"];

  return (
    <div className="flex gap-2 mb-4">
      {timeframes.map((tf) => (
        <Button
          key={tf}
          onClick={() => setTimeframe(tf)}
          className={`px-3 py-1 ${
            timeframe === tf ? "bg-blue-500" : "bg-secondary"
          }`}
        >
          {tf}
        </Button>
      ))}
    </div>
  );
};

// Balance display component with loading state
const BalanceDisplay = ({ 
  isLoading, 
  value, 
  label 
}: { 
  isLoading: boolean; 
  value: string; 
  label: string 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
        <span className="text-white/70 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <p className="text-white/70 text-sm">
      {label}: {value}
    </p>
  );
};

export default function TokenView() {
  const { id } = useParams();
  const location = useLocation();
  
  // State declarations
  const [pairData, setPairData] = useState<any>(null);
  const [swap, setSwap] = useState<"Buy" | "Sell">("Buy");
  const [orderAmount, setOrderAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [XSol, setXSol] = useState<string>("0");
  const [XTokenMint, setXTokenMint] = useState<string>("0");
  const [updateBal, setUpdateBal] = useState(false);
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [priceInput, setPriceInput] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [timeframe, setTimeframe] = useState<"1m" | "5m" | "15m" | "1h" | "4h" | "1d">("5m");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [showVolume, setShowVolume] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [tokenPriceInUSD, setTokenPriceInUSD] = useState(0);
  const [indicators, setIndicators] = useState<string[]>([]);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState<number>(0);
  const [hasInitialBalanceLoaded, setHasInitialBalanceLoaded] = useState(false);

  // Refs
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const balanceTimeoutRef = useRef<NodeJS.Timeout>();
  const balanceIntervalRef = useRef<NodeJS.Timeout>();

  // Hooks
  const { publicKey } = useWallet();
  const { address } = useAppKitAccount();
  const { buy: buyToken, sell: sellToken } = useTrade();

  // Memoized values
  const walletPublicKey = useMemo(() => 
    publicKey || (address ? new PublicKey(address) : undefined),
    [publicKey, address]
  );

  const tokenAmount = useMemo(() => {
    if (!orderAmount || !pairData?.priceNative) return 0;
    const price = parseFloat(parseFloat(pairData.priceNative).toFixed(9));
    return +orderAmount / price;
  }, [orderAmount, pairData]);

  // Generate cache keys
  const xSolCacheKey = useMemo(() => 
    walletPublicKey ? `xsol_${walletPublicKey.toBase58()}` : '', 
    [walletPublicKey]
  );

  const xTokenCacheKey = useMemo(() => 
    walletPublicKey && pairData ? `xtoken_${walletPublicKey.toBase58()}_${pairData.baseToken.address}` : '', 
    [walletPublicKey, pairData]
  );

  // Effects
  useEffect(() => {
    if (location.state?.pairData) {
      const data = location.state.pairData;
      setPairData(data);
      updateStats(data);
    }
  }, [location.state]);

  // Optimized balance fetching with caching and loading states
  const fetchBalances = useCallback(async () => {
    if (!pairData || !walletPublicKey) {
      setXSol("0");
      setXTokenMint("0");
      setHasInitialBalanceLoaded(true);
      return;
    }

    // Check cache first
    const now = Date.now();
    const cachedXSol = xSolCacheKey ? balanceCache.get(xSolCacheKey) : null;
    const cachedXToken = xTokenCacheKey ? balanceCache.get(xTokenCacheKey) : null;

    // Use cached values if they're fresh
    if (cachedXSol && (now - cachedXSol.timestamp < CACHE_DURATION)) {
      setXSol(cachedXSol.balance);
    }

    if (cachedXToken && (now - cachedXToken.timestamp < CACHE_DURATION)) {
      setXTokenMint(cachedXToken.balance);
      setHasInitialBalanceLoaded(true);
      return; // Return early if both balances are cached
    }

    setIsBalanceLoading(true);
    let retryCount = 0;
    const { maxRetries, retryDelay } = BALANCE_RETRY_CONFIG;

    const fetchWithRetry = async (): Promise<boolean> => {
      try {
        console.log("Fetching token balances...");

        // Fetch XDEGEN SOL balance
        const xXSol = await getSPLTokenBalance(walletPublicKey, XDEGEN_MINT);
        const xSolValue = xXSol.toString();
        setXSol(xSolValue);

        // Cache the value
        if (xSolCacheKey) {
          balanceCache.set(xSolCacheKey, { balance: xSolValue, timestamp: now });
        }

        // Fetch paired token balance
        const getXdegenTokenMint = await getMeme(pairData.baseToken.address);
        console.log('Fetched token mint:', getXdegenTokenMint);
        
        if (getXdegenTokenMint) {
          const xXToken = await getSPLTokenBalance(walletPublicKey, getXdegenTokenMint);
          const xTokenValue = xXToken.toString();
          console.log('Token balance:', xTokenValue);
          setXTokenMint(xTokenValue);

          // Cache the value
          if (xTokenCacheKey) {
            balanceCache.set(xTokenCacheKey, { balance: xTokenValue, timestamp: now });
          }
        } else {
          console.log('No token mint found, setting balance to 0');
          setXTokenMint("0");
          if (xTokenCacheKey) {
            balanceCache.set(xTokenCacheKey, { balance: "0", timestamp: now });
          }
        }

        console.log("Balances updated successfully");
        setLastBalanceUpdate(now);
        setHasInitialBalanceLoaded(true);
        return true;
      } catch (error) {
        console.error("Failed to fetch token balances:", error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`Retrying balance fetch (${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
          return fetchWithRetry();
        } else {
          console.error("Max retries reached, setting balances to 0");
          setXSol("0");
          setXTokenMint("0");
          setHasInitialBalanceLoaded(true);
          return false;
        }
      } finally {
        setIsBalanceLoading(false);
      }
    };

    // Clear any existing timeout
    if (balanceTimeoutRef.current) {
      clearTimeout(balanceTimeoutRef.current);
    }

    // Only fetch if we don't have fresh cached data
    if (!cachedXSol || !cachedXToken || (now - (cachedXSol?.timestamp || 0) >= CACHE_DURATION)) {
      balanceTimeoutRef.current = setTimeout(fetchWithRetry, BALANCE_RETRY_CONFIG.initialDelay);
    } else {
      setIsBalanceLoading(false);
      setHasInitialBalanceLoaded(true);
    }
  }, [pairData, walletPublicKey, xSolCacheKey, xTokenCacheKey]);

  useEffect(() => {
    fetchBalances();

    // Set up periodic refresh
    balanceIntervalRef.current = setInterval(fetchBalances, BALANCE_REFRESH_INTERVAL);

    return () => {
      if (balanceTimeoutRef.current) {
        clearTimeout(balanceTimeoutRef.current);
      }
      if (balanceIntervalRef.current) {
        clearInterval(balanceIntervalRef.current);
      }
    };
  }, [fetchBalances]);

  // Force balance update when updateBal changes
  useEffect(() => {
    if (updateBal) {
      // Clear cache to force fresh fetch
      if (xSolCacheKey) balanceCache.delete(xSolCacheKey);
      if (xTokenCacheKey) balanceCache.delete(xTokenCacheKey);
      fetchBalances();
    }
  }, [updateBal, fetchBalances, xSolCacheKey, xTokenCacheKey]);

  // Reset initial load state when wallet or pairData changes
  useEffect(() => {
    setHasInitialBalanceLoaded(false);
  }, [walletPublicKey, pairData]);

  // Chart initialization and updates
  useEffect(() => {
    if (!chartContainerRef.current || !pairData) return;

    // Cleanup previous chart
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
        tickMarkFormatter: formatTimestamp,
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

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

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
      if (chartRef.current) {
        try {
          chartRef.current.remove();
          chartRef.current = null;
        } catch (e) {
          console.log("Chart already disposed");
        }
      }
    };
  }, [pairData]);

  // Chart data updates
  useEffect(() => {
    if (!pairData?.baseToken?.address || !candleSeriesRef.current) return;

    const updateChart = (data: PriceData[]) => {
      if (!candleSeriesRef.current) return;

      const lastCandle = data[data.length - 1];
      
      // Update only the latest candle for performance
      candleSeriesRef.current.update({
        time: lastCandle.time as UTCTimestamp,
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
      });

      // Full data update only when needed
      if (data.length > 100) { // Only reset if we have significant new data
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

    const setupChart = async () => {
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

    setupChart();
    priceDataService.subscribe(pairData.baseToken.address, updateChart);

    return () => {
      priceDataService.unsubscribe(pairData.baseToken.address, updateChart);
    };
  }, [pairData, timeframe]);

  // Token price calculation
  useEffect(() => {
    if (orderAmount && pairData?.priceNative) {
      const price = parseFloat(parseFloat(pairData.priceNative).toFixed(9));
      const calculatedTokenAmount = +orderAmount / price;
      const calculatedPriceInUSD = parseFloat(pairData.priceUsd) * calculatedTokenAmount;
      
      setTokenPrice(calculatedTokenAmount);
      setTokenPriceInUSD(calculatedPriceInUSD);
    } else {
      setTokenPrice(0);
      setTokenPriceInUSD(0);
    }
  }, [orderAmount, pairData]);

  // Helper functions
  const updateStats = useCallback((data: any) => {
    const timeFrames = ["m5", "h1", "h6", "h24"];
    const newStats = timeFrames.map((tf) => {
      const buys = data.txns[tf].buys;
      const sells = data.txns[tf].sells;
      const total = buys + sells;
      const buyPercentage = total > 0 ? (buys / total) * 100 : 0;
      const sellPercentage = total > 0 ? (sells / total) * 100 : 0;
      
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
  }, []);

  const setOption = useCallback((option: "Buy" | "Sell") => {
    setSwap(option);
  }, []);

  const handleBuy = async () => {
    if (!walletPublicKey || !pairData) return;
    
    setLoading(true);
    const loadingId = toast.loading("Processing... ");
    
    try {
      const price = parseFloat(parseFloat(pairData.priceNative).toFixed(9));
      const calculatedTokenAmount = +orderAmount / price;

      const tokenToBuy: TokenParams = {
        name: pairData.baseToken.name,
        symbol: pairData.baseToken.symbol,
        supply: calculatedTokenAmount,
        mint: new PublicKey(pairData.baseToken.address)
      };
      
      await buyToken.mutateAsync({
        buyAmount: +orderAmount,
        tokenParams: tokenToBuy
      });
      
      // Force balance refresh after successful transaction and clear cache
      if (xSolCacheKey) balanceCache.delete(xSolCacheKey);
      if (xTokenCacheKey) balanceCache.delete(xTokenCacheKey);
      setUpdateBal(prev => !prev);
    } catch (error) {
      toast.warning(error instanceof Error ? error.message : "Transaction might have failed");
      console.error('Buy error:', error);
    } finally {
      setLoading(false);
      toast.dismiss(loadingId);
    }
  };

  const handleSell = async () => {
    if (!walletPublicKey || !pairData) return;
    
    setLoading(true);
    const loadingId = toast.loading("Processing... ");
    
    try {
      await sellToken.mutateAsync({
        mint: new PublicKey(pairData.baseToken.address),
        tokenName: pairData.baseToken.name,
        tokenSymbol: pairData.baseToken.symbol,
        burnAmount: +orderAmount
      });

      // Force balance refresh after successful transaction and clear cache
      if (xSolCacheKey) balanceCache.delete(xSolCacheKey);
      if (xTokenCacheKey) balanceCache.delete(xTokenCacheKey);
      setUpdateBal(prev => !prev);
    } catch (error) {
      toast.warning(error instanceof Error ? error.message : "Transaction might have failed");
      console.error('Sell error:', error);
    } finally {
      setLoading(false);
      toast.dismiss(loadingId);
    }
  };

  const toggleIndicator = useCallback((indicator: string) => {
    setIndicators(prev =>
      prev.includes(indicator)
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  }, []);

  const quickAmounts = useMemo(() => [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5], []);

  // Memoized token display values with better formatting
  const displayXSol = useMemo(() => {
    if (!hasInitialBalanceLoaded) return "Loading...";
    const balance = parseFloat(XSol);
    return balance > 0 ? balance.toFixed(6) : "0";
  }, [XSol, hasInitialBalanceLoaded]);

  const displayXTokenMint = useMemo(() => {
    if (!hasInitialBalanceLoaded) return "Loading...";
    const balance = parseFloat(XTokenMint);
    return balance > 0 ? balance.toFixed(6) : "0";
  }, [XTokenMint, hasInitialBalanceLoaded]);

  // Determine if we should show loading state for balances
  const showBalanceLoading = !hasInitialBalanceLoaded;

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
                <span className="text-gray-400">
                  {pairData.baseToken.symbol.toUpperCase()}/
                  {pairData.quoteToken.symbol.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                ${parseFloat(pairData.priceUsd).toFixed(6)}
              </div>
              <div className={`flex items-center justify-end space-x-1 ${
                (pairData.priceChange?.h24 || 0) > 0 ? "text-green-400" : "text-red-400"
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
                  <span className="text-sm font-medium">
                    ${pairData.marketCap ? formatNumber(pairData.marketCap) : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">24h Volume</span>
                  </div>
                  <span className="text-sm font-medium">
                    ${pairData.volume?.h24 ? formatNumber(pairData.volume.h24) : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Liquidity</span>
                  </div>
                  <span className="text-sm font-medium">
                    ${pairData.liquidity?.usd ? formatNumber(pairData.liquidity.usd) : "N/A"}
                  </span>
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
                        />
                        <div
                          className="h-full bg-red-600"
                          style={{ width: `${item.sellPercentage}%` }}
                        />
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
                    <span className="text-gray-400">
                      {pairData.baseToken.symbol.toUpperCase()}/
                      {pairData.quoteToken.symbol.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ${parseFloat(pairData.priceUsd).toFixed(6)}
                  </div>
                  <div className={`flex items-center justify-end space-x-1 ${
                    (pairData.priceChange?.h24 || 0) > 0 ? "text-green-400" : "text-red-400"
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
            <div className="flex flex-col justify-start items-start">
              <TimeframeSelector timeframe={timeframe} setTimeframe={setTimeframe} />
              <ChartControls
                chartRef={chartRef}
                chartType={"candles"}
                setChartType={() => {}}
                showVolume={showVolume}
                setShowVolume={setShowVolume}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
              />
            </div>
            <div
              ref={chartContainerRef}
              className="w-full h-[500px]"
              style={{ minHeight: "400px" }}
            />
          </div>
        </div>

        {/* Right Sidebar - Trading Panel */}
        <div className="w-80 bg-gray-900/50 backdrop-blur-sm border-l border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-lg font-bold mb-4">Trade</h3>

            {/* Buy/Sell Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
              {(["Buy", "Sell"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setOption(option)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    swap === option
                      ? option === "Buy" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Market/Limit Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
              {(["market", "limit"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    orderType === type
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Price Input (for limit orders) */}
            {orderType === "limit" && (
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
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      className="flex text-xs justify-center items-center gap-1 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer py-2 px-1 border border-gray-700 hover:border-yellow-400/30 transition-all"
                      onClick={() => setOrderAmount(amount.toString())}
                      disabled={loading}
                    >
                      <img
                        src="/images/solana.svg"
                        alt="solana"
                        className="w-3 h-3"
                      />
                      {amount}
                    </button>
                  ))}
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
                  placeholder={swap === "Buy" 
                    ? "Amount of XDEGEN SOL" 
                    : `Amount of ${pairData.baseToken.symbol}`
                  }
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none"
                />
              </div>
              {swap === "Buy" && (
                <span className="text-xs mt-2 flex justify-end text-gray-300">
                  {tokenPrice === 0 ? 0 : tokenPrice.toFixed(3)} {pairData.baseToken.symbol.toUpperCase()} (${tokenPrice === 0 ? 0 : tokenPriceInUSD.toFixed(5)})
                </span>
              )}
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
                (swap === "Sell" && displayXTokenMint === "0") ||
                (swap === "Buy" && displayXSol === "0") ||
                orderAmount === "" ||
                loading ||
                showBalanceLoading
              }
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                swap === "Buy"
                  ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading
                ? "Processing..."
                : `${swap} ${pairData.baseToken.symbol.toUpperCase()}`}
            </button>

            {/* Fixed Balance Display with Loading State */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              {showBalanceLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                  <span className="text-white/70 text-sm">Loading balances...</span>
                </div>
              ) : (
                <BalanceDisplay
                  isLoading={isBalanceLoading}
                  value={swap === "Buy" ? displayXSol : displayXTokenMint}
                  label={swap === "Buy" ? "XDEGEN SOL" : `XDEGEN ${pairData.baseToken.symbol}`}
                />
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-2 text-gray-400 hover:text-white cursor-pointer">
              <Settings className="w-4 h-4" />
              <a href="/setting" className="text-sm">
                Advanced settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}