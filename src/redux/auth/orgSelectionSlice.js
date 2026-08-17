import { createSlice } from '@reduxjs/toolkit';

const CURRENT_ORG_ID_KEY = 'meetingsummarizer_current_org';

function readStoredOrgId() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_ORG_ID_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Back-compat: earlier versions stored the whole org object here.
    if (parsed && typeof parsed === 'object') return parsed.org_id || parsed.id || null;
    return parsed;
  } catch {
    return null;
  }
}

function persistOrgId(orgId) {
  if (typeof window === 'undefined') return;
  try {
    if (orgId) localStorage.setItem(CURRENT_ORG_ID_KEY, JSON.stringify(orgId));
    else localStorage.removeItem(CURRENT_ORG_ID_KEY);
  } catch (error) {
    console.error('Error persisting current org id:', error);
  }
}

const orgSelectionSlice = createSlice({
  name: 'orgSelection',
  initialState: {
    currentOrganizationId: readStoredOrgId(),
    selectedOrgId: null,
  },
  reducers: {
    setCurrentOrganizationId: (state, action) => {
      state.currentOrganizationId = action.payload;
      persistOrgId(action.payload);
    },
    clearCurrentOrganizationId: (state) => {
      state.currentOrganizationId = null;
      persistOrgId(null);
    },
    setSelectedOrgId: (state, action) => {
      state.selectedOrgId = action.payload;
    },
  },
});

export const { setCurrentOrganizationId, clearCurrentOrganizationId, setSelectedOrgId } =
  orgSelectionSlice.actions;

export const selectCurrentOrganizationId = (state) => state.orgSelection?.currentOrganizationId || null;
export const selectSelectedOrgId = (state) => state.orgSelection?.selectedOrgId || null;

export default orgSelectionSlice.reducer;
