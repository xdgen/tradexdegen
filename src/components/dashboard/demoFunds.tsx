import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { useWallet } from '@solana/wallet-adapter-react'; // Import useWallet hook

export default function DemoFund() {
  const location = useLocation(); // useLocation to get query params from the URL
  const [balance, setBalance] = useState('');
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { publicKey } = useWallet(); // Get the connected wallet's public key

  const handleCreateFund = () => {
    setShowDialog(true);
  };

  const handleSetBalance = () => {
    // Here you would typically make an API call to create the fund
    // For this example, we'll just redirect to the demo fund page
    window.location.href = `/funds?balance=${balance}`;
  };

  // Extract query parameters from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const balanceParam = searchParams.get('balance');

    if (balanceParam) {
      setBalance(balanceParam);
    } else {
      setShowEmptyState(true);
    }
  }, [location.search]);

  if (showEmptyState) {
    return (
      <div className="bg-black text-white min-h-screen p-6">
        <h1 className="text-4xl font-bold mb-2">Demo Fund</h1>
        <p className="text-gray-400 mb-6">New token pairs are updated in real-time</p>
        <div className="bg-[#111] rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-2xl font-bold mb-4">Your Fund is empty</h2>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            The fund will choose assets based on the specified rules. Rules can be changed by the
            creator in the future. Each rule represents how many and what assets should be
            included in a fund based on specific market conditions.
          </p>
          <button
            className="bg-green-400 text-black font-semibold py-2 px-4 rounded-full"
            onClick={handleCreateFund}
          >
            Create Demo Fund
          </button>
        </div>
        {showDialog && (
          <div className="fixed z-10 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-[#222] p-6 rounded-lg w-80">
              <h2 className="text-xl font-bold mb-4">Set balance for demo account</h2>
              {/* Display actual connected wallet address */}
              <p className="text-gray-400 mb-2">Account: {publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Not connected'}</p>
              <input
                type="number"
                placeholder="Amount to fund in dusdt"
                className="w-full bg-[#333] text-white p-2 rounded mb-4"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
              <button
                className="bg-green-400 text-black font-semibold py-2 px-4 rounded-full w-full"
                onClick={handleSetBalance}
              >
                Set Balance
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-2">Demo Fund</h1>
      <p className="text-gray-400 mb-6">New token pairs are updated in real-time</p>
      <div className="bg-[#111] rounded-lg p-6">
        <div className="flex items-center mb-4">
          {/* Display actual connected wallet address */}
          <div className="bg-[#222] text-gray-400 px-2 py-1 rounded text-sm">
            <p className="text-gray-400 mb-2">Account: {publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Not connected'}</p>
          </div>
          <svg className="w-4 h-4 text-gray-400 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4"></path>
          </svg>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm mb-1">Demo Balance</p>
            <p className="text-3xl font-bold">{balance} usdt</p>
          </div>
          <div>
            <a href='/trade' className="bg-green-400 text-black font-semibold py-2 px-4 rounded-full mr-2">
              Trade
            </a>
            <button className="bg-[#333] text-white font-semibold py-2 px-4 rounded-full">
              Set Balance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
