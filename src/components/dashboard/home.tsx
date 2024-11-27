import { X, Lock, Copy, DollarSign, BarChart3 } from "lucide-react"
import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { claimXSOL, SolToken } from "../testToken"
import { toast } from "sonner"
import { Skeleton } from "../../components/ui/skeleton";

export default function HomeView() {
  const [showDialog, setShowDialog] = useState(false)
  const [balance, setBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const { publicKey } = useWallet()
  const [pairs, setPairs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // const handleCreateFund = () => {
  //   setShowDialog(true)
  // }

  const handleSetBalance = () => {
    // Here you would typically make an API call to create the fund
    // For this example, we'll just redirect to the demo fund page
    window.location.href = `/funds?balance=${balance}`
  }

  const testSol = async (walletAddress: string) => {
    try {
      setLoading(true)
      const response = await SolToken(walletAddress);
      console.log(response);
      toast.success("Successful")
      return
    } catch (error) {
      toast.warning("Transaction might have failed")
      console.log(error)
      return
    } finally {
      setLoading(false)
    }
  }

  const claim = async () => {
    
    if (!publicKey) {
      alert('Please connect your wallet!');
      return;
    }
    try {
      setLoading(true)
      const tx = await claimXSOL(publicKey);

      console.log(tx?.message);

      toast.success("Successful")
      return { message: tx?.message || "success" };
    } catch (error) {
      toast.warning("Transaction might have failed")
      console.error(error);
      if (error instanceof Error) {
        throw new Error(error.message || "failed");
      } else {
        throw new Error("failed");
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=sol/sol');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setPairs(data.pairs.slice(0, 4)); // Limit to the first 4 pairs
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load pairs');
        setLoading(false);
      }
    };

    fetchPairs();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full bg-background" />
        ))}
      </div>
    );
  }


  const formatAge = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  if (error) return <div className="text-white p-4">{error}</div>;


  return (
    <div className="bg-black text-white min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-2">Home page</h1>
      <p className="text-gray-400 mb-6">New token pairs are updated in real-time</p>

      <div className="bg-[#111] rounded-lg p-6 mb-6 relative overflow-hidden">
        {/* <div className="absolute top-0 right-0 p-4">
          <X className="h-6 w-6 text-gray-500 cursor-pointer" />
        </div> */}
        <div className="relative z-10">
          <h2 className="text-sm font-semibold mb-2 uppercase">Start demo trading</h2>
          <h3 className="text-3xl font-bold mb-4 max-w-md">
            Perfect Your Strategy Before You Trade for Real
          </h3>
          <Dialog>
            <DialogTrigger>{publicKey ? (
              <div className='flex gap-4'>
                <Dialog>
                  <DialogTrigger className="bg-white/10 rounded-full p-2 hover:bg-primary/20 border-white/10 border hover:border hover:border-primary"
                  >
                    Claim Faucet
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className='text-white text-xl'>Claim your faucet</DialogTitle>
                      <DialogDescription className='flex flex-col gap-2'>
                        <p className='text-sm text-green-500'>If the Xdegen faucet is playing hard to get, no worries! Try claiming from an external faucet instead.</p>
                        <div className='my-2 p-[0.5px] w-full bg-white/30'></div>
                        <button className="bg-white/10 text-white rounded-full p-2 hover:bg-primary/20 border-white/10 border hover:border hover:border-primary w-full"
                          onClick={() => testSol(publicKey.toBase58())} disabled={loading}>
                          Claim Faucet
                        </button>
                        <a href='https://faucet.solana.com/' target='_blank' className="bg-white/10 text-white rounded-full p-2 hover:bg-primary/20 border-white/10 border hover:border hover:border-primary w-full text-center self-center">
                          Claim faucet from Solana.com
                        </a>
                        <a href='https://faucet.quicknode.com/solana/devnet' target='_blank' className="bg-white/10 text-white rounded-full p-2 hover:bg-primary/20 border-white/10 border hover:border hover:border-primary w-full text-center self-center">
                          Claim faucet from QuickNode
                        </a>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <button
                  className="bg-green-400 hover:bg-primary text-black font-semibold py-2 px-4 rounded-full"
                  onClick={() => claim()} disabled={loading}
                >

                  Claim XSOL
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-start justify-start">
                <p className="text-white mb-2 text-[13px] bg-primary/10 px-1">Connect your wallet to create a Demo Fund</p>
                <span className='border border-gray-700/40 rounded-full px-4 py-[1px] flex items-center hover:border-primary transition-all duration-300 ease-in-out'>
                  <WalletMultiButton
                    style={{
                      padding: '0',
                      borderRadius: '0',
                      backgroundColor: '#0E0E0F',
                      fontSize: '14px',
                      color: 'white',
                    }}
                  />
                </span>
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
        <div className="absolute bottom-0 right-0 w-1/2 h-full">
          <div className="absolute bottom-0 right-0 w-full h-full rounded-tr-lg"></div>
          <img src="/images/bigstring.png" alt="Abstract design" className="absolute bottom-0 right-0 w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-0 right-0 w-1/2 h-full">
          <div className="absolute bottom-0 right-0 w-full h-full rounded-tr-lg"></div>
          <img src="/images/circle.png" alt="Abstract design" className="absolute top-0 -left-[40%] w-auto h-auto object-cover" />
        </div>
        <div className="absolute bottom-0 right-0 w-1/2 h-full">
          <div className="absolute bottom-0 right-0 w-full h-full rounded-tr-lg"></div>
          <img src="/images/spring.png" alt="Abstract design" className="absolute bottom-0 -left-[40%] w-auto h-auto object-cover" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pairs.map((pair, index) => (
          <div key={index} className="bg-[#111] rounded-lg p-4 flex flex-col">
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                <img src={pair.info?.imageUrl || '/placeholder.svg'} alt={pair.baseToken.symbol} className="w-6 h-6 mr-2 rounded-full" />
              </div>
              <span className="text-gray-400">{pair.baseToken.symbol}/{pair.quoteToken.symbol}</span>
              <span className="text-gray-500 text-xs ml-auto">{formatAge(pair.pairCreatedAt)}</span>
            </div>
            <div className="text-2xl font-bold mb-1">${parseFloat(pair.priceUsd).toFixed(6)}</div>
            <div className={`text-sm ${pair.priceChange?.h24 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pair.priceChange?.h24 >= 0 ? '↑' : '↓'} {Math.abs(pair.priceChange?.h24 || 0).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}