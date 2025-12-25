// src/services/auth/auth.service.ts
import inversify from '@src/commons/inversify';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthPayload = {
  auth: {
    access_token: string;
  };
};

export type MeProfile = {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type MePayload = {
  me: MeProfile | null;
};

export type AuthResult = {
  accessToken: string;
  profile: MeProfile;
};

export const AUTH_ROLE_FORBIDDEN = 'AUTH_ROLE_FORBIDDEN';

const AUTH_MUTATION = `
  mutation Auth($input: AuthInput!) {
    auth(input: $input) {
      access_token
    }
  }
`;

const ME_QUERY = `
  query Me {
    me {
      id
      type
      first_name
      last_name
      email
      phone
      createdAt
      updatedAt
    }
  }
`;

export class AuthService {
  private graphqlService: GraphqlServiceFetch;

  constructor(graphqlService: GraphqlServiceFetch = inversify.graphqlService) {
    this.graphqlService = graphqlService;
  }

  /**
   * Authenticate a user and ensure they have the admin role.
   */
  async authenticate(dto: AuthCredentials): Promise<AuthResult> {
    const { data: authData, errors: authErrors } = await this.graphqlService.send<
      AuthPayload,
      { input: AuthCredentials }
    >({
      operationName: 'Auth',
      variables: { input: dto },
      query: AUTH_MUTATION,
    });

    if (authErrors?.length) {
      throw new Error(authErrors[0].message);
    }

    const accessToken = authData?.auth?.access_token;
    if (!accessToken) {
      throw new Error('Missing access token');
    }

    const { data: meData, errors: meErrors } = await this.graphqlService.send<MePayload>(
      {
        operationName: 'Me',
        query: ME_QUERY,
      },
      { accessToken },
    );

    if (meErrors?.length) {
      throw new Error(meErrors[0].message);
    }

    const profile = meData?.me;
    if (!profile) {
      throw new Error('Missing user profile');
    }

    if (profile.type !== 'admin') {
      throw new Error(AUTH_ROLE_FORBIDDEN);
    }

    return { accessToken, profile };
  }
}
