npx concurrently \
"uv run python -m uvicorn app.main:app --reload" \
"npm run dev --prefix OAUTH/frontend" \
"npm run dev --prefix workspace/workspace-platform-backend" \
"npm run dev --prefix workspace/workspace-platform"