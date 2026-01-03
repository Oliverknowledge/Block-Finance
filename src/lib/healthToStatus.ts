import { type NetworkState } from "../types/network";
export function healthToStatus(score: number): NetworkState["status"] {
    if (score >= 90) return "healthy";
    if (score >= 75) return "busy";
    if (score >= 60) return "congested";
    if (score >= 40) return "degraded";
    return "incident";
  }
  