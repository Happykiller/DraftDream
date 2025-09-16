import { env } from "@app/config/env";

// src\services\graphql\graphql.service.fetch.ts
export class GraphqlServiceFetch {
  private inversify: any;

  constructor(
    inversify: any,
  ) {
    this.inversify = inversify;
  }

  async send(datas: any): Promise<any> {
    try {
      const storageRaw = localStorage.getItem(env.accessTokenStorageKey);
      let token: string | undefined;

      if (storageRaw) {
        try {
          const storage = JSON.parse(storageRaw);
          token = storage?.state?.access_token;
        } catch (err) {
          this.inversify.loggerService.warn('GraphqlServiceFetch#send => Failed to parse localStorage');
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
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
