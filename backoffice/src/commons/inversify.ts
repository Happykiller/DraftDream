// src\commons\inversify.ts
import { GraphqlServiceFetch } from "@src/services/graphql/graphql.service.fetch";


export class Inversify {
  graphqlService: GraphqlServiceFetch;
  loggerService?: { error: (msg: string) => void };

  constructor() {
    // Usecases

    // Services
    this.graphqlService = new GraphqlServiceFetch(this);
  }
}

const inversify = new Inversify();

export default inversify;