// src/services/graphql/user.service.ts
import inversify from '@src/commons/inversify';

import { GraphqlServiceFetch } from './graphql.service.fetch';

export interface UserUpdateInput {
  id: string;
  email?: string;
  phone?: string | null;
}

export interface UserUpdateResult {
  id: string;
  email: string;
  phone?: string | null;
}

const USER_UPDATE_MUTATION = `
  mutation UpdateUser($input: UpdateUserInput!) {
    user_update(input: $input) {
      id
      email
      phone
    }
  }
`;

/** Updates the authenticated user's contact details. */
export async function userUpdate(input: UserUpdateInput): Promise<UserUpdateResult | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<{ user_update: UserUpdateResult | null }>({
    query: USER_UPDATE_MUTATION,
    operationName: 'UpdateUser',
    variables: { input },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.user_update ?? null;
}
