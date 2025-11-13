// src\graphql\common\nestFormatterError.ts
import { GraphQLFormattedError } from 'graphql';

import { logger } from '@src/common/logger';

const nestFormatterError = (error: any) => {
   
  const errorMessage = error.message;

  // Log
  const driverError = error.extensions?.exception?.driverError;

  logger.error(errorMessage, {
    module: 'nestjs',
    error: driverError?.stderr ?? driverError?.error?.stderr,
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
