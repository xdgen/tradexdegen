import React from 'react';

const pairs = [
  { base: 'BTC', quote: 'USDT' },
  { base: 'ETH', quote: 'USDT' },
  { base: 'SOL', quote: 'USDT' },
];

interface NewpairsProps {
  selectedPair: { base: string; quote: string };
  onPairChange: (pair: { base: string; quote: string }) => void;
}

const Newpairs: React.FC<NewpairsProps> = ({ selectedPair, onPairChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [base, quote] = e.target.value.split('/');
    onPairChange({ base, quote });
  };

  return (
    <div className="p-4">
      <h2>New Pairs</h2>
      <p>New token pairs are updated in real-time...</p>
      <label className="block text-sm font-medium text-gray-700">Select Pair</label>
      <select
        className="block w-full mt-1 p-2 border rounded-md"
        value={`${selectedPair.base}/${selectedPair.quote}`}
        onChange={handleChange}
      >
        {pairs.map((pair) => (
          <option key={`${pair.base}/${pair.quote}`} value={`${pair.base}/${pair.quote}`}>
            {pair.base}/{pair.quote}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Newpairs;
