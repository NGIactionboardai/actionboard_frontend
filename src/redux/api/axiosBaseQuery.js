import axios from 'axios';

// Normalizes axios error shapes into a single consistent structure.
// Reused from the pre-migration organizationSlice.js normalizeAxiosError helper.
export function normalizeAxiosError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;

  let message = 'An unexpected error occurred';
  let fieldErrors;

  if (data) {
    if (typeof data === 'string') {
      message = data;
    } else if (data.message) {
      message = data.message;
    } else if (data.detail) {
      message = data.detail;
    } else if (data.error) {
      message = data.error;
    }

    if (typeof data === 'object') {
      fieldErrors = data;
      if (!data.message && !data.detail && !data.error) {
        const firstVal = Object.values(data)[0];
        if (Array.isArray(firstVal)) message = firstVal[0];
        else if (typeof firstVal === 'string') message = firstVal;
      }
    }
  } else if (err?.message) {
    message = err.message;
  }

  return { message, fieldErrors, status };
}

// Lets RTK Query endpoints issue requests through the app's shared axios instance,
// so the existing global auth interceptor (bearer token attach, proactive refresh,
// 401 retry-once — see app/utils/registerAuthInterceptor.js) keeps working unchanged.
export const axiosBaseQuery =
  ({ baseUrl } = {}) =>
  async ({ url, method = 'get', data, params, headers }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      // Flat, not nested under `.data` — this is exactly the shape the old
      // createAsyncThunk rejectWithValue calls returned, so unwrap()'s catch
      // blocks across consumers (error?.message, error?.fieldErrors, ...)
      // keep working unchanged.
      return { error: normalizeAxiosError(axiosError) };
    }
  };
