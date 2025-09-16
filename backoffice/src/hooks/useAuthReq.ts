// src\hooks\useAuthReq.ts
import { CODES } from '@app/commons/CODES';
import inversify from '@app/commons/inversify';

export const useAuthReq = () => {
  const execute = async (dto: {
    email: string;
    password: string;
  }): Promise<{
    message: CODES,
    data?: {
      access_token: string;
      id: string;
      code: string;
      name_first: string;
      name_last: string;
      description: string;
      mail: string;
      role: string;
    },
    error?: string
  }> => {
    try {
      const response: any = await inversify.graphqlService.send(
        {
          operationName: 'Auth',
          variables: { input: dto },
          query: `mutation Auth($input: AuthInput!) { auth(input: $input) { access_token } }`
        }
      );

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      return {
        message: CODES.SUCCESS,
        data: response.data.auth
      }
    } catch (e: any) {
      return {
        message: CODES.AUTH_FAIL_WRONG_CREDENTIAL,
        error: e.message
      }
    }
  };

  return { execute };
};
