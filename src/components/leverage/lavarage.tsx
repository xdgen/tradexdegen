"use client";

import { useState } from "react";
import { ChevronDown, Minus, Plus, ArrowDownUp } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { TokenSelector } from "../swaps/tokenSelectorModal";
import { Tokenn } from "../swaps/tokenSelectorModal";
import FilterListIcon from "@mui/icons-material/FilterList";

export default function LeverageLong() {
  const { publicKey, connected } = useWallet();

  // State for the trading mode
  const [mode, _setMode] = useState<"Long" | "Swap">("Long");
  const [slippage, setSlippage] = useState(10.2);
  const [slippageDropdownOpen, setSlippageDropdownOpen] = useState(false);

  // Slippage options
  const slippageOptions = [0.5, 1.0, 2.5, 5.0];

  // State for the input amount
  const [inputAmount, setInputAmount] = useState("");

  // State for the selected tokens
  const [tokenPair, setTokenPair] = useState({
    paying: null as Tokenn | null,
    receiving: null as Tokenn | null,
  });

  // State for selector modal
  const [selectorConfig, setSelectorConfig] = useState({
    isOpen: false,
    type: "paying" as "paying" | "receiving",
  });

  // State for the leverage
  const [leverage, setLeverage] = useState(1.3);

  // Calculate the output amount based on leverage and input
  const calculateOutput = () => {
    if (!tokenPair.paying || !tokenPair.receiving) return "0.00";
    const input = Number.parseFloat(inputAmount) || 0;
    const rate = 2.4647; // Exchange rate would come from API in real app
    return (input * leverage * rate).toFixed(6);
  };

  // Handle leverage change
  const handleLeverageChange = (newLeverage: number) => {
    if (newLeverage >= 1 && newLeverage <= 5) {
      setLeverage(Number.parseFloat(newLeverage.toFixed(1)));
    }
  };

  const handleTokenSelect = (token: Tokenn) => {
    setTokenPair((prev) => ({
      ...prev,
      [selectorConfig.type]: token,
    }));
    setSelectorConfig({ isOpen: false, type: "paying" });
  };

  const handleSwitch = () => {
    setTokenPair({
      paying: tokenPair.receiving,
      receiving: tokenPair.paying,
    });
  };

  const getButtonText = () => {
    if (!publicKey) return "Connect Wallet";
    if (!tokenPair.paying || !tokenPair.receiving) return "Select tokens";
    if (!inputAmount) return "Enter an amount";
    return mode === "Long" ? "Open Long Position" : "Swap";
  };

  return (
    <div className="w-full relative max-w-3xl mx-auto flex flex-col gap-4 justify-center items-center my-20">
      <div className="flex justify-between text-sm text-neutral-400 float-right">
        {/* Slippage indicator */}
        <div className="flex justify-end mb-2 relative">
          <button
            className="flex items-center bg-transparent text-white"
            onClick={() => setSlippageDropdownOpen(!slippageDropdownOpen)}
          >
            <FilterListIcon />
            {slippage}%
          </button>

          {/* Slippage dropdown */}
          {slippageDropdownOpen && (
            <div className="absolute right-0 top-8 bg-secondary border border-primary/10 rounded-lg p-3 z-10 w-48">
              <div className="text-sm mb-2 text-white">Slippage Tolerance</div>
              <div className="flex flex-wrap gap-2">
                {slippageOptions.map((option) => (
                  <button
                    key={option}
                    className={`px-3 py-1 rounded-md ${
                      slippage === option
                        ? "bg-primary/10 text-[#4caf50]"
                        : "bg-primary/20"
                    }`}
                    onClick={() => {
                      setSlippage(option);
                      setSlippageDropdownOpen(false);
                    }}
                  >
                    {option}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="max-w-md bg-secondary border border-neutral-800 rounded-xl text-white">
        <div className="p-4 space-y-4">
          {/* Paying Section */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-400">YOU PAY</span>
              <span className="text-sm text-neutral-400">
                Balance: {0} {/* Would fetch balance in real app */}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-background border-neutral-800 hover:bg-primary/10 text-white hover:border-primary/30"
                onClick={() =>
                  setSelectorConfig({ isOpen: true, type: "paying" })
                }
              >
                {tokenPair.paying ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        tokenPair.paying.info?.imageUrl ||
                        `/placeholder.svg?height=20&width=20`
                      }
                      alt={tokenPair.paying.baseToken.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{tokenPair.paying.baseToken.symbol}</span>
                  </div>
                ) : (
                  "Select token"
                )}
                <ChevronDown className="ml-5 h-4 w-4" />
              </Button>
              <Input
                type="text"
                placeholder="0.00"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                className="bg-background no-scrollbar focus:border-primary/10 border-neutral-800 text-right overflow-hidden"
              />
            </div>
          </div>

          {/* Leverage controls */}
          {mode === "Long" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className={`px-3 ${
                  leverage === 1.1 ? "bg-primary/10" : "bg-background"
                }`}
                onClick={() => handleLeverageChange(1.1)}
              >
                1.1x
              </Button>

              <div className="flex-1 bg-background rounded-lg flex items-center justify-between px-4 py-2 border border-neutral-800">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleLeverageChange(leverage - 0.1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span>Leverage {leverage.toFixed(1)}x</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleLeverageChange(leverage + 0.1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                className={`px-3 ${
                  leverage === 3.2 ? "bg-primary/10" : "bg-background"
                }`}
                onClick={() => handleLeverageChange(3.2)}
              >
                3.2x
              </Button>
            </div>
          )}

          {/* Switch Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-background border border-primary/50 hover:bg-secondary"
              onClick={handleSwitch}
            >
              <ArrowDownUp className="h-4 w-4 text-white" />
            </Button>
          </div>

          {/* Receiving Section */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-400">
                {mode === "Long" ? "YOU LONG" : "YOU RECEIVE"}
              </span>
              <span className="text-sm text-neutral-400">
                Balance: {0} {/* Would fetch balance in real app */}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-background border-neutral-800 hover:bg-primary/10 text-white hover:border-primary/30"
                onClick={() =>
                  setSelectorConfig({ isOpen: true, type: "receiving" })
                }
              >
                {tokenPair.receiving ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        tokenPair.receiving.info?.imageUrl ||
                        `/placeholder.svg?height=20&width=20`
                      }
                      alt={tokenPair.receiving.baseToken.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{tokenPair.receiving.baseToken.symbol}</span>
                  </div>
                ) : (
                  "Select token"
                )}
                <ChevronDown className="ml-5 h-4 w-4" />
              </Button>
              <Input
                type="text"
                placeholder="0.00"
                value={calculateOutput()}
                readOnly
                className="bg-background focus:border-primary/10 border-neutral-800 text-right no-scrollbar"
              />
            </div>
          </div>

          <TokenSelector
            isOpen={selectorConfig.isOpen}
            onClose={() =>
              setSelectorConfig({ ...selectorConfig, isOpen: false })
            }
            onSelect={handleTokenSelect}
          />
        </div>
      </div>

      {connected ? (
        <Button
          className="w-40 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600"
          disabled={!tokenPair.paying || !tokenPair.receiving || !inputAmount}
        >
          {getButtonText()}
        </Button>
      ) : (
        <WalletMultiButton
          style={{
            margin: "1px 0",
            padding: "2px 15px",
            borderRadius: "20px",
            backgroundColor: "#0E0E0F",
            fontSize: "14px",
            color: "white",
            border: "1px solid rgba(42, 96, 58, 0.57)",
          }}
        />
      )}
    </div>
  );
}
