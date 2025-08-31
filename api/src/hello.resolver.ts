import { Query, Resolver } from '@nestjs/graphql';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class Hello {
  @Field()
  message: string;
}

@Resolver(() => Hello)
export class HelloResolver {
  @Query(() => Hello, { name: 'hello' })
  hello() {
    return { message: 'Hello, DraftDream!' };
  }
}
