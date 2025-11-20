import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useEffect, useState } from "react";
import { getTokens } from "../testToken/tokenBalance";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

interface Token {
  name: string;
  amount: string;
  symbol: string;
  value: string;
  mintAddress: string;
  h24: string;
  imageUrl: string;
}

export const WalletBar = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [xsolBalance, setXsolBalance] = useState(0);
  const [total, setTotal] = useState<{
    amountTotal: number;
    solTotal: number;
    totalPercentage: string;
  }>();

  useEffect(() => {
    if (publicKey) {
      (async () => {
        const mint = '3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce';
        const mint_address = new PublicKey(mint);

        const xsolAta = await getAssociatedTokenAddress(
          mint_address,
          publicKey
        );

        const balance = await connection.getTokenAccountBalance(xsolAta);
        setXsolBalance(Number(balance.value.uiAmount))
      })()
    }
  }, [publicKey])

  const fetchTokenBalances = async () => {
    if (!publicKey) return;

    const walletPublicKey = publicKey.toBase58();
    console.log("Fetching token balances...");
    setIsLoading(true);

    try {
      const tokens_fetch = await getTokens(walletPublicKey);
      if (Array.isArray(tokens_fetch)) {
        setTokens(tokens_fetch || []);
      } else {
        setTokens(tokens_fetch.tokens || []);
        setTotal({
          amountTotal: tokens_fetch.totalValue,
          solTotal: tokens_fetch.totalValueInSol,
          totalPercentage: tokens_fetch.totalPercentage.toString(),
        });
      }
    } catch (error) {
      console.error("Failed to fetch token balances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch balances when the wallet connects or after a transaction
  useEffect(() => {
    if (connected) {
      fetchTokenBalances();
    }
  }, [publicKey, connected]);

  // Auto-reload wallet data after a transaction
  useEffect(() => {
    const reloadBalances = async () => {
      await fetchTokenBalances();
    };

    const interval = setInterval(() => {
      reloadBalances();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Sheet>
      <SheetTrigger className="p-2 border border-gray-700/40 rounded-full hover:border-primary hover:bg-primary/30 transition-all duration-300 ease-in-out">
        <KeyboardArrowDownIcon />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            <div className="flex justify-between items-center">
              <div className="flex flex-col justify-start items-start mt-6">
                <span className="text-xl text-white">
                  $
                  {total?.amountTotal
                    ? total?.amountTotal.toFixed(2).toLocaleString()
                    : 0}
                </span>
                <span
                  className={
                    total?.totalPercentage
                      ? String(total?.totalPercentage).startsWith("-")
                        ? "text-red-500 text-[12px]"
                        : "text-green-500 text-[12px]"
                      : "text-[12px] text-white/80"
                  }
                >
                  {total?.totalPercentage
                    ? total?.totalPercentage +
                      "%" +
                      (String(total?.totalPercentage).startsWith("-")
                        ? "▼"
                        : "▲") +
                      " ($" +
                      (
                        (+total?.totalPercentage * +total?.amountTotal) /
                        100
                      ).toFixed(2) +
                      ")"
                    : "0%"}
                </span>
              </div>
              <div className="text-white flex flex-col justify-start">
                <span className="text-sm font-extrabold">XSOL</span>
                <h1 className="text-lg lg:text-2xl">{xsolBalance.toFixed(3)}</h1>
              </div>
            </div>
          </SheetTitle>
          <SheetDescription>
            <div className="bg-secondary text-white p-6 rounded-lg max-w-md">
              <div className="mb-6 pb-6 border-white/10 border-b">
                <h2 className="text-xl font-semibold">Holdings</h2>
                <p className="text-sm text-gray-400">
                  {isLoading ? "Loading..." : `${tokens.length} tokens`}
                </p>
              </div>

              <div className="space-y-4 overflow-y-scroll h-[70vh] pr-2 py-2">
                {!publicKey
                  ? "Connect Wallet"
                  : tokens.map((token, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex justify-start items-start space-x-3">
                          <img
                            src={token.imageUrl}
                            className="w-6 h-6 rounded-full"
                          />
                          <div className="m-0 p-0">
                            <h3 className="font-medium m-0 p-0">
                              {token.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {token.amount} {token.symbol}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${token.value}</p>
                          <p
                            className={
                              String(token.h24).startsWith("-")
                                ? "text-red-500"
                                : "text-green-500"
                            }
                          >
                            {token.h24 +
                              "%" +
                              (String(token.h24).startsWith("-") ? "▼" : "▲") +
                              " ($" +
                              ((+token.h24 * +token.value) / 100).toFixed(2) +
                              ")"}
                          </p>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
