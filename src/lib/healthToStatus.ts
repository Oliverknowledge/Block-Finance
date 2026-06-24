type NetworkStatus = 'healthy' | 'busy' | 'congested' | 'degraded' | 'incident';

export function healthToStatus(score: number): NetworkStatus {
    if (score >= 90) return "healthy";
    if (score >= 75) return "busy";
    if (score >= 60) return "congested";
    if (score >= 40) return "degraded";
    return "incident";
  }
  
