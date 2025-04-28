#!/usr/bin/env bash
# retro-commit.sh
#
# Splits all current changes into per-file commits
# dated over the past week to fill out your GitHub graph.

# Number of days to spread commits over
SPAN_DAYS=10

# Calculate start date (7 days ago)
START_DATE=$(date -d "now - ${SPAN_DAYS} days" +%Y-%m-%d)

# Ensure there are changes
if git diff --quiet && git diff --cached --quiet; then
  echo "No changes to commit."
  exit 1
fi

# Get list of modified (or added) files
FILES=($(git diff --name-only))

if [ ${#FILES[@]} -eq 0 ]; then
  echo "No modified files detected."
  exit 1
fi

# Iterate through files and commit one per day
for idx in "${!FILES[@]}"; do
  FILE="${FILES[$idx]}"
  
  # Compute commit date: START_DATE + idx days
  COMMIT_DATE=$(date -d "${START_DATE} + ${idx} days" +"%Y-%m-%dT12:00:00")
  
  # Stage only this file
  git add -- "${FILE}"
  
  # Commit with back-dated timestamp
  GIT_AUTHOR_DATE="${COMMIT_DATE}" \
    GIT_COMMITTER_DATE="${COMMIT_DATE}" \
    git commit -m "Update ${FILE}"

  echo "Committed ${FILE} on ${COMMIT_DATE}"
done

echo "All files committed across the last $SPAN_DAYS days."
