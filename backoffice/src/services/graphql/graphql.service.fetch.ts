// src\services\graphql\graphql.service.fetch.ts

import { env } from "@app/config/env";
import { session } from '@stores/session';

export class GraphqlServiceFetch {
  private inversify: any;

  constructor(
    inversify: any,
  ) {
    this.inversify = inversify;
  }

  async send(datas: any): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session.getState().access_token) {
        headers['Authorization'] = `Bearer ${session.getState().access_token}`;
      }

      const response = await fetch(env.graphqlEndpoint, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers,
        body: JSON.stringify(datas),
      });

      return await response.json();
    } catch (e: any) {
      this.inversify.loggerService.error(`GraphqlServiceFetch#send => ${e.message}`);
    }
  }
}
