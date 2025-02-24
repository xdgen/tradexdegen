import React from "react";
import { SwapInterface } from "../../components/swaps/swapInterface";
import Navbar from "../../components/dashboard/navbar";

const SwapPage: React.FC = () => {
  return (
    <div>
      <Navbar />
        <SwapInterface />
    </div>
  );
};

export default SwapPage;
