# Linting Configuration Guide

This document describes the linting and code formatting setup for the Open in Tab Group Chrome extension.

## Overview

The project uses:
- **ESLint** - JavaScript linter for code quality and consistency
- **Prettier** - Opinionated code formatter for consistent style

## Quick Start

```bash
# Install dependencies
npm install

# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check code formatting
npm run format:check

# Auto-format code
npm run format
```

## ESLint Configuration

### File: `.eslintrc.json`

**Environment:**
- `browser: true` - Browser global variables
- `es2021: true` - ES2021 syntax support
- `webextensions: true` - Chrome Extension APIs

**Key Rules:**
- **Quotes:** Single quotes preferred (`'hello'` not `"hello"`)
- **Semicolons:** Required at end of statements
- **Indentation:** 2 spaces (no tabs)
- **Line Length:** Max 120 characters (warning)
- **Variables:** `prefer-const` for immutable, `no-var` enforced
- **Equality:** Always use `===` and `!==`
- **Braces:** Required for all control structures
- **Console:** Allowed (useful for extension debugging)
- **Trailing Spaces:** Not allowed
- **End of Line:** Required newline at end of files

**Chrome Extension Specific:**
- `chrome` global is recognized and allowed
- No warnings for Chrome Extension API usage

### Ignored Files: `.eslintignore`

- `node_modules/` - Dependencies
- `dist/`, `build/` - Build outputs
- `test/` - Test files
- IDE and temporary files

## Prettier Configuration

### File: `.prettierrc.json`

**Settings:**
- **Semi:** `true` - Semicolons required
- **Single Quote:** `true` - Use single quotes
- **Print Width:** `120` - Max line length
- **Tab Width:** `2` - 2 spaces per indentation
- **Trailing Comma:** `none` - No trailing commas
- **Arrow Parens:** `always` - Always wrap arrow function params
- **End of Line:** `lf` - Unix-style line endings

### Ignored Files: `.prettierignore`

- `node_modules/` - Dependencies
- `package-lock.json`, `yarn.lock` - Lock files
- `extension/icons/` - Binary image files

## Integration with Development Workflow

### Pre-commit Checks (Recommended)

Consider adding a pre-commit hook to automatically check code before commits:

```bash
# Install husky and lint-staged
npm install --save-dev husky lint-staged

# Add to package.json
{
  "lint-staged": {
    "extension/**/*.js": [
      "eslint --fix",
      "prettier --write"
    ],
    "extension/**/*.json": [
      "prettier --write"
    ]
  }
}
```

### VS Code Integration

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript"]
}
```

### CI/CD Integration

A GitHub Actions workflow is configured at [`.github/workflows/lint.yml`](.github/workflows/lint.yml:1) that automatically:
- Runs on pull requests to `main` branch
- Runs on pushes to `main` branch
- Checks ESLint rules
- Verifies Prettier formatting
- Uses Node.js 20 with npm caching for faster builds

The workflow will fail if any linting or formatting issues are found, preventing merges of non-compliant code.

## Common Issues and Solutions

### Issue: ESLint errors after editing

**Solution:** Run `npm run lint:fix` to auto-fix most issues

### Issue: Prettier formatting conflicts with ESLint

**Solution:** We use `eslint-config-prettier` which disables conflicting ESLint rules

### Issue: Line too long warnings

**Solution:**
- Break long lines into multiple lines
- Use template literals for long strings
- Comments and strings are ignored by the rule

### Issue: Unexpected console statement

**Solution:** Console statements are allowed in this project (useful for debugging extensions)

## Best Practices

1. **Run linter before committing:**
   ```bash
   npm run lint && npm run format:check
   ```

2. **Auto-fix when possible:**
   ```bash
   npm run lint:fix && npm run format
   ```

3. **Keep code under 120 characters per line**

4. **Use meaningful variable names** (ESLint will warn about unused variables)

5. **Always use `const` for variables that don't change**

6. **Use `===` instead of `==` for comparisons**

7. **Add JSDoc comments for functions** (not enforced but recommended)

## Customization

To modify linting rules:

1. Edit `.eslintrc.json` for ESLint rules
2. Edit `.prettierrc.json` for Prettier formatting
3. Run `npm run lint` to verify changes
4. Update this document if making significant changes

## Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/)
- [Chrome Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/devguide/)