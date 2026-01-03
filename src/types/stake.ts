export type ChainConfig = {
    id: string;
    name: string;
    symbol: string;
  
    staking: {
      baseApy: number;        
      volatility: number;     
      lockupDays: number;
      unbondingDays: number;
    };
  
    network: {
      avgHealth: number;      
      volatility: number;     
      incidentChance: number; 
    };
  };
  