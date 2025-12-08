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
import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import supabase from "../testToken/database";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Program, BorshCoder } from '@coral-xyz/anchor';
import TradeIDL from "../../lib/contracts/trade/trade.json";
import type { XdegenDemo, XdegenDemo as XdegenTrade } from "../../lib/contracts/trade/trade";
import { useAnchor } from '../../hooks/useAnchor';

interface Token {
  name: string;
  amount: string;
  symbol: string;
  value: string;
  mintAddress: string;
  h24: number | string;
  imageUrl: string;
}

interface TotalData {
  amountTotal: number;
  solTotal: number;
  totalPercentage: string | number;
}

type WalletTab = "tokens" | "transactions";

interface WalletTransaction {
  signature: string;
  timestamp: number;
  tokenSymbol: string;
  mint: string;
  amount: number;
  usdValue?: number;
  direction: "buy" | "sell";
}

// Constants
const XDEGEN_MINT = '3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const REFRESH_INTERVAL = 30000;
const TRADE_PROGRAM_ID = new PublicKey(TradeIDL.address);

// Utility functions
const formatCurrency = (amount: number) => amount.toFixed(2);

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
  const provider = useAnchor();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<WalletTab>("tokens");
  const [xsolBalance, setXsolBalance] = useState(0);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [total, setTotal] = useState<TotalData>();
  const [open, setOpen] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

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
      setSolPrice(100);
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

  // Fetch transactions from the trade program
  const fetchTransactions = useCallback(async () => {
    if (!publicKey || !provider) {
      setTransactions([]);
      return;
    }

    setIsLoadingTransactions(true);
    try {
      const coder = new BorshCoder(TradeIDL as any);
      
      // Get all transactions for the user's wallet
      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: 50,
      });

      const txRecords: WalletTransaction[] = [];

      // Process transactions in batches to avoid rate limiting
      const batchSize = 10;
      for (let i = 0; i < signatures.length; i += batchSize) {
        const batch = signatures.slice(i, i + batchSize);
        const batchPromises = batch.map(async (sigInfo) => {
          try {
            const tx = await connection.getTransaction(sigInfo.signature, {
              maxSupportedTransactionVersion: 0,
              commitment: 'confirmed'
            });

            if (!tx) return null;

            // Check if this transaction involves our trade program
            const programIndex = tx.transaction.message.staticAccountKeys.findIndex(
              key => key.equals(TRADE_PROGRAM_ID)
            );

            if (programIndex === -1) return null;

            const accountKeys = tx.transaction.message.getAccountKeys();
            const instructions = tx.transaction.message.compiledInstructions;

            for (const ix of instructions) {
              // Check if this instruction is for our program
              if (ix.programIdIndex !== programIndex) continue;

              try {
                const decoded = coder.instruction.decode(ix.data);
                if (!decoded) continue;

                if (decoded.name === 'buy') {
                  const { amount, data } = decoded.data as any;
                  // For buy transactions, the token mint is usually at account index 5 or 6
                  const mintAccount = accountKeys.get(ix.accountKeyIndexes[5]) || 
                                    accountKeys.get(ix.accountKeyIndexes[6]);
                  
                  if (mintAccount) {
                    txRecords.push({
                      signature: sigInfo.signature,
                      timestamp: sigInfo.blockTime ? sigInfo.blockTime * 1000 : Date.now(),
                      tokenSymbol: data?.symbol || 'Unknown',
                      mint: mintAccount.toBase58(),
                      amount: Number(amount) / Math.pow(10, data?.decimals || 9),
                      direction: 'buy'
                    });
                  }
                } else if (decoded.name === 'sell') {
                  const { burnAmount } = decoded.data as any;
                  // For sell transactions, the token mint is usually at account index 4 or 5
                  const mintAccount = accountKeys.get(ix.accountKeyIndexes[4]) || 
                                    accountKeys.get(ix.accountKeyIndexes[5]);
                  
                  if (mintAccount) {
                    txRecords.push({
                      signature: sigInfo.signature,
                      timestamp: sigInfo.blockTime ? sigInfo.blockTime * 1000 : Date.now(),
                      tokenSymbol: 'Token',
                      mint: mintAccount.toBase58(),
                      amount: Number(burnAmount) / Math.pow(10, 9), // assuming 9 decimals
                      direction: 'sell'
                    });
                  }
                }
              } catch (decodeError) {
                // Skip if we can't decode this instruction
                console.debug('Failed to decode instruction:', decodeError);
              }
            }
          } catch (error) {
            console.error('Error processing transaction:', error);
          }
          return null;
        });

        await Promise.all(batchPromises);
      }

      // Sort transactions by timestamp (newest first)
      txRecords.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(txRecords);

    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [publicKey, provider, connection]);

  // Alternative approach: Fetch by program ID and filter by user
  const fetchTransactionsByProgram = useCallback(async () => {
    if (!publicKey || !provider) {
      setTransactions([]);
      return;
    }

    setIsLoadingTransactions(true);
    try {
      const coder = new BorshCoder(TradeIDL as any);
      
      // Get transactions for the program and filter by user
      const signatures = await connection.getSignaturesForAddress(TRADE_PROGRAM_ID, {
        limit: 100,
      });

      const txRecords: WalletTransaction[] = [];

      for (const sigInfo of signatures) {
        try {
          const tx = await connection.getTransaction(sigInfo.signature, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
          });

          if (!tx) continue;

          // Check if user's wallet is involved in this transaction
          const userInvolved = tx.transaction.message.staticAccountKeys.some(
            key => key.equals(publicKey)
          );

          if (!userInvolved) continue;

          const accountKeys = tx.transaction.message.getAccountKeys();
          const instructions = tx.transaction.message.compiledInstructions;

          for (const ix of instructions) {
            try {
              const decoded = coder.instruction.decode(ix?.data);
              if (!decoded) continue;

              let transactionData: Partial<WalletTransaction> = {
                signature: sigInfo.signature,
                timestamp: sigInfo.blockTime ? sigInfo.blockTime * 1000 : Date.now(),
              };

              if (decoded.name === 'buy') {
                const { data } = decoded.data as any;
                const mintAccount = accountKeys.get(ix.accountKeyIndexes[5]);

                transactionData = {
                  ...transactionData,
                  tokenSymbol: data?.symbol || 'Token',
                  mint: mintAccount?.toBase58() || '',
                  amount: data.supply.toNumber() / Math.pow(10, data?.decimals || 9),
                  direction: 'buy' as const
                };
              } else if (decoded.name === 'mint_token') {
                const { mint_amount } = decoded.data as any;
                const mintAccount = accountKeys.get(ix.accountKeyIndexes[5]);
                console.log('buy data', decoded.data)

                const mintInfo = await getMint(connection, mintAccount!)
                transactionData = {
                  ...transactionData,
                  tokenSymbol: 'Token',
                  mint: mintAccount?.toBase58() || '',
                  amount: mint_amount.toNumber() / Math.pow(10, mintInfo?.decimals || 9),
                  direction: 'buy' as const
                };

              } else if (decoded.name === 'sell') {
                const { burnAmount } = decoded.data as any;
                const mintAccount = accountKeys.get(ix.accountKeyIndexes[4]);
                console.log('burnAmount', burnAmount)

                transactionData = {
                  ...transactionData,
                  tokenSymbol: 'Token',
                  mint: mintAccount?.toBase58() || '',
                  amount: Number(burnAmount) / Math.pow(10, 9),
                  direction: 'sell' as const
                };
              }

              // Only add if we have required data
              if (transactionData.direction && transactionData.mint) {
                txRecords.push(transactionData as WalletTransaction);
              }
            } catch (decodeError) {
              // Skip undecodable instructions
            }
          }
        } catch (error) {
          console.error('Error processing transaction:', error);
        }
      }

      // Sort by timestamp and remove duplicates
      const uniqueTxs = Array.from(new Map(
        txRecords.map(tx => [tx.signature, tx])
      ).values()).sort((a, b) => b.timestamp - a.timestamp);

      setTransactions(uniqueTxs);

    } catch (error) {
      console.error('Failed to fetch program transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [publicKey, provider, connection]);

  // Combined refresh function
  const refreshAllBalances = useCallback(async () => {
    if (!connected) return;
    
    await Promise.all([
      fetchXsolBalance(),
      fetchTokenBalances(),
      fetchSolPrice(),
    ]);
  }, [connected, fetchXsolBalance, fetchTokenBalances, fetchSolPrice]);

  // Refresh transactions when tab changes to transactions
  useEffect(() => {
    if (activeTab === "transactions" && publicKey && provider) {
      fetchTransactionsByProgram();
      // fetchTransactions()
    }
  }, [activeTab, publicKey, provider, fetchTransactionsByProgram]);

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
    return xsolBalance * solPrice;
  }, [xsolBalance, solPrice]);

  const percentageDisplay = useMemo(() => 
    formatPercentage(totalPercentage, totalAmount),
    [totalPercentage, totalAmount]
  );

  const percentageColor = useMemo(() => 
    getPercentageColor(totalPercentage),
    [totalPercentage]
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
      }),
    []
  );

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
    []
  );

  const transactionList = useMemo(() => transactions, [transactions]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="p-2 border border-gray-700/40 rounded-full hover:border-primary hover:bg-primary/30 transition-all duration-300 ease-in-out">
        <KeyboardArrowDownIcon />
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
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
            <div className="bg-secondary text-white p-6 rounded-lg max-w-xl w-full">
              <div className="mb-6 pb-6 border-white/10 border-b flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Wallet</h2>
                  <p className="text-sm text-gray-400">
                    {activeTab === "tokens"
                      ? isLoading
                        ? "Loading balances..."
                        : `${tokenCount} token${tokenCount !== 1 ? "s" : ""}`
                      : isLoadingTransactions
                      ? "Loading transactions..."
                      : `${transactionList.length} transaction${transactionList.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="flex w-full sm:w-auto bg-black/30 rounded-full p-1">
                  {(["tokens", "transactions"] as WalletTab[]).map((tab) => (
                    <button
                      key={tab}
                      className={`flex-1 px-4 py-1 text-xs font-semibold rounded-full capitalize transition-all ${
                        activeTab === tab
                          ? "bg-white text-black"
                          : "text-gray-400 hover:text-white"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto h-[70vh] pr-2 py-2">
                {!publicKey ? (
                  <div className="text-center text-gray-400 py-8">Connect Wallet</div>
                ) : activeTab === "tokens" ? (
                  tokens.length === 0 ? (
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
                  )
                ) : transactionList.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    {isLoadingTransactions ? "Loading transactions..." : "No transactions found"}
                  </div>
                ) : (
                  transactionList.map((tx) => (
                    <TransactionItem
                      key={`${tx.signature}-${tx.timestamp}`}
                      transaction={tx}
                      dateFormatter={dateFormatter}
                      timeFormatter={timeFormatter}
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

const shortenAddress = (address?: string) => {
  if (!address) return "Unknown";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
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

const TransactionItem = ({
  transaction,
  dateFormatter,
  timeFormatter,
}: {
  transaction: WalletTransaction;
  dateFormatter: Intl.DateTimeFormat;
  timeFormatter: Intl.DateTimeFormat;
}) => {
  const amountDisplay = transaction.amount >= 1
    ? transaction.amount.toFixed(4)
    : transaction.amount.toFixed(6);

  const chipStyles =
    transaction.direction === "buy"
      ? "bg-emerald-500/10 text-emerald-300"
      : "bg-rose-500/10 text-rose-300";

  return (
    <div className="rounded-xl border border-white/5 bg-black/30 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 flex items-center justify-center rounded-full ${chipStyles}`}>
            {transaction.tokenSymbol.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold">
              {amountDisplay} {transaction.tokenSymbol}
            </p>
            <p className="text-xs text-gray-400">
              {transaction.usdValue
                ? `≈ $${transaction.usdValue.toFixed(2)} USD`
                : `Mint ${shortenAddress(transaction.mint)}`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${chipStyles}`}>
            {transaction.direction}
          </span>
          <p className="text-xs text-gray-400">{dateFormatter.format(transaction.timestamp)}</p>
          <p className="text-xs text-gray-500">{timeFormatter.format(transaction.timestamp)}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>Hash: {shortenAddress(transaction.signature)}</span>
        <a
          href={`https://explorer.solana.com/tx/${transaction.signature}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-2 hover:underline"
        >
          View
        </a>
      </div>
    </div>
  );
};