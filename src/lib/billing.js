export const getFeature = (billing, key) => {
    return billing?.subscription?.features?.[key] || null;
  };
  
  export const isFeatureEnabled = (billing, key) => {
    const feature = getFeature(billing, key);
    return feature?.enabled === true;
  };
  
  export const isLimitReached = (billing, key) => {
    const feature = getFeature(billing, key);
  
    if (!feature) return true;
    if (feature.limit === null) return false; // unlimited
  
    return feature.used >= feature.limit;
  };
  
  export const canUseFeature = (billing, key) => {
    return isFeatureEnabled(billing, key) && !isLimitReached(billing, key);
  };