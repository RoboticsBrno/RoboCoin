#!/bin/bash

# --- Project Formatting Script ---
#
# This script uses Prettier to format all relevant files in the project
# according to the rules defined in .prettierrc.
#
# It will format TypeScript, TSX, JavaScript, JSON, and Markdown files.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Formatting project files with Prettier..."

# Run Prettier on the entire project.
# The `.` tells Prettier to run from the current directory.
# The `--write` flag tells Prettier to modify the files in place.
# The glob pattern finds all relevant files in any subdirectory.
npx prettier --write "**/*.{ts,tsx,js,json,md}"

echo "Formatting complete!"
