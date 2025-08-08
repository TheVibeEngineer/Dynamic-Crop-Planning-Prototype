# 🌟 Advanced Git Workflow - Dev/Main Branch Strategy

## 📋 Branch Strategy Overview

### Branch Purposes
- **`main`** - Production-ready code (always stable, deployable)
- **`dev`** - Development code (active development, testing)
- **`feature/*`** - Individual feature branches (optional advanced)

### Workflow Flow
```
feature → dev → main
   ↓       ↓      ↓
  work   test   deploy
```

---

## 🚀 One-Time Setup

### Create Dev Branch (First Time Only)
```bash
# Make sure you're on main and up to date
git checkout main
git pull

# Create development branch
git checkout -b dev

# Push dev branch to GitHub
git push -u origin dev
```

---

## 🌅 Daily Development Workflow

### Step 1: Start Your Day on Dev Branch
```bash
# Switch to dev branch
git checkout dev

# Get latest changes
git pull origin dev
```

### Step 2: Set Up Your Development Environment
```bash
# Start your development servers
npm run dev                    # Start dev server
npm test -- --watch          # Start tests in watch mode (separate terminal)

# Now both run automatically:
# - Code changes trigger hot reload in browser
# - Test changes trigger test re-runs in terminal
```

### Step 3: Do Your Development Work
```bash
# Check what you're working on
git status

# Make your changes in Cursor...
# Edit components/CropPlanningApp.tsx, etc.
# Watch tests update automatically as you code!
```

### Step 4: Save Your Work to Dev Branch
```bash
# Stage your changes
git add .

# 🧪 RUN TESTS BEFORE COMMITTING
npm test                      # Make sure all tests pass!

# Commit with descriptive message (only if tests pass)
git commit -m "Add data persistence feature"

# Push to dev branch
git push origin dev
```

---

## 🎯 Weekly: Promote Stable Code to Main

### When Your Dev Code is Ready for Production
```bash
# 🧪 FIRST: Run full test suite with coverage on dev
git checkout dev
npm test -- --coverage       # Run full test suite with coverage
# Only proceed if ALL tests pass!

# Switch to main branch
git checkout main

# Get latest main code
git pull origin main

# Merge dev into main
git merge dev

# Push updated main to GitHub
git push origin main

# Switch back to dev for continued development
git checkout dev
```

### Alternative: Create Pull Request (Recommended)
Instead of direct merge, create a Pull Request on GitHub:
1. Go to your GitHub repository
2. Click "New Pull Request"
3. Set: `dev` → `main`
4. Add description of changes
5. Review and merge via GitHub interface

---

## 🧪 Testing Strategy for Your Dev Workflow

### Daily Development Testing
```bash
# Start your day
npm run dev                    # Start dev server
npm test -- --watch          # Start tests in watch mode (separate terminal)

# Now both run automatically:
# - Code changes trigger hot reload in browser
# - Test changes trigger test re-runs in terminal
```

### Before Committing (Your Git Workflow)
```bash
# Current workflow:
git checkout dev
git add .
npm test                      # ADD THIS: Run tests before commit
git commit -m "Add new feature"
git push origin dev
```

### Before Merging to Main
```bash
# Before promoting dev → main:
git checkout dev
npm test -- --coverage       # Run full test suite with coverage
# Only merge if tests pass!
git checkout main
git merge dev
```

### Testing Best Practices
- 🔄 **Watch mode during development** - Instant feedback on code changes
- ✅ **Test before every commit** - Never commit broken code to dev
- 📊 **Coverage before main** - Ensure comprehensive testing before production
- 🚨 **Never skip tests** - A few seconds of testing saves hours of debugging

---

## 🛠️ Advanced Commands

### Check Which Branch You're On
```bash
git branch
# * shows current branch
```

### See All Branches (Local and Remote)
```bash
git branch -a
```

### Switch Between Branches
```bash
git checkout main    # Switch to main
git checkout dev     # Switch to dev
```

### Create Feature Branch (Optional Advanced)
```bash
# Create feature branch from dev
git checkout dev
git checkout -b feature/new-gantt-improvements

# Work on feature...
# When done, merge back to dev:
git checkout dev
git merge feature/new-gantt-improvements
git branch -d feature/new-gantt-improvements  # Delete feature branch
```

---

## 🎯 Best Practices

### Daily Development
- **Always work on `dev` branch** for new features
- **Run tests in watch mode** during development
- **Test before every commit** to dev
- **Commit frequently** to dev (multiple times per day)
- **Keep main stable** (only merge tested code)

### Testing Integration
- **🧪 Start with tests running** - `npm test -- --watch` at the beginning of each day
- **🔍 Test before commit** - `npm test` must pass before `git commit`
- **📊 Coverage before main** - `npm test -- --coverage` before merging to main
- **⚡ Instant feedback** - Watch mode gives immediate test results

### Branch Hygiene
- **`main` = always deployable** (never commit directly, always tested)
- **`dev` = active development** (can be unstable, but always tested before commit)
- **Test thoroughly** before merging dev → main

### Commit Messages by Branch
```bash
# Dev branch - be descriptive
git commit -m "WIP: Adding localStorage persistence"
git commit -m "Fix drag and drop bug in lot assignment"

# Main branch - be formal
git commit -m "Release v1.2: Add data persistence and bug fixes"
```

---

## 🆘 Common Scenarios

### If You Accidentally Work on Main
```bash
# If you made changes on main but haven't committed:
git stash              # Save changes temporarily
git checkout dev       # Switch to dev
git stash pop         # Apply changes to dev

# Then commit normally on dev
```

### If Dev Gets Ahead of Main
```bash
# This is normal! Dev should be ahead
# When ready, merge dev → main as described above
```

### If You Need to Hotfix Main
```bash
# For emergency fixes to production:
git checkout main
git pull origin main
# Make minimal fix...
git add .
git commit -m "Hotfix: Fix critical CSV export bug"
git push origin main

# Then update dev with the fix:
git checkout dev
git merge main
```

---

## 🚀 Deployment Strategy

### Development Testing
```bash
# Test on dev branch
git checkout dev
npm test            # Run all tests first
npm run build       # Make sure it builds
npm run dev         # Test locally

# When satisfied, promote to main
```

### Production Deployment
```bash
# Deploy from main branch only
git checkout main
git pull origin main
npm run build
# Deploy to production (Vercel, etc.)
```

---

## 📈 Advanced: Release Workflow

### Creating Releases
```bash
# When main has enough new features:
git checkout main
git tag -a v1.0.0 -m "Release v1.0.0 - Initial production release"
git push origin v1.0.0

# Deploy this specific version
```

### Semantic Versioning
- **v1.0.0** - Major release (breaking changes)
- **v1.1.0** - Minor release (new features)  
- **v1.1.1** - Patch release (bug fixes)

---

## 🎉 Benefits of This Workflow

✅ **Professional Development** - Industry standard practice  
✅ **Safe Experimentation** - Break things on dev, keep main stable  
✅ **Easy Rollbacks** - Always have a working main branch  
✅ **Clear History** - See exactly when features went to production  
✅ **Team Ready** - Easy to collaborate when you add team members  
✅ **Deployment Confidence** - Main branch is always deployable  

---

## 🏁 Quick Reference

### Daily Commands
```bash
git checkout dev          # Start on dev
git pull origin dev       # Get updates
npm test -- --watch      # Start tests in watch mode
# ... do work ...
git add .                 # Stage changes
npm test                  # Test before commit
git commit -m "..."       # Commit to dev
git push origin dev       # Push to dev
```

### Weekly Commands
```bash
git checkout dev          # Make sure on dev
npm test -- --coverage   # Full test suite with coverage
git checkout main         # Switch to main
git pull origin main      # Get latest main
git merge dev            # Merge dev → main
git push origin main     # Push updated main
git checkout dev         # Back to dev
```

---

**This workflow will make you look like a seasoned professional developer!** 🌟

*Last updated: [Current Date]*