#!/bin/bash

# Check if a message was provided
if [ -z "$1" ]; then
    echo "Usage: $0 <commit_message>"
    exit 1
fi

COMMIT_MSG="$1"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

echo "Saving checkpoint..."
git add .
git commit -m "$COMMIT_MSG [$TIMESTAMP]"

# Check if remote exists before pushing
if git remote get-url origin > /dev/null 2>&1; then
    echo "Pushing to remote..."
    git push
else
    echo "No remote 'origin' found. Skipping push."
    echo "Please set up your remote using the instructions in walkthrough.md"
fi

echo "Done!"
