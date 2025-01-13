import React from "react";
import green from "../../../public/images/green.png";
import red from "../../../public/images/red.png";
import Xman from "../../../public/images/xman.png";
import QR from "../../../public/images/qrcode.png";
import logo from "../../../public/images/x.png";

interface PnlCardProps {
  isProfit: boolean;
  percentage: number;
  tokenSymbol: string;
  amount: number;
  duration: string;
  price: number;
}

const PnlCard: React.FC<PnlCardProps> = ({
  isProfit,
  percentage,
  tokenSymbol,
  amount,
  duration,
  price,
}) => {
  return (
    <div className="w-full h- max-w-md rounded-sm overflow-hidden bg-[#0a0a0a] p-6 relative">
      {/* Profile Section */}
      <div className="flex items-center mb-8">
        {/* <div className="w-10 h-10 rounded-full bg-gray-600 mr-3"></div> */}
        {/* <div>
          <h3 className="text-white">Silicon Ninjaa</h3>
          <span className={`text-sm ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
            {isProfit ? 'LONG' : 'SHORT'}
          </span>
        </div> */}
        {/* Trade Complete Badge */}
        <div className="ml-auto">
          {/* <div
            className={`px-4 py-2 rounded-full ${
              isProfit ? "bg-green-500/10" : "bg-red-500/10"
            } flex items-center gap-2`}
          >
           
          </div> */}
          <div className="text-white text-[10px] bg-secondary px-2 py-1 rounded-full flex items-center gap-2 flex-row">
            <div
              className={`w-2 h-2 rounded-full ${
                isProfit ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <div className="flex items-start justify-start flex-col">
              Trade Complete
              <span className="text-[10px]">2025. Sun 12, Jan.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Token and Percentage */}
      <div className="mb-2">
        <h2 className="text-2xl text-white font-mono">${tokenSymbol}</h2>
        <div
          className={`text-3xl font-bold ${
            isProfit ? "text-green-500" : "text-red-500"
          }`}
        >
          {isProfit ? "+" : "-"}
          {percentage}%
        </div>
      </div>

      {/* Trade Info Pills */}
      <div className="flex gap-2 mb-8">
        <div className="bg-white/80 px-3 py-1 rounded-lg text-secondary text-[10px]">
          ${amount}
        </div>
        <div className="bg-white/80 px-3 py-1 rounded-lg text-secondary text-[10px]">
          £ {0}
        </div>
        <div className="bg-white/80 px-3 py-1 rounded-lg text-secondary text-[10px]">
          {duration}
        </div>
      </div>

      {/* Chart Section - This would be a placeholder for your actual chart */}
      <div className="h-32 mb-8">
        <img
          src={isProfit ? green : red}
          alt="Pnl Chart profit"
          className="w-full h-full"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={QR} alt="Pnl Chart profit" className="w-37 h-10" />
        </div>
      </div>
      <img
        src={Xman}
        alt="Pnl Chart profit"
        className="w-fit h-full absolute top-0 right-0"
      />
      <img
        src={logo}
        alt="Pnl Chart profit"
        className="w-5 h-5 absolute bottom-4 right-4"
      />
    </div>
  );
};

export default PnlCard;
