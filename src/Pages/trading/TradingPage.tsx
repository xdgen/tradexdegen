import Navbar from "../../components/dashboard/navbar";
import TradingInterface from "../../components/dashboard/tokenView";

export default function TradingPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <TradingInterface />
    </div>
  );
}