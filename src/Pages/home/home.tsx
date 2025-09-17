import React from 'react';
import Navbar from '../../components/dashboard/navbar';
import HomeView from '../../components/dashboard/home';

const HomePage:React.FC = () => {

    return (
        <div>
           <Navbar />
           <HomeView />
        </div>
    )
}

export default HomePage;