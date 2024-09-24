'use client'
import React from 'react'
import { useState } from 'react'
import { toast } from "sonner"


const Footer: React.FC = () => {

    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e: any) => {
        e.preventDefault();

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
                toast.success("You have successfully been added to the list")
                setStatus('Email added successfully!');
            } else {
                toast.error("Unsuccessfully added to the list")
                setStatus(result.message);
            }
        } catch (error) {
            toast.error("Couldn't connect, try again!")
            setStatus('Error submitting the email');
        }

        setEmail('');
    };

    return (
        <footer className="bg-background text-white py-8">
            <div className="mx-auto lg:px-[10%] flex flex-col md:flex-row justify-between items-center" data-aos="fade-up">
                <div className="flex items-center mb-6 md:mb-0">
                    <div className='w-[70px] h-[18px]'>
                        <img src='/images/logo.png' alt="logo" className="w-full h-full" />
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
                        <button type="submit" className="bg-primary rounded-full py-3 px-6 text-black hover:bg-primary/80">Join</button>
                        {status && <p className="text-center mt-4 text-sm text-gray-600 absolute hidden">{status}</p>}
                    </form>
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
