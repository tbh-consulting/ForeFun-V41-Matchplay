export class ScorecardError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'ScorecardError';
  }
}

export function handleError(error: unknown, fallbackMessage: string): ScorecardError {
  if (error instanceof ScorecardError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new ScorecardError(error.message, error);
  }
  
  return new ScorecardError(fallbackMessage, error);
}