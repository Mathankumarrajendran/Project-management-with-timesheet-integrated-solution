# Versioning Strategy

## PM System — Version Control & Release Management

---

## Versioning Scheme

This project follows **Semantic Versioning** ([semver.org](https://semver.org/)):

```
MAJOR.MINOR.PATCH
```

| Segment | When to Bump | Example |
|---|---|---|
| **MAJOR** | Breaking changes, architectural overhaul, incompatible API changes | `1.0.0 → 2.0.0` |
| **MINOR** | New backward-compatible features, new modules, non-breaking additions | `1.0.0 → 1.1.0` |
| **PATCH** | Backward-compatible bug fixes, UI improvements, minor refactors | `1.0.0 → 1.0.1` |

---

## Release Types

| Type | Branch | Description |
|---|---|---|
| **Stable Release** | `main` | Fully tested, production-ready builds |
| **Pre-release (Beta)** | `develop` | Feature-complete but undergoing QA |
| **Hotfix** | `hotfix/description` | Critical production bug fixes |
| **Feature Branch** | `feature/feature-name` | Individual feature development |

---

## Git Tagging Convention

Every release **must** be tagged in Git using annotated tags:

```bash
# Create an annotated tag for a release
git tag -a v1.0.0 -m "Release v1.0.0 - Initial stable release"

# Push the tag to remote
git push origin v1.0.0

# Push all tags at once
git push origin --tags
```

### Tag Naming
- Stable releases: `v1.0.0`, `v1.1.0`, `v2.0.0`
- Pre-releases / betas: `v1.1.0-beta.1`, `v1.1.0-rc.1`
- Hotfixes: `v1.0.1`, `v1.0.2`

---

## Release Checklist

Before tagging any new release, complete this checklist:

- [ ] All planned features for the version are merged to `main`
- [ ] All known critical bugs are resolved
- [ ] `CHANGELOG.md` is updated with:
  - New features list
  - Bug fixes list
  - Technical improvements
  - Known limitations
  - Commit references
- [ ] `VERSION` file is updated to the new version number
- [ ] `RELEASE_NOTES/vX.Y.Z.md` is created with detailed notes
- [ ] Git tag is created and pushed
- [ ] Production deployment is verified

---

## Commit Message Convention

All commits should follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes only |
| `style` | Code formatting, no logic change |
| `refactor` | Code restructure without feature/fix |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build tooling, dependencies, CI |

### Examples
```
feat(invoices): add approved-hours-only billing validation
fix(invoices): prevent duplicate records on status PATCH
docs(changelog): add v1.0.0 release notes
refactor(dashboard): extract stat cards into shared component
chore(deps): upgrade Next.js to 14.2.0
```

---

## Directory Structure for Version Documentation

```
pm-system/
├── VERSION                  # Current version number (plain text)
├── CHANGELOG.md             # Full history of all changes across all versions
├── VERSIONING.md            # This file — versioning strategy and guidelines
└── RELEASE_NOTES/
    ├── v1.0.0.md            # Detailed release notes for v1.0.0
    ├── v1.1.0.md            # (future)
    └── v2.0.0.md            # (future)
```

---

## How to Create a New Release

### Step 1 — Finish development on `main`
```bash
git checkout main
git pull origin main
```

### Step 2 — Update version files
```bash
# Update VERSION file
echo "1.1.0" > VERSION

# Update CHANGELOG.md (add new version section at top)
# Create RELEASE_NOTES/v1.1.0.md
```

### Step 3 — Commit the version bump
```bash
git add VERSION CHANGELOG.md RELEASE_NOTES/v1.1.0.md
git commit -m "chore(release): bump version to v1.1.0"
```

### Step 4 — Tag the release
```bash
git tag -a v1.1.0 -m "Release v1.1.0 - [brief description of key change]"
git push origin main
git push origin v1.1.0
```

---

## Bug Tracking Convention

Bugs referenced in the CHANGELOG and release notes use the format:

```
BUG-XXX  Short description    Affected Module
```

Bug IDs are sequential across the entire project lifetime. Bugs are documented in:
1. `CHANGELOG.md` under the version that fixed them
2. The relevant `RELEASE_NOTES/vX.Y.Z.md`

---

*For the complete list of changes, see [CHANGELOG.md](./CHANGELOG.md).*
*For per-version release notes, see [RELEASE_NOTES/](./RELEASE_NOTES/).*
