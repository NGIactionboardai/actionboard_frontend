import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery';

const ORG_STORAGE_KEYS = {
  CURRENT_ORG: 'meetingsummarizer_current_org',
  USER_ORGS: 'meetingsummarizer_user_orgs',
};

const storage = {
  set: (key, value) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage item ${key}:`, error);
    }
  },
};

export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery: axiosBaseQuery({ baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/organisations` }),
  tagTypes: ['UserOrgs', 'Org', 'PendingOwnershipTransfer'],
  endpoints: (builder) => ({
    getUserOrganizations: builder.query({
      query: () => ({ url: '/my-organisations/' }),
      providesTags: ['UserOrgs'],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          storage.set(ORG_STORAGE_KEYS.USER_ORGS, data);
        } catch {
          // fetch failed — leave any previously-cached list in localStorage alone
        }
      },
    }),

    getOrganizationDetails: builder.query({
      query: (orgId) => ({ url: `/${orgId}/` }),
      providesTags: (result, error, orgId) => [{ type: 'Org', id: orgId }],
    }),

    createOrganization: builder.mutation({
      query: ({ name, color }) => ({
        url: '/create-organization/',
        method: 'post',
        data: { name: name.trim(), color: color || '#4F46E5' },
      }),
      transformResponse: (response) => ({
        organization: response,
        message: response?.message || 'Organization created successfully',
      }),
      invalidatesTags: ['UserOrgs'],
    }),

    updateOrganization: builder.mutation({
      query: ({ orgId, updateData }) => ({
        url: `/update-organization/${orgId}/`,
        method: 'patch',
        data: { name: updateData.name.trim(), color: updateData.color },
      }),
      transformResponse: (response) => ({
        organization: response,
        message: response?.message || 'Organization updated successfully',
      }),
      invalidatesTags: (result, error, { orgId }) => [{ type: 'Org', id: orgId }, 'UserOrgs'],
    }),

    uploadOrganizationLogo: builder.mutation({
      query: ({ orgId, file }) => {
        const formData = new FormData();
        formData.append('logo', file);
        return { url: `/${orgId}/logo/`, method: 'post', data: formData };
      },
      invalidatesTags: (result, error, { orgId }) => [{ type: 'Org', id: orgId }, 'UserOrgs'],
    }),

    deleteOrganizationLogo: builder.mutation({
      query: (orgId) => ({ url: `/${orgId}/logo/`, method: 'delete' }),
      invalidatesTags: (result, error, orgId) => [{ type: 'Org', id: orgId }, 'UserOrgs'],
    }),

    deleteOrganization: builder.mutation({
      query: (orgId) => ({ url: `/delete-organization/${orgId}/`, method: 'delete' }),
      invalidatesTags: (result, error, orgId) => [{ type: 'Org', id: orgId }, 'UserOrgs'],
    }),

    initiateOwnershipTransfer: builder.mutation({
      query: ({ orgId, targetEmail, initiatorNewRole }) => ({
        url: `/${orgId}/memberships/transfer-ownership/`,
        method: 'post',
        data: { target_email: targetEmail, initiator_new_role: initiatorNewRole || null },
      }),
      invalidatesTags: (result, error, { orgId }) => [{ type: 'PendingOwnershipTransfer', id: orgId }],
    }),

    getPendingOwnershipTransfer: builder.query({
      query: (orgId) => ({ url: `/${orgId}/memberships/transfer-ownership/` }),
      transformResponse: (response) => response?.transfer || null,
      providesTags: (result, error, orgId) => [{ type: 'PendingOwnershipTransfer', id: orgId }],
    }),

    cancelOwnershipTransfer: builder.mutation({
      query: (orgId) => ({ url: `/${orgId}/memberships/transfer-ownership/`, method: 'delete' }),
      invalidatesTags: (result, error, orgId) => [{ type: 'PendingOwnershipTransfer', id: orgId }],
    }),
  }),
});

export const {
  useGetUserOrganizationsQuery,
  useGetOrganizationDetailsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useUploadOrganizationLogoMutation,
  useDeleteOrganizationLogoMutation,
  useDeleteOrganizationMutation,
  useInitiateOwnershipTransferMutation,
  useGetPendingOwnershipTransferQuery,
  useCancelOwnershipTransferMutation,
} = organizationApi;
