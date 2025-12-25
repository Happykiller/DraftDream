// src\hooks\useAuthReq.ts
import { CODES } from '@src/commons/CODES';
import { session } from '@stores/session';
import {
  AuthService,
  AUTH_ROLE_FORBIDDEN,
  AuthCredentials,
} from '@services/auth/auth.service';

export const useAuthReq = () => {
  const authService = new AuthService();

  const execute = async (dto: AuthCredentials): Promise<{
    message: keyof typeof CODES;
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
      const { accessToken, profile } = await authService.authenticate(dto);
      session.setState({ access_token: accessToken });

      session.setState({
        id: profile.id,
        name_first: profile.first_name,
        name_last: profile.last_name,
        role: profile.type,
      });

      return {
        message: CODES.SUCCESS,
        data: {
          access_token: accessToken,
          id: profile.id,
          name_first: profile.first_name,
          name_last: profile.last_name,
          mail: profile.email,
          role: profile.type,
        },
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : CODES.AUTH_FAIL_WRONG_CREDENTIAL;

      if (message === AUTH_ROLE_FORBIDDEN) {
        session.getState().reset();
        return {
          message: CODES.AUTH_FAIL_WRONG_ROLE,
          error: CODES.AUTH_FAIL_WRONG_ROLE,
        };
      }

      return {
        message: CODES.AUTH_FAIL_WRONG_CREDENTIAL,
        error: message,
      };
    }
  };

  return { execute };
};
