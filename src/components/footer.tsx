'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import XIcon from '@mui/icons-material/X';
import TelegramIcon from '@mui/icons-material/Telegram';

const Footer: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [buttonText, setButtonText] = useState('Join'); // Default button text
    const [isLoading, setIsLoading] = useState(false);    // Loading state
    const [isJoined, setIsJoined] = useState(false);      // Joined state

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Change button to "Joining..." and set loading state
        setButtonText('Joining...');
        setIsLoading(true);

        // Send email to backend
        try {
            const response = await fetch('https://xdegen-backend.onrender.com/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('You have successfully been added to the list');
                setStatus('Email added successfully!');
                setIsJoined(true); // Mark as joined
                setButtonText('Joined'); // Update button text to 'Joined'
            } else {
                toast.error(result.message); // Show the error message from the server
                setStatus(result.message);
                setButtonText('Join');// Reset button text in case of error
            }
        } catch (error) {
            toast.error("Couldn't connect, try again!");
            setStatus('Error submitting the email');
            setButtonText('Join'); // Reset button text in case of error
        } finally {
            setIsJoined(false); // Reset joining status after the request
        }

        setIsLoading(false); // End loading state
        setEmail(''); // Clear email input
    };

    return (
        <footer className="bg-background text-white py-8">
            <div className="mx-auto lg:px-[10%] flex flex-col md:flex-row justify-between items-center" data-aos="fade-up">
                <div className="flex items-center mb-6 md:mb-0">
                    <div className="">
                        <img src="/images/logo.svg" alt="logo" className="w-full h-full" />
                    </div>
                </div>

                {/* Right Section - Newsletter */}
                <div className="text-center md:text-right justify-start flex flex-col items-start p-6">
                    <h4 className="text-lg font-semibold text-start">Join our newsletter</h4>
                    <p className="text-gray-400 mb-4 text-sm text-start">
                        Be the first to know when we launch new updates and features.
                    </p>
                    <form className="flex justify-center md:justify-end gap-6" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-secondary text-white p-3 rounded-l-md focus:outline-none rounded-lg"
                            required
                        />
                        <button
                            type="submit"
                            className={`bg-primary rounded-full py-3 px-6 text-black hover:bg-primary/80 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading} // Disable button when loading
                        >
                            {buttonText} {/* Dynamic button text */}
                        </button>
                        {status && <p className="text-center mt-4 text-sm text-gray-600">{status}</p>}
                    </form>
                    <div className='flex justify-start items-center gap-4 py-4'>
                        <a href='https://x.com/X_dgen?t=2-iNsB2NYvARfFG980ILnw&s=09' className='p-2 rounded-full cursor-pointer'>
                            <XIcon className='w-full h-full hover:scale-125 transition-all' />
                        </a>
                        <a href='https://t.me/XDEGENCOMMUNITY' className='p-2 rounded-full cursor-pointer'>
                            <TelegramIcon className='w-full h-full hover:scale-125 transition-all' />
                        </a>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="mt-6 text-center text-white/80 w-full border-t border-secondary pt-4">
                ©2024 All rights reserved xdgen.com
            </div>
        </footer>
    );
};

export default Footer;
