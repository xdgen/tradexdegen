import React from "react";
import { SwapInterface } from "../../components/swaps/swapInterface";
import Navbar from "../../components/dashboard/navbar";
import LeverageLong from "../../components/leverage/lavarage";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

const SwapPage: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-white">
      <Navbar />
      <Tabs defaultValue="swap" className="w-[400px] mt-4">
        <TabsList className="grid w-full grid-cols-2 text-white">
          <TabsTrigger value="swap" className="text-white">Swap</TabsTrigger>
          <TabsTrigger value="long" className="text-white">Long</TabsTrigger>
        </TabsList>
        <TabsContent value="swap">
          <SwapInterface />
        </TabsContent>
        <TabsContent value="long">
          <LeverageLong />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SwapPage;
