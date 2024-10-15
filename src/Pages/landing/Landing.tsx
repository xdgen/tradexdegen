import React from 'react'
import Navbar from '../../components/navbar'
import Header from '../../components/header'
import CryptoGrid from '../../components/tradeGrid'
import Video from '../../components/video'
import FAQ from '../../components/faq'
import Footer from '../../components/footer'

const Landing: React.FC = () => {
  return (
    <div>
      <div>
        <div className="bg-secondary p-4 w-full h-full flex justify-between items-center">
          <div>
            <img src="/images/gen.svg" alt="logo" className="w-full h-full" />
          </div>
        </div>
        <Header />
        <CryptoGrid />
        <Video />
        <FAQ />
        <Footer />
      </div >
    </div>
  )
}

export default Landing