# The creator's machine at the start of a fresh run: an empty folder, Node 22, git, and a browser for the checks.
# Generated folders are not part of the task: evals/harbor/setup.sh writes ccr-ca.crt (the CA of an intercepting
# egress proxy, or an empty file where there is none) and creator-say.ts (the simulated creator's way to talk to the
# agent, evals/harbor/creator-say.ts) next to this file.
FROM mirror.gcr.io/library/node:22-bookworm-slim
COPY ccr-ca.crt /usr/local/share/ca-certificates/ccr-ca.crt
COPY creator-say.ts /opt/creator/say.ts
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates curl jq \
 && update-ca-certificates \
 && rm -rf /var/lib/apt/lists/*
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
# Chromium and its system libraries for `lernapps check` and the git hooks, at the Playwright version of the tooling
# (package.json of lernapps/tooling); another version downloads its own browser into the same folder.
RUN npx --yes playwright@1.63.0 install --with-deps chromium \
 && chmod -R a+rwX /ms-playwright \
 && rm -rf /var/lib/apt/lists/* /root/.npm
RUN git config --system user.name "Eval Creator" \
 && git config --system user.email eval@lernapps.invalid \
 && git config --system init.defaultBranch main
WORKDIR /app
