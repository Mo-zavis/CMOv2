import { TwentyApiError } from '../client/twenty-client.js';

export function formatError(error: unknown): {
  content: Array<{ type: 'text'; text: string }>;
  isError: true;
} {
  if (error instanceof TwentyApiError) {
    const body = typeof error.responseBody === 'string'
      ? error.responseBody
      : JSON.stringify(error.responseBody, null, 2);
    return {
      content: [{
        type: 'text',
        text: `Twenty API Error (${error.statusCode}): ${error.message}\n${body}`,
      }],
      isError: true,
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: 'text', text: `Error: ${message}` }],
    isError: true,
  };
}
