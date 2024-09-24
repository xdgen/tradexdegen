'use client'
import React from 'react'
import { useState } from 'react'
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTrigger,
} from "../components/ui/dialog"



const Waitlist: React.FC = () => {

    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    // Dialog open state
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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
                setIsDialogOpen(false);
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
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger><button className="bg-primary rounded-full py-3 px-6 text-black hover:bg-primary/80" data-aos="fade-up"onClick={() => setIsDialogOpen(true)}>Join Waitlist</button></DialogTrigger>
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
                                <button type="submit" className="bg-primary rounded-full py-3 px-6 text-black hover:bg-primary/80">Join</button>
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
