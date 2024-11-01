import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTrigger,
} from "../components/ui/dialog";
import supabase from './testToken/database';

const Waitlist: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [buttonText, setButtonText] = useState('Join'); // Default button text
    const [isLoading, setIsLoading] = useState(false);    // Loading state
    const [isJoined, setIsJoined] = useState(false);      // Joined state

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Change button to "Joining" and set loading state
        setButtonText('Joining...');
        setIsLoading(true);

        // Send email to backend
        try {
            const { error } = await supabase
                .from('email')
                .insert({ email })

            if (error) {
                console.error(error)
                throw error
            }

            // const response = await fetch('https://xdegen-backend.onrender.com/api/waitlist', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ email }),
            // });

            // const result = await response.json();

            if (!error) {
                toast.success("You have successfully been added to the list");
                setStatus('Email added successfully!');
                setIsJoined(true); // Update state to joined
                setButtonText('Joined'); // Change button to "Joined"
            } else {
                toast.error("error Try again"); // Show the error message from the server
                setStatus("error");
                setButtonText('Join'); // Reset button text
            }
        } catch (error) {
            toast.error("Couldn't connect, try again!");
            setStatus('Error submitting the email');
            setButtonText('Join'); // Reset button text in case of error
        }
        finally {
            setIsJoined(false); // Reset joining status after the request
        }

        setIsLoading(false); // End loading state
        setEmail(''); // Clear the email input
    };

    return (
        <>
            <Dialog open={isJoined} onOpenChange={() => setIsJoined(!isJoined)}>
                <DialogTrigger>
                    <button
                        className={`bg-primary rounded-full py-3 px-6 text-black hover:bg-primary/80 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        data-aos="fade-up"
                        onClick={() => setIsJoined(false)}
                    >
                        {buttonText} {/* Dynamic button text */}
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogDescription>
                            <form className="flex flex-col justify-center md:justify-end gap-6" onSubmit={handleSubmit}>
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
                                {status && <p className="text-center mt-4 text-sm text-gray-600 absolute hidden">{status}</p>}
                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Waitlist;
