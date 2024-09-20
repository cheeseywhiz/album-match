import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { UserIdentity, LoginArgs } from './types';

const RtkBaseQuery = fetchBaseQuery({
    baseUrl: 'api/v1',
    credentials: 'include',
});

const VitalsBaseQuery: ReturnType<typeof fetchBaseQuery> = async (args, queryApi, extraOptions) => {
    const result = await RtkBaseQuery(args, queryApi, extraOptions);

    if (result.error && result.error.status === 401) {
        const identity: UserIdentity = { username: null };
        queryApi.dispatch(api.util.upsertQueryData('userIdentity', undefined, identity));
    }

    return result;
}

export const api = createApi({
    reducerPath: 'vitalsApi',
    baseQuery: VitalsBaseQuery,
    tagTypes: ['UserIdentity'],
    endpoints: (builder) => ({
        userIdentity: builder.query<UserIdentity, void>({
            providesTags: ['UserIdentity'],
            queryFn: async (_arg, _queryApi, _extraOptions, baseQuery) => {
                /* Merge the error result into the data result */
                const result = await baseQuery('user/me');

                if (result.error && result.error.status === 401) {
                    const identity: UserIdentity = { username: null };
                    return { data: identity };
                }

                if (result.data) {
                    return { data: result.data as UserIdentity };
                }

                return { error: result.error };
            },
        }),
        login: builder.mutation<UserIdentity, LoginArgs>({
            query: ({ username, password }) => ({
                url: 'user/login',
                method: 'POST',
                body: { username, password },
            }),
            onQueryStarted: async (_args, { dispatch, queryFulfilled }) => {
                /* set UserIdentity to the username that was logged in */
                try {
                    const result = await queryFulfilled;
                    const identity = result.data as { username: string };
                    dispatch(
                        api.util.updateQueryData('userIdentity', undefined, (draft) => {
                            Object.assign(draft, identity);
                        })
                    );
                } catch {
                    // defer error handling; do not update the identity cache yet
                }
            },
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: 'user/logout',
                method: 'POST',
            }),
            onQueryStarted: async (_args, { dispatch, queryFulfilled }) => {
                /* clear the userIdentity after the log out has been confirmed */
                const patch: UserIdentity = { username: null };

                try {
                    await queryFulfilled;
                    dispatch(
                        api.util.updateQueryData('userIdentity', undefined, (draft) => {
                            Object.assign(draft, patch);
                        })
                    );
                } catch {
                    // defer error handling; do not update the identity cache yet
                }
            },
        }),
        signUp: builder.mutation<void, LoginArgs>({
            query: ({ username, password }) => ({
                url: 'user/sign_up',
                method: 'POST',
                body: { username, password },
            }),
        }),
    }),
});

export const {
    useUserIdentityQuery,
    useLoginMutation,
    useLogoutMutation,
    useSignUpMutation,
} = api;
