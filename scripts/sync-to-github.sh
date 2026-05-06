#!/usr/bin/env bash
set -euo pipefail

# Sync the current project to GitHub: github.com/chichiboo123/passport
# Requires: GITHUB_PERSONAL_ACCESS_TOKEN environment variable

GITHUB_REPO="https://github.com/chichiboo123/passport.git"
GITHUB_USER="chichiboo123"
GITHUB_EMAIL="chichiboo123@github.com"
BRANCH="main"

if [ -z "${GITHUB_PERSONAL_ACCESS_TOKEN:-}" ]; then
  echo "ERROR: GITHUB_PERSONAL_ACCESS_TOKEN is not set." >&2
  echo "Set it as a secret in the Replit environment and try again." >&2
  exit 1
fi

echo "==> Configuring git identity..."
git config user.name  "$GITHUB_USER"
git config user.email "$GITHUB_EMAIL"

REMOTE_URL="https://x-access-token:${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/chichiboo123/passport.git"

echo "==> Setting up GitHub remote..."
if git remote get-url github &>/dev/null; then
  git remote set-url github "$REMOTE_URL"
else
  git remote add github "$REMOTE_URL"
fi

echo "==> Pushing to $GITHUB_REPO ($BRANCH)..."
git push github "$BRANCH" --force

echo ""
echo "Done! Code is now live at: https://github.com/chichiboo123/passport"
