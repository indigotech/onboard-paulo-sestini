import { GraphQLError } from 'graphql';

export class CustomError extends Error {
  code: number;
  additionalInfo?: string;
  isActualCustomError = false;

  constructor(message: string, code: number, additionalInfo?: string) {
    super(message);
    this.code = code;
    this.additionalInfo = additionalInfo;
    this.isActualCustomError = true;
  }
}

export function formatError(error: GraphQLError) {
  if (isCustomError(error.originalError)) {
    return {
      message: error.message,
      code: error.originalError.code,
      additionalInfo: error.originalError.additionalInfo,
    };
  } else {
    return {
      message: 'Internal Error. Please, try again.',
      code: 500,
      additionalInfo: error.message,
    };
  }
}

function isCustomError(error: Error): error is CustomError {
  const castedError = error as CustomError;
  return castedError.isActualCustomError;
}
