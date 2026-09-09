const rawApiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const config = {
  apiUrl: rawApiUrl.replace(/\/$/, ''),
}
