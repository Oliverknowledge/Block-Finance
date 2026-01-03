import { useState } from "react";
import { CHAINS } from "../lib/chainStakeData";
import { coinNameToTicker } from "../data/tickers";

type Props = {
  onSelect?: (chainId: string) => void;
};

const   ChainSelector = ({ onSelect }: Props) => {
  const [selected, setSelected] = useState<string>("polkadot");

  const handleSelect = (id: string) => {
    setSelected(id);    
    onSelect?.(id);
  };
  const logoToken = import.meta.env.VITE_LOGO_API;

  return (
    <div className="space-y-3">
      {CHAINS.map((chain) => {
        
        const ticker = coinNameToTicker[chain.name.toLowerCase()];
        return (
          <button
            key={chain.name}
            onClick={() => handleSelect(chain.name)}
            className={`w-full flex items-center justify-between rounded-xl border px-5 py-4 transition
            `}
          >
            {/* Left */}
            <div className="flex items-center gap-4">
              <img src={`https://img.logokit.com/crypto/${ticker}?token=${logoToken}`}

              />

              <div className="text-left">
                <p className="font-medium">{chain.name}</p>
                <p className="text-xs text-white/60">
                  Est. APY {chain.staking.baseApy}%
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="text-sm font-medium">
              Stake →
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ChainSelector;
