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
  const castedError = error.originalError as CustomError;
  if (castedError.isActualCustomError) {
    return {
      message: error.message,
      code: castedError.code,
      additionalInfo: castedError.additionalInfo,
    };
  } else {
    return {
      message: 'Internal Error. Please, try again.',
      code: 500,
      additionalInfo: error.message,
    };
  }
}
