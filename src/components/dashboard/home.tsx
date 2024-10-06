import { X, Lock, Copy, DollarSign, BarChart3 } from "lucide-react"
import { useState } from 'react'

export default function HomeView() {
  const [showDialog, setShowDialog] = useState(false)
  const [balance, setBalance] = useState('')

  const handleCreateFund = () => {
    setShowDialog(true)
  }

  const handleSetBalance = () => {
    // Here you would typically make an API call to create the fund
    // For this example, we'll just redirect to the demo fund page
    window.location.href = `/funds?balance=${balance}`
  }


  return (
    <div className="bg-black text-white min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-2">Home page</h1>
      <p className="text-gray-400 mb-6">New token pairs are updated in real-time</p>

      <div className="bg-[#111] rounded-lg p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <X className="h-6 w-6 text-gray-500 cursor-pointer" />
        </div>
        <div className="relative z-10">
          <h2 className="text-sm font-semibold mb-2">CRYPTO CURRENCY FUNDS</h2>
          <h3 className="text-3xl font-bold mb-4 max-w-md">
            Explore on-chain funds deployed by the community or create yours.
          </h3>
          <button
            className="bg-green-400 text-black font-semibold py-2 px-4 rounded-full"
            onClick={handleCreateFund}
          >
            Create Demo Fund
          </button>
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
        {[
          { icon: Lock, label: "TVL", value: "$2,313,055", change: "202%", positive: true },
          { icon: Copy, label: "Volume", value: "$205,032,5...", change: "300%", positive: true },
          { icon: DollarSign, label: "Fees", value: "$121,548", change: "12.4%", positive: true },
          { icon: BarChart3, label: "Live funds", value: "118", change: "90%", positive: false },
        ].map((item, index) => (
          <div key={index} className="bg-[#111] rounded-lg p-4 flex flex-col">
            <div className="flex items-center mb-2">
              <div className="bg-gradient-to-br from-[#193EFF] to-[#09090A] p-2 rounded-md mr-2">
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-gray-400">{item.label}</span>
              <span className="text-gray-500 text-xs ml-auto">24H</span>
            </div>
            <div className="text-2xl font-bold mb-1">{item.value}</div>
            <div className={`text-sm ${item.positive ? 'text-green-400' : 'text-red-400'}`}>
              {item.positive ? '↑' : '↓'} {item.change}
            </div>
          </div>
        ))}
      </div>
      {showDialog && (
        <div className="fixed z-10 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#222] p-6 rounded-lg w-80">
            <h2 className="text-xl font-bold mb-4">Set balance for demo account</h2>
            <p className="text-gray-400 mb-2">Account: B4vF...KcCu</p>
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
  )
}