# The development container image of lernapps apps (GitHub Codespaces and any other dev container host): Node, the
# agents (Claude Code, Codex), the browser the checks need and playwright-cli with its skills, installed once here
# so that nothing has to be downloaded when a creator opens a codespace. Built and published by
# .github/workflows/devcontainer-image.yml to ghcr.io/lernapps/devcontainer.
ARG BASE=mcr.microsoft.com/devcontainers/javascript-node:22-bookworm
FROM ${BASE}

# The Playwright version of @lernapps/tooling (package.json), so that `lernapps check` finds the browser it expects.
ARG PLAYWRIGHT_VERSION=1.65.0
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
# playwright-cli opens the Chrome channel by default; this image has Playwright's Chromium, which it must use instead.
ENV PLAYWRIGHT_MCP_BROWSER=chromium
RUN npx --yes playwright@${PLAYWRIGHT_VERSION} install --with-deps chromium \
    && chmod -R a+rX /ms-playwright \
    && rm -rf /var/lib/apt/lists/*

USER node
# The agents and playwright-cli, in the user's global npm folder (the node image makes it writable for node).
RUN npm install --global @anthropic-ai/claude-code @openai/codex @playwright/cli@latest \
    # the playwright-cli skill for Claude Code (~/.claude/skills) and for the .agents layout (~/.agents/skills)
    && playwright-cli install --skills -g \
    && playwright-cli install --skills=agents -g
