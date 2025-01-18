export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) { // Too Many Requests
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
        console.log(`Rate limited. Retrying after ${Math.min(retryAfter, 60)} seconds.`);
        await new Promise(resolve => setTimeout(resolve, Math.min(retryAfter, 60) * 1000));
        retries++;
      } else {
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      retries++;
      if (retries === maxRetries) throw error;
      // Exponential backoff with a maximum of 1 minute
      const backoffTime = Math.min(Math.pow(2, retries) * 1000, 60000);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  throw new Error('Max retries reached');
}

