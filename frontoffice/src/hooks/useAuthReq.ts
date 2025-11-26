// src\hooks\useAuthReq.ts
import { session } from '@stores/session';
import { CODES } from '@src/commons/CODES';
import inversify from '@src/commons/inversify';

interface AuthResponse {
  data: {
    auth: {
      access_token: string;
    };
  };
  errors?: { message: string }[];
}

interface MeResponse {
  data: {
    me: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      type: string;
    };
  };
}

export const useAuthReq = () => {
  const execute = async (dto: {
    email: string;
    password: string;
  }): Promise<{
    message: CODES;
    data?: {
      access_token: string;
      id: string;
      name_first: string;
      name_last: string;
      mail: string;
      role: string;
    };
    error?: string;
  }> => {
    try {
      const auth = (await inversify.graphqlService.send({
        operationName: 'Auth',
        variables: { input: dto },
        query: `mutation Auth($input: AuthInput!) { auth(input: $input) { access_token } }`,
      })) as AuthResponse;

      if (auth.errors) {
        throw new Error(auth.errors[0].message);
      }

      const { access_token } = auth.data.auth;
      session.setState({ access_token });

      const who = (await inversify.graphqlService.send({
        operationName: 'Me',
        query: `query Me { me { id type first_name last_name email phone createdAt updatedAt } }`,
      })) as MeResponse;

      session.setState({
        id: who.data.me.id,
        name_first: who.data.me.first_name,
        name_last: who.data.me.last_name,
        role: who.data.me.type,
      });

      return {
        message: CODES.SUCCESS,
        data: {
          access_token,
          id: who.data.me.id,
          name_first: who.data.me.first_name,
          name_last: who.data.me.last_name,
          mail: who.data.me.email,
          role: who.data.me.type,
        },
      };
    } catch (e: any) {
      return {
        message: CODES.AUTH_FAIL_WRONG_CREDENTIAL,
        error: e.message,
      };
    }
  };

  return { execute };
};
