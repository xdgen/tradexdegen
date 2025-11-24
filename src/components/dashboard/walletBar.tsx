import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getTokens } from "../testToken/tokenBalance";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import supabase from "../testToken/database";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer"

interface Token {
  name: string;
  amount: string;
  symbol: string;
  value: string;
  mintAddress: string;
  h24: number | string; // Fixed: can be number or string
  imageUrl: string;
}

interface TotalData {
  amountTotal: number;
  solTotal: number;
  totalPercentage: string | number; // Fixed: can be number or string
}

// Constants
const XDEGEN_MINT = '3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce';
const REFRESH_INTERVAL = 30000; // 30 seconds instead of 5 seconds

// Utility functions
const formatCurrency = (amount: number) => amount.toFixed(2);

// Fixed utility functions to handle both numbers and strings
const formatPercentage = (percentage: string | number, amount: number) => {
  const percentageStr = String(percentage);
  const percentageNum = parseFloat(percentageStr);
  const isNegative = percentageNum < 0;
  const changeAmount = (Math.abs(percentageNum) * amount) / 100;
  
  return `${percentageNum >= 0 ? '+' : ''}${percentageNum.toFixed(2)}%${isNegative ? "▼" : "▲"} ($${changeAmount.toFixed(2)})`;
};

const getPercentageColor = (percentage: string | number) => {
  const percentageNum = typeof percentage === 'number' ? percentage : parseFloat(percentage);
  return percentageNum < 0 ? "text-red-500" : "text-green-500";
};

export const WalletBar = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [xsolBalance, setXsolBalance] = useState(0);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [total, setTotal] = useState<TotalData>();
  const [open, setOpen] = useState(false);

  // Memoized public key string
  const walletAddress = useMemo(() => publicKey?.toBase58(), [publicKey]);

  // Fetch SOL price in USD
  const fetchSolPrice = useCallback(async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      setSolPrice(data.solana.usd);
    } catch (error) {
      console.error("Failed to fetch SOL price:", error);
      setSolPrice(100); // Default to $100 SOL
    }
  }, []);

  // Fetch XSOL balance
  const fetchXsolBalance = useCallback(async () => {
    if (!publicKey) return;

    try {
      const mintAddress = new PublicKey(XDEGEN_MINT);
      const xsolAta = await getAssociatedTokenAddress(mintAddress, publicKey);
      const balance = await connection.getTokenAccountBalance(xsolAta);
      setXsolBalance(Number(balance.value.uiAmount || 0));
    } catch (error) {
      console.error("Failed to fetch XSOL balance:", error);
      setXsolBalance(0);
    }
  }, [publicKey, connection]);

  // Fetch token balances
  const fetchTokenBalances = useCallback(async () => {
    if (!walletAddress) return;

    console.log("Fetching token balances...");
    setIsLoading(true);

    try {
      const tokensData = await getTokens(walletAddress);
      
      if (Array.isArray(tokensData)) {
        setTokens(tokensData);
      } else {
        setTokens(tokensData.tokens || []);
        setTotal({
          amountTotal: tokensData.totalValue || 0,
          solTotal: tokensData.totalValueInSol || 0,
          totalPercentage: tokensData.totalPercentage?.toString() || "0",
        });
      }
    } catch (error) {
      console.error("Failed to fetch token balances:", error);
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Combined refresh function
  const refreshAllBalances = useCallback(async () => {
    if (!connected) return;
    
    await Promise.all([
      fetchXsolBalance(),
      fetchTokenBalances(),
      fetchSolPrice()
    ]);
  }, [connected, fetchXsolBalance, fetchTokenBalances, fetchSolPrice]);

  // Initial load when wallet connects
  useEffect(() => {
    if (connected) {
      refreshAllBalances();
    }
  }, [connected, refreshAllBalances]);

  // Auto-refresh balances
  useEffect(() => {
    if (!connected) return;

    const interval = setInterval(refreshAllBalances, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [connected, refreshAllBalances]);

  // Memoized calculated values
  const totalAmount = useMemo(() => total?.amountTotal || 0, [total]);
  const totalPercentage = useMemo(() => total?.totalPercentage || "0", [total]);
  const tokenCount = useMemo(() => tokens.length, [tokens.length]);

  // Calculate XSOL value in USD
  const xsolValueUSD = useMemo(() => {
    if (!solPrice) return 0;
    return xsolBalance * solPrice; // Since 1 XSOL = 1 SOL in value
  }, [xsolBalance, solPrice]);

  const percentageDisplay = useMemo(() => 
    formatPercentage(totalPercentage, totalAmount),
    [totalPercentage, totalAmount]
  );

  const percentageColor = useMemo(() => 
    getPercentageColor(totalPercentage),
    [totalPercentage]
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="p-2 border border-gray-700/40 rounded-full hover:border-primary hover:bg-primary/30 transition-all duration-300 ease-in-out">
        <KeyboardArrowDownIcon />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            <div className="flex justify-between items-center">
              <div className="flex flex-col justify-start items-start mt-6">
                <span className="text-xl text-white">
                  ${formatCurrency(totalAmount)}
                </span>
                <span className={`text-[12px] ${percentageColor}`}>
                  {percentageDisplay}
                </span>
              </div>
              <div className="text-white flex flex-col justify-start items-end">
                <span className="text-sm font-extrabold">XSOL</span>
                <h1 className="text-lg lg:text-2xl">{xsolBalance.toFixed(3)}</h1>
                {solPrice && (
                  <span className="text-xs text-gray-400 mt-1">
                    ≈ ${xsolValueUSD.toFixed(2)} USD
                  </span>
                )}
              </div>
            </div>
          </SheetTitle>
          <SheetDescription>
            <div className="bg-secondary text-white p-6 rounded-lg max-w-md">
              <div className="mb-6 pb-6 border-white/10 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Holdings</h2>
                  <p className="text-sm text-gray-400">
                    {isLoading ? "Loading..." : `${tokenCount} token${tokenCount !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <div>
                  <Button className="text-xs">View Transactions</Button>
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto h-[70vh] pr-2 py-2">
                {!publicKey ? (
                  <div className="text-center text-gray-400 py-8">
                    Connect Wallet
                  </div>
                ) : tokens.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    {isLoading ? "Loading tokens..." : "No tokens found"}
                  </div>
                ) : (
                  tokens.map((token) => (
                    <TokenItem
                      key={token.mintAddress}
                      token={token}
                      wallet={walletAddress}
                      onClose={() => setOpen(false)}
                    />
                  ))
                )}
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

// Separate component for token items for better performance
const TokenItem = ({ token, wallet, onClose }: { token: Token, wallet: string | undefined, onClose: () => void }) => {
  const navigate = useNavigate();
  const tokenValue = useMemo(() => parseFloat(token.value) || 0, [token.value]);

  const tokenChangeDisplay = useMemo(() =>
    formatPercentage(token.h24, tokenValue),
    [token.h24, tokenValue]
  );

  const tokenChangeColor = useMemo(() =>
    getPercentageColor(token.h24),
    [token.h24]
  );

  async function navigateToPage(token: Token) {
    const memeData = await supabase
        .from('meme')
        .select()
        .eq('mint', token.mintAddress)
        .eq('name', token.name)
        .eq('wallet', wallet)
        .maybeSingle();

    if (!memeData.data) {
      toast.error("The record for this mint was not found in the database.");
      return;
    }

    const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/solana/${memeData.data.mainMint}`, {
      method: 'GET',
      headers: {
        'Accept': '*/*'
      }
    });
    const data = await response.json();

    if (data && data.length > 0) {
      // Find the pair matching the mint address
      const pair = data.find((p: any) => p.baseToken.address === memeData.data.mainMint);
      if (pair) {
        navigate(`/trading/${pair.pairAddress}`, { state: { pairData: pair } });
        onClose();
      }
    }
  }

  return (
    <div className="flex items-center justify-between hover:bg-gray-900 rounded-md py-2 px-1 duration-300 cursor-pointer" onClick={async () => await navigateToPage(token)}>
      <div className="flex justify-start items-start space-x-3">
        <img
          src={token.imageUrl}
          alt={token.name}
          className="w-6 h-6 rounded-full"
          onError={(e) => {
            // Fallback for broken images
            e.currentTarget.src = `https://via.placeholder.com/24/333/fff?text=${token.symbol.charAt(0)}`;
          }}
        />
        <div className="m-0 p-0">
          <h3 className="font-medium m-0 p-0 line-clamp-1">{token.name}</h3>
          <p className="text-sm text-gray-500">
            {token.amount} {token.symbol}
          </p>
        </div>
      </div>
      <div className="text-right min-w-0 flex-1 ml-2">
        <p className="font-medium truncate">${token.value}</p>
        <p className={`text-sm ${tokenChangeColor} truncate`}>
          {tokenChangeDisplay}
        </p>
      </div>
    </div>
  );
};