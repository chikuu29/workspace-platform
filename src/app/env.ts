/**
 * Runtime environment configuration.
 *
 * WHY THIS EXISTS:
 * Vite bakes `import.meta.env.*` values at build time — you can't change them
 * without rebuilding the Docker image. For Kubernetes, we need to inject values
 * from ConfigMap/Deployment env vars at pod startup.
 *
 * HOW IT WORKS:
 *   - In production (K8s): docker-entrypoint.sh generates /env-config.js which
 *     sets `window._env_` from real pod env vars. This file is loaded in index.html
 *     before the React bundle, so window._env_ is available immediately.
 *   - In dev (Vite): window._env_ is undefined, so we fall back to import.meta.env
 *     which Vite populates from .env.development as usual.
 *
 * USAGE:
 *   import { env } from '@/app/env';
 *   const url = env('VITE_OAUTH_URL');   // works in both dev and prod
 */

// Type declaration for the runtime env object injected by docker-entrypoint.sh
declare global {
  interface Window {
    _env_?: Record<string, string>;
  }
}

type EnvKey =
  | 'VITE_API_URL'
  | 'VITE_OAUTH_URL'
  | 'VITE_CLIENT_ID'
  | 'VITE_REDIRECT_URL'
  | 'VITE_X_CLIENT_ID'
  | 'VITE_IDENTITY_PROVIDER_API_URL'
  | 'VITE_UI_API_URL'
  | 'VITE_AI_API_URL';

/**
 * Reads an env variable, preferring runtime (window._env_) over build-time (import.meta.env).
 * Returns empty string if not set in either source.
 */
export const env = (key: EnvKey): string => {
  // Runtime: populated by docker-entrypoint.sh from K8s env vars
  const runtimeValue = window._env_?.[key];
  if (runtimeValue !== undefined && runtimeValue !== '') return runtimeValue;

  // Build-time fallback: populated by Vite from .env / .env.development
  return (import.meta.env[key] as string) ?? '';
};
