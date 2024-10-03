import React from 'react';
import Navbar from '../../components/dashboard/navbar';

const ComingSoon: React.FC = () => {

    return (
        <div>
            <Navbar />
            <div className='w-full h-screen bg-secondary flex justify-center items-center'>
                <h1 className='text-5xl text-white text-center mt-20'>
                    Coming Soon!
                </h1>
            </div>
        </div>
    )
}

export default ComingSoon;