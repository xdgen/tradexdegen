import React from 'react';
import Navbar from '../components/dashboard/navbar';
import CryptoListing from '../components/dashboard/listTable';

const NewPair:React.FC = () => {

    return (
        <div>
           <Navbar />
           <CryptoListing />
        </div>
    )
}

export default NewPair;