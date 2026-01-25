// src/graphql/task/task.gql.types.ts
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { TaskPriority as TaskPriorityEnum } from '@src/common/task-priority.enum';
import { TaskStatus as TaskStatusEnum } from '@src/common/task-status.enum';
import { UserGql } from '@graphql/user/user.gql.types';

export { TaskPriorityEnum, TaskStatusEnum };

registerEnumType(TaskPriorityEnum, { name: 'TaskPriorityEnum' });
registerEnumType(TaskStatusEnum, { name: 'TaskStatusEnum' });

@ObjectType()
export class TaskGql {
  @Field(() => ID) id!: string;
  @Field() label!: string;
  @Field(() => TaskPriorityEnum) priority!: TaskPriorityEnum;
  @Field(() => TaskStatusEnum) status!: TaskStatusEnum;
  @Field() day!: Date;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateTaskInput {
  @Field() label!: string;
  @Field(() => TaskPriorityEnum) priority!: TaskPriorityEnum;
  @Field(() => TaskStatusEnum) status!: TaskStatusEnum;
  @Field() day!: Date;
}

@InputType()
export class UpdateTaskInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => TaskPriorityEnum, { nullable: true }) priority?: TaskPriorityEnum;
  @Field(() => TaskStatusEnum, { nullable: true }) status?: TaskStatusEnum;
  @Field({ nullable: true }) day?: Date;
}

@InputType()
export class ListTasksInput {
  @Field(() => TaskPriorityEnum, { nullable: true }) priority?: TaskPriorityEnum;
  @Field(() => TaskStatusEnum, { nullable: true }) status?: TaskStatusEnum;
  @Field({ nullable: true }) day?: Date;
  @Field({ nullable: true }) dayFrom?: Date;
  @Field({ nullable: true }) dayTo?: Date;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class TaskListGql {
  @Field(() => [TaskGql]) items!: TaskGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}
