#!/bin/sh
# docker-entrypoint.sh
#
# Generates /usr/share/nginx/html/env-config.js at container startup using
# real Kubernetes environment variables. This lets you change VITE_* values
# via a ConfigMap or Deployment env block WITHOUT rebuilding the Docker image.
#
# React reads window._env_.VITE_XYZ at runtime (see src/app/env.ts).
# Falls back to import.meta.env in dev (Vite handles that natively).

ENV_CONFIG_FILE="/usr/share/nginx/html/env-config.js"

echo "Generating runtime env-config.js..."

cat > "$ENV_CONFIG_FILE" <<EOF
// Auto-generated at container startup by docker-entrypoint.sh.
// DO NOT EDIT — changes will be overwritten on pod restart.
// To update values, change the Deployment/ConfigMap env vars instead.
window._env_ = {
  VITE_API_URL:                      "${VITE_API_URL:-/backend}",
  VITE_OAUTH_URL:                    "${VITE_OAUTH_URL:-}",
  VITE_CLIENT_ID:                    "${VITE_CLIENT_ID:-}",
  VITE_REDIRECT_URL:                 "${VITE_REDIRECT_URL:-}",
  VITE_X_CLIENT_ID:                  "${VITE_X_CLIENT_ID:-PRODUCTION}",
  VITE_IDENTITY_PROVIDER_API_URL:    "${VITE_IDENTITY_PROVIDER_API_URL:-}",
  VITE_UI_API_URL:                   "${VITE_UI_API_URL:-}",
  VITE_AI_API_URL:                   "${VITE_AI_API_URL:-}",
};
EOF

echo "env-config.js written:"
cat "$ENV_CONFIG_FILE"

# Hand off to nginx
exec nginx -g "daemon off;"
