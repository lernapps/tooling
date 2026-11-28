# The development container image of lernapps apps (GitHub Codespaces and any other dev container host): Node, the
# browser the checks need and playwright-cli with its skills, installed once here so that nothing has to be downloaded
# when a creator opens a codespace. The agents are the editor extensions of Claude Code and Codex, which bring their own
# command line; anyone who wants `claude` or `codex` in the terminal installs it with npm. Built and published by
# .github/workflows/devcontainer-image.yml to ghcr.io/lernapps/devcontainer. Every version is pinned here and moved by
# Renovate (the comments "renovate:" tell it where each comes from, renovate.json), so that the image changes when a
# version changes and the apps, which pin the image by digest, follow in a pull request.
ARG BASE=mcr.microsoft.com/devcontainers/javascript-node:22-bookworm
FROM ${BASE}

# The Playwright version of @lernapps/tooling (package.json), so that `lernapps check` finds the browser it expects.
# renovate: datasource=npm depName=playwright
ARG PLAYWRIGHT_VERSION=1.65.1
# renovate: datasource=npm depName=@playwright/cli
ARG PLAYWRIGHT_CLI_VERSION=0.1.25

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
# playwright-cli opens the Chrome channel by default; this image has Playwright's Chromium, which it must use instead.
ENV PLAYWRIGHT_MCP_BROWSER=chromium
RUN npx --yes playwright@${PLAYWRIGHT_VERSION} install --with-deps chromium \
    && chmod -R a+rX /ms-playwright \
    && rm -rf /var/lib/apt/lists/*

USER node
# playwright-cli, in the user's global npm folder (the node image makes it writable for node).
RUN npm install --global @playwright/cli@${PLAYWRIGHT_CLI_VERSION} \
    # the playwright-cli skill for Claude Code (~/.claude/skills) and for the .agents layout (~/.agents/skills)
    && playwright-cli install --skills -g \
    && playwright-cli install --skills=agents -g
