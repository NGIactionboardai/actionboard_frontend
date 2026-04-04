import { useSelector } from "react-redux";
import { canUseFeature, getFeature } from "@/lib/billing";

export const useFeature = (key) => {
  const billing = useSelector((state) => state.billing);

  const feature = getFeature(billing, key);

  return {
    canUse: canUseFeature(billing, key),
    enabled: feature?.enabled,
    used: feature?.used,
    limit: feature?.limit,
    remaining: feature?.remaining,
  };
};