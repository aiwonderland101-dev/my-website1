FROM node:18-bullseye AS build

WORKDIR /build/theia-app

RUN npm install -g pnpm

COPY theia-app/package.json ./package.json
RUN pnpm install --no-frozen-lockfile

COPY theia-app ./
RUN pnpm build

FROM eclipse-theia/theia:1.68.2

USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /build/theia-app /home/theia/theia-app
COPY scripts/supabase_mount.mjs /home/theia/bin/supabase_mount.mjs

RUN mkdir -p /home/theia/plugins /home/theia/workspace /home/theia/tools /home/theia/bin \
    && find /home/theia/theia-app/plugins -maxdepth 1 -type f -name '*.vsix' -exec unzip -o {} -d /home/theia/plugins \; \
    && printf '{\n  "name": "wonderspace-tools",\n  "private": true,\n  "type": "module",\n  "dependencies": {\n    "@supabase/supabase-js": "^2.90.1",\n    "colyseus.js": "^0.16.22"\n  }\n}\n' > /home/theia/tools/package.json \
    && cd /home/theia/tools && npm install --omit=dev \
    && chmod +x /home/theia/bin/supabase_mount.mjs \
    && chown -R theia:theia /home/theia

ENV NODE_PATH=/home/theia/tools/node_modules

USER theia

EXPOSE 3000

CMD ["theia", "start", "/home/theia/workspace", "--hostname=0.0.0.0", "--port=3000"]
