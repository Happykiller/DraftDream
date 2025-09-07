// src\graphql\common\nestFormatterError.ts
import { GraphQLFormattedError } from 'graphql';

import { logger } from '@src/common/logger';

const nestFormatterError = (error: any) => {
  // eslint-disable-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  const errorMessage = error.message;

  // Log
  logger.error(errorMessage, {
    module: 'nestjs',
    error:
      error.extensions?.exception?.driverError?.stderr ||
      error.extensions?.exception?.driverError?.error?.stderr,
    exception: error.extensions?.exception,
  });

  // Format output
  if (process.env.NODE_ENV === 'prod') {
    const graphQLFormattedError: GraphQLFormattedError = {
      message: errorMessage,
    };
    return graphQLFormattedError;
  } else {
    const genericError = {
      message: errorMessage,
      path: error.path,
      exception: error.extensions?.exception,
    };
    return genericError;
  }
};

export { nestFormatterError };
