import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"


export default function DemoFund() {
  const location = useLocation();
  const [balance, setBalance] = useState('');
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { publicKey } = useWallet();

  const handleCreateFund = () => {
    setShowDialog(true);
  };

  const handleSetBalance = () => {
    window.location.href = `/funds?balance=${balance}`;
  };

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
          <Dialog>
            <DialogTrigger>{publicKey ? (
              <button
                className="bg-green-400 text-black font-semibold py-2 px-4 rounded-full"
                onClick={handleCreateFund}
              >
                Create Demo Fund
              </button>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-white mb-2 text-[13px] bg-primary/10 px-1">Connect your wallet to create a Demo Fund</p>
                <WalletMultiButton style={{ padding: '10px 20px', borderRadius: '8px' }} />
              </div>
            )}</DialogTrigger>
            {showDialog && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className='text-white'>Set balance for demo account</DialogTitle>
                  <DialogDescription>
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
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-2">Demo Fund</h1>
      <p className="text-gray-400 mb-6">New token pairs are updated in real-time</p>
      <div className="bg-[#111] rounded-lg p-6">
        <div className="flex items-center mb-4">
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
            <Dialog>
            <DialogTrigger>
              <button
                className="bg-white text-black font-semibold py-2 px-4 rounded-full"
                onClick={handleCreateFund}
              >
                Edit balance
              </button>
            </DialogTrigger>
            {showDialog && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className='text-white'>Set balance for demo account</DialogTitle>
                  <DialogDescription>
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
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            )}
          </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}