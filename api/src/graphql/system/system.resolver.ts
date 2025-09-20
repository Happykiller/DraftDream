// src/nestjs/user/user.resolver.ts
import { Role } from '@graphql/common/ROLE';
import { version } from '../../../package.json';
import inversify from '@src/inversify/investify';
import { Query, Resolver } from '@nestjs/graphql';
import { ObjectType, Field } from '@nestjs/graphql';
import { Auth } from '@graphql/decorators/auth.decorator';

@ObjectType()
class System {
  @Field()
  message: string;
}

@Resolver(() => System)
export class SystemResolver {
  @Query(() => System, { name: 'version' })
  hello() {
    return { message: version};
  }

  @Query(() => System, { name: 'db_test' })
  @Auth(Role.ADMIN)
  async db_test() {
    const response = await inversify.dbTestUsecase.execute();
    return { message: `Hello from mongo : ${response}` };
  }
}
