import React from 'react';
// import * as htmlToImage from 'html-to-image';
import Navbar from '../../components/dashboard/navbar';
// import PnlCard from '../../components/PnlCard';

const PnlPage: React.FC = () => {
    // Example transaction data - replace with your actual data source
    // const transactions = [
    //     { id: '1', isProfit: true, percentage: 4.875, tokenSymbol: "SOL", amount: 189, duration: "48hrs", price: 205 },
    //     { id: '2', isProfit: false, percentage: 4.875, tokenSymbol: "SOL", amount: 189, duration: "48hrs", price: 205 },
    // ];

    // Create a Map of refs using transaction IDs as keys
    // const cardRefs = useRef(new Map<string, React.RefObject<HTMLDivElement>>());

    // Add loading state map
    // const [downloadingStates, setDownloadingStates] = React.useState<{ [key: string]: boolean }>({});

    // Initialize refs for each transaction
    // transactions.forEach(transaction => {
    //     if (!cardRefs.current.has(transaction.id)) {
    //         cardRefs.current.set(transaction.id, React.createRef<HTMLDivElement>());
    //     }
    // });

    // const downloadCard = async (ref: React.RefObject<HTMLDivElement>, transactionId: string, filename: string) => {
    //     try {
    //         setDownloadingStates(prev => ({ ...prev, [transactionId]: true }));
            
    //         if (ref.current) {
    //             const blob = await htmlToImage.toBlob(ref.current, {
    //                 cacheBust: true,
    //                 skipFonts: true, // Skip font loading issues
    //                 filter: (node) => {
    //                     // Skip problematic elements if needed
    //                     return node.tagName !== 'i'; // Skip font-awesome icons if they cause issues
    //                 },
    //                 backgroundColor: '#13131A', // Match your background color
    //             });

    //             if (blob) {
    //                 const url = window.URL.createObjectURL(blob);
    //                 const link = document.createElement('a');
    //                 link.download = filename;
    //                 link.href = url;
    //                 link.click();
    //                 window.URL.revokeObjectURL(url);
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error generating image:', error);
    //         // Optionally show an error message to the user
    //     } finally {
    //         setDownloadingStates(prev => ({ ...prev, [transactionId]: false }));
    //     }
    // };

    return (
        <div>
            <Navbar />
            {/* <div className='w-full min-h-screen bg-secondary p-6'>
                <div className='max-w-7xl mx-auto'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {transactions.map(transaction => (
                            <div key={transaction.id}>
                                <div ref={cardRefs.current.get(transaction.id)}>
                                    <PnlCard
                                        isProfit={transaction.isProfit}
                                        percentage={transaction.percentage}
                                        tokenSymbol={transaction.tokenSymbol}
                                        amount={transaction.amount}
                                        duration={transaction.duration}
                                        price={transaction.price}
                                    />
                                </div>
                                <button 
                                    className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-all duration-300 text-[12px] text-white rounded disabled:opacity-50"
                                    onClick={() => downloadCard(
                                        cardRefs.current.get(transaction.id)!,
                                        transaction.id,
                                        `${transaction.isProfit ? 'profit' : 'loss'}-${transaction.tokenSymbol}-${transaction.id}.png`
                                    )}
                                    disabled={downloadingStates[transaction.id]}
                                >
                                    {downloadingStates[transaction.id] 
                                        ? 'Downloading...' 
                                        : `Download ${transaction.isProfit ? 'Profit' : 'Loss'} Card`
                                    }
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div> */}
            <div className='w-full h-screen bg-secondary flex justify-center items-center'>
                <h1 className='text-5xl text-white text-center mt-20'>
                    Coming Soon!
                </h1>
            </div>
        </div>
    );
};

export default PnlPage;