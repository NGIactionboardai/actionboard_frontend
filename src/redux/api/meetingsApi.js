import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery';

export const meetingsApi = createApi({
  reducerPath: 'meetingsApi',
  baseQuery: axiosBaseQuery({ baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/meetings` }),
  tagTypes: ['Meetings'],
  endpoints: (builder) => ({
    getMeetings: builder.query({
      query: (organizationId) => ({ url: `/zoom/list-meetings/${organizationId}/` }),
      transformResponse: (response) => response?.meetings || [],
      // Both a per-org tag (for callers that know the org) and a generic 'LIST' tag
      // (for callers like DeleteMeetingModal that only know a meetingId, not the org).
      providesTags: (result, error, organizationId) => [
        { type: 'Meetings', id: organizationId },
        { type: 'Meetings', id: 'LIST' },
      ],
    }),

    createMeeting: builder.mutation({
      query: ({ organizationId, data }) => ({
        url: `/create-meetings/${organizationId}/`,
        method: 'post',
        data,
      }),
      invalidatesTags: (result, error, { organizationId }) => [{ type: 'Meetings', id: organizationId }],
    }),

    updateMeeting: builder.mutation({
      query: ({ organizationId, meetingId, data }) => ({
        url: `/meeting/${organizationId}/${meetingId}/update/`,
        method: 'patch',
        data,
      }),
      invalidatesTags: (result, error, { organizationId }) => [{ type: 'Meetings', id: organizationId }],
    }),

    cancelMeeting: builder.mutation({
      query: ({ organizationId, meetingId, timezone }) => ({
        url: `/meeting/${organizationId}/${meetingId}/cancel/`,
        method: 'patch',
        data: { timezone },
      }),
      invalidatesTags: (result, error, { organizationId }) => [{ type: 'Meetings', id: organizationId }],
    }),

    deleteMeeting: builder.mutation({
      query: ({ meetingId, timezone }) => ({
        url: `/meeting/${meetingId}/delete/`,
        method: 'delete',
        data: { timezone },
      }),
      // No organizationId available at the call site — invalidate the generic list tag,
      // which is equivalent in practice since only one org's meeting list is ever mounted.
      invalidatesTags: [{ type: 'Meetings', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetMeetingsQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useCancelMeetingMutation,
  useDeleteMeetingMutation,
} = meetingsApi;
