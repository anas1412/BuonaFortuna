#!/bin/bash

VERSION_FILE="app.json"

if [ -z "$1" ]; then
  echo "Usage: npm run bump <patch|minor|major>"
  exit 1
fi

CURRENT=$(grep -o '"version": "[^"]*"' "$VERSION_FILE" | cut -d'"' -f4)
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

case "$1" in
  patch) PATCH=$((PATCH + 1)) ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  *) echo "Invalid bump type: $1 (use patch, minor, or major)"; exit 1 ;;
esac

NEW="$MAJOR.$MINOR.$PATCH"
sed -i "s/\"version\": \"$CURRENT\"/\"version\": \"$NEW\"/" "$VERSION_FILE"

echo "Bumped version: $CURRENT → $NEW"
