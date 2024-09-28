import React, { useState } from "react";
import tokenList from "../../tokenList.json";
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface Token {
    address: string;
    decimals: number;
    img: string;
    name: string;
    ticker: string;
}

const Swap: React.FC = () => {
    const [tokenOneAmount, setTokenOneAmount] = useState<number | null>(null);
    const [tokenTwoAmount, setTokenTwoAmount] = useState<number | null>(null);
    const [tokenOne, setTokenOne] = useState<Token>(tokenList[0]);
    const [tokenTwo, setTokenTwo] = useState<Token>(tokenList[1]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [changeToken, setChangeToken] = useState<number>(1);

    const changeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTokenOneAmount(Number(e.target.value));
    };

    const switchTokens = () => {
        const one = tokenOne;
        const two = tokenTwo;
        setTokenOne(two);
        setTokenTwo(one);
    };

    const openModal = (asset: number) => {
        setChangeToken(asset);
        setIsOpen(true);
    };

    const modifyToken = (i: number) => {
        if (changeToken === 1) {
            setTokenOne(tokenList[i]);
        } else {
            setTokenTwo(tokenList[i]);
        }
        setIsOpen(false);
    };

    return (
        <>
            {/* Token Selection Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-secondary p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-white">Select a token</h4>
                            <button onClick={() => setIsOpen(false)} className="text-red-500">
                                Close
                            </button>
                        </div>
                        <div className="space-y-4">
                            {tokenList.map((token, index) => (
                                <div
                                    key={index}
                                    onClick={() => modifyToken(index)}
                                    className="flex text-white items-center cursor-pointer hover:bg-background p-2 rounded"
                                >
                                    <img src={token.img} alt={token.ticker} className="w-8 h-8 mr-4" />
                                    <div>
                                        <div className="font-bold">{token.name}</div>
                                        <div className="text-sm text-gray-500">{token.ticker}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Swap Box */}
            <div className="max-w-md mx-auto p-6 bg-secondary border border-white/10 rounded-lg shadow-sm mt-10">
                <div className='flex w-full justify-between items-center pb-6'>
                    <h2 className="text-2xl font-bold text-white">Swap</h2>
                    <SettingsIcon className='text-white' />
                </div>

                {/* First Token Input */}
                <div className="flex items-center justify-between mb-4">
                    <input
                        type="number"
                        placeholder="0"
                        value={tokenOneAmount || ""}
                        onChange={changeAmount}
                        className="w-3/5 p-4 text-white border border-background rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div
                        className="flex items-center cursor-pointer p-2 border rounded bg-gray-100 hover:bg-gray-200"
                        onClick={() => openModal(1)}
                    >
                        <img src={tokenOne.img} alt="tokenOneLogo" className="w-6 h-6 mr-2" />
                        <span className="font-semibold">{tokenOne.ticker}<KeyboardArrowDownIcon /></span>
                    </div>
                </div>

                {/* Switch Tokens Button */}
                <div className="w-full h-full flex justify-center items-center">
                    <button
                        className="w-10 h-10 flex justify-center items-center text-2xl mb-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full focus:outline-none"
                        onClick={switchTokens}
                    >
                        <ImportExportIcon />
                    </button>
                </div>

                {/* Second Token Input */}
                <div className="flex items-center justify-between mb-6">
                    <input
                        type="number"
                        placeholder="0"
                        value={tokenTwoAmount || ""}
                        className="w-3/5 p-4 border border-background text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div
                        className="flex items-center cursor-pointer p-2 border rounded bg-gray-100 hover:bg-gray-200"
                        onClick={() => openModal(2)}
                    >
                        <img src={tokenTwo.img} alt="tokenTwoLogo" className="w-6 h-6 mr-2" />
                        <span className="font-semibold">{tokenTwo.ticker}<KeyboardArrowDownIcon /></span>
                    </div>
                </div>

                {/* Swap Button */}
                <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                    Swap
                </button>
            </div>
        </>
    );
};

export default Swap;
