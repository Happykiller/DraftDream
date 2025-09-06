import { Query, Resolver } from '@nestjs/graphql';
import { ObjectType, Field } from '@nestjs/graphql';
import inversify from './inversify/investify';

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

  @Query(() => Hello, { name: 'db_test' })
  async db_test() {
    const response = await inversify.dbTestUsecase.execute();
    return { message: `Hello from mongo : ${response}` };
  }
}
