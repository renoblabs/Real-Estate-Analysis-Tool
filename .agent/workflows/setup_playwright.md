---
description: Set up Playwright for E2E testing
---

1. Install Playwright and its dependencies
// turbo
2. Initialize Playwright configuration
3. Create a sample test file for the Portfolio page
4. Add a test script to package.json

To run this workflow, I will execute the following commands:

```bash
npm init playwright@latest
```
(I'll need to handle the interactive prompts or use flags to automate this)

Better yet, I'll install it manually to avoid interactive prompts:
```bash
npm install -D @playwright/test
npx playwright install
```

Then I'll create the config and test files manually.
