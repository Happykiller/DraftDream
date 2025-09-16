// src\commons\inversify.ts
import { GraphqlServiceFetch } from "@app/services/graphql/graphql.service.fetch";


export class Inversify {
  graphqlService: GraphqlServiceFetch;

  constructor() {
    // Usecases

    // Services
    this.graphqlService = new GraphqlServiceFetch(this);
  }
}

const inversify = new Inversify();

export default inversify;