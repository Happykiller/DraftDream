import 'reflect-metadata';

import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';
import { GraphQLObjectType } from 'graphql';
import { Test } from '@nestjs/testing';

import {
  ProspectConversionGql,
  ProspectGql,
  ProspectListGql,
} from '../prospect.gql.types';
import { ProspectResolver } from '../prospect.resolver';

jest.mock('@src/inversify/investify', () => ({
  __esModule: true,
  default: {
    getUserUsecase: { execute: jest.fn() },
    getClientLevelUsecase: { execute: jest.fn() },
    getClientSourceUsecase: { execute: jest.fn() },
    getClientObjectiveUsecase: { execute: jest.fn() },
    getClientActivityPreferenceUsecase: { execute: jest.fn() },
    createProspectUsecase: { execute: jest.fn() },
    getProspectUsecase: { execute: jest.fn() },
    listProspectsUsecase: { execute: jest.fn() },
    updateProspectUsecase: { execute: jest.fn() },
    deleteProspectUsecase: { execute: jest.fn() },
    convertProspectToAthleteUsecase: { execute: jest.fn() },
  },
}));

describe('ProspectResolver schema', () => {
  it('exposes the convert prospect mutation and input type', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
      providers: [ProspectResolver],
    }).compile();

    const gqlSchemaFactory = moduleRef.get(GraphQLSchemaFactory);
    const schema = await gqlSchemaFactory.create([ProspectResolver], {
      orphanedTypes: [ProspectGql, ProspectListGql, ProspectConversionGql],
    });

    const convertInput = schema.getType('ConvertProspectInput');
    const mutationFields = schema.getMutationType()?.getFields();

    expect(convertInput).toBeDefined();
    expect(mutationFields?.prospect_convert).toBeDefined();
    expect(mutationFields?.prospect_convert?.args[0]?.name).toBe('input');
  });

  it('exposes camelCase compatibility fields on converted entities', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
      providers: [ProspectResolver],
    }).compile();

    const gqlSchemaFactory = moduleRef.get(GraphQLSchemaFactory);
    const schema = await gqlSchemaFactory.create([ProspectResolver], {
      orphanedTypes: [ProspectGql, ProspectListGql, ProspectConversionGql],
    });

    const userType = schema.getType('UserGql') as GraphQLObjectType;
    const coachAthleteType = schema.getType('CoachAthleteGql') as GraphQLObjectType;

    expect(userType.getFields().firstName).toBeDefined();
    expect(userType.getFields().lastName).toBeDefined();
    expect(coachAthleteType.getFields().active).toBeDefined();
  });
});
