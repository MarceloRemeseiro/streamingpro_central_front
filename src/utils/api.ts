export const getRestreamerApiUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL || 'lvp.streamingpro.es';
  const port = process.env.NEXT_PUBLIC_RESTREAMER_API_PORT || '8080';
  return `https://${baseUrl}:${port}/api`;
}; 