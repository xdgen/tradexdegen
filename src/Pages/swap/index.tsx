import React from 'react'
import Swap from '../../components/swapping/swap'
import SwapBar from '../../components/swapping/swapbar'

const SwapPage: React.FC = () => {
  return (
    <div>
        <SwapBar />
        <Swap />
    </div>
  )
}

export default SwapPage