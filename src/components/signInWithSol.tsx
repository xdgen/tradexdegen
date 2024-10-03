import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';

const SignInWithSolana: FC = () => {
    const { publicKey, signMessage } = useWallet();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleSignIn = async () => {
        if (!publicKey || !signMessage) {
            toast.error('Please connect your wallet');
            console.log('PublicKey:', publicKey);
            console.log('signMessage function:', signMessage);
            return;
        }

        try {
            // Create a custom message for the user to sign
            const message = `Sign this message to authenticate with Xdegen: ${publicKey.toString()}`;
            const encodedMessage = new TextEncoder().encode(message);
            const signedMessage = await signMessage(encodedMessage);

            console.log('Signed message:', signedMessage);

            // Send the signed message and publicKey to your backend for verification
            const response = await fetch('http://localhost:5000/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    publicKey: publicKey.toString(),
                    signature: Array.from(signedMessage), // Convert Uint8Array to an array
                    message,  // Pass the message for backend verification
                }),
            });

            const data = await response.json();
            console.log('Backend response:', data);

            if (response.ok && data.isValid) {
                setIsAuthenticated(true);
                toast.success('Successfully signed in!');
            } else {
                toast.error('Failed to authenticate.');
            }
        } catch (error) {
            console.error('Signing error:', error);
            toast.error('Could not sign the message');
        }
    };

    return (
        <div className='w-full'>
            {!isAuthenticated ? (
                <button
                    onClick={handleSignIn}
                    className="bg-primary rounded-full py-3 px-6 text-black hover:bg-primary/80"
                >
                    Connect Wallet
                </button>
            ) : (
                <p>Welcome! You are signed in.</p>
            )}
        </div>
    );
};

export default SignInWithSolana;
