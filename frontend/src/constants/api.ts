// api.ts — API configuration

export const API_BASE_URL: string =
  process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');
