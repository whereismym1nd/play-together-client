const APP_HOST =
  typeof window !== "undefined" ? window.location.hostname : "localhost"

export const CONFIG = {
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || `http://${APP_HOST}:3001`,
  LOCALHOST_URL: import.meta.env.VITE_LOCALHOST_URL || `http://${APP_HOST}:5173`,
}
