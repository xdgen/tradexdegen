import React from 'react'
import Navbar from '../components/navbar'
import Header from '../components/header'
import CryptoGrid from '../components/tradeGrid'
import Video from '../components/video'
import FAQ from '../components/faq'
import Footer from '../components/footer'

const Landing = () => {
  return (
    <div>
        <>
            <Navbar />
            <Header />
            <CryptoGrid />
            <Video />
            <FAQ />
            <Footer />
        </>
    </div>
  )
}

export default Landing