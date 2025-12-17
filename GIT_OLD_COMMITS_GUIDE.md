# How to Get Old Commits from GitHub

## Method 1: View Commit History
```bash
# See commit history with details
git log --oneline -20

# See commits with full details
git log --stat

# See commits with changes
git log -p

# See commits from specific author
git log --author="YourName"

# See commits in date range
git log --since="2025-11-01" --until="2025-11-21"
```

## Method 2: View Specific Old Commit
```bash
# View files at a specific commit
git show COMMIT_HASH

# View specific file at old commit
git show COMMIT_HASH:path/to/file

# Example with your commits:
git show c038cda2
git show 7db190b0:backend/server.js
```

## Method 3: Checkout Old Commit (Browse Files)
```bash
# Create new branch from old commit
git checkout -b old-version c038cda2

# Or temporarily checkout (detached HEAD)
git checkout c038cda2

# Return to current branch
git checkout host
```

## Method 4: Compare Commits
```bash
# Compare two commits
git diff c038cda2 7db190b0

# Compare current with old commit
git diff HEAD c038cda2

# Compare specific file across commits
git diff c038cda2 7db190b0 -- backend/server.js
```

## Method 5: Restore File from Old Commit
```bash
# Restore specific file from old commit
git checkout c038cda2 -- path/to/file

# Restore entire directory from old commit
git checkout c038cda2 -- src/

# Example: Restore server.js from old commit
git checkout c038cda2 -- backend/server.js
```

## Method 6: Reset to Old Commit
⚠️ **DANGEROUS - Use with caution!**

```bash
# Soft reset (keeps changes staged)
git reset --soft c038cda2

# Mixed reset (keeps changes unstaged)
git reset --mixed c038cda2

# Hard reset (DELETES all changes)
git reset --hard c038cda2
```

## Method 7: Revert Commits (Safe way)
```bash
# Revert a specific commit (creates new commit)
git revert c038cda2

# Revert multiple commits
git revert c038cda2..HEAD

# Revert without auto-commit
git revert --no-commit c038cda2
```

## Method 8: Using GitHub Web Interface

### On GitHub.com:
1. Go to your repository: `https://github.com/SudeepKamaraj/arivom`
2. Click on "commits" or the commit count
3. Find the commit you want
4. Click on the commit hash
5. Browse files at that point in time
6. Download ZIP of that version using "Code" → "Download ZIP"

### Direct commit URLs:
- `https://github.com/SudeepKamaraj/arivom/commit/c038cda2`
- `https://github.com/SudeepKamaraj/arivom/commit/7db190b0`

## Method 9: Create Patch Files
```bash
# Create patch from specific commit
git format-patch -1 c038cda2

# Create patch between commits
git format-patch c038cda2..7db190b0

# Apply patch
git apply 0001-commit-name.patch
```

## Method 10: Using Git Stash with Old Commits
```bash
# Save current work
git stash

# Checkout old commit
git checkout c038cda2

# Make changes or copy files
# Then return and restore
git checkout host
git stash pop
```

## Your Available Commits:
- `c038cda2` - "commit" (latest on padipu)
- `7db190b0` - "chinna akka vandhutenda"
- `4dc209d1` - "all okk"
- `ab047b2b` - "revieww super"
- `2d408e1d` - "jolly"
- `22d42113` - "unique features"
- `03e1ab74` - "Okok"
- `016771ce` - "all working"
- `5420edc1` - "Razorpy added"
- `790e2f68` - "okok" (main branch)

## Quick Examples for Your Project:

### View what changed in a specific commit:
```bash
git show c038cda2
```

### Get a file from old commit:
```bash
git show 7db190b0:backend/server.js > old_server.js
```

### Compare your current code with old version:
```bash
git diff HEAD 7db190b0
```

### Safely try old version in new branch:
```bash
git checkout -b test-old-version 7db190b0
# Test the old version
git checkout host  # Return to current work
```