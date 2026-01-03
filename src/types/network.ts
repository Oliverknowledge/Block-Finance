export type NetworkState = {
    score: number; 
    status: "healthy" | "busy" | "congested" | "degraded" | "incident";
    congestion: number; 
    simulatedAt: number; 
  };
  