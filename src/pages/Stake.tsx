import Tooltip from "../Components/Tooltip";
import ChainSelector from "../Components/ChainSelector";

const Stake = () => {
  return (
    <div className="px-6 md:px-10 pb-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-4">
          <h1 className="text-3xl font-semibold">Stake</h1>

          <p className="text-sm md:text-base max-w-2xl">
            Earn rewards on your idle assets and help secure the blockchain.
          </p>

          <Tooltip text="Users receive rewards by helping validate transactions on the network.">
            What is staking?
          </Tooltip>
        </header>

        <ChainSelector
          onSelect={(chainId) => {
            console.log("Selected chain:", chainId);
          }}
        />
        
      </div>
    </div>
  );
};

export default Stake;
