# Lists Sharpy's tools, for directories that check a server in a container.
# The tools themselves need Sharpy running on a Mac: see README.md.
FROM node:22-alpine
WORKDIR /app
COPY package.json tools.json server.mjs start.sh ./
USER node
ENTRYPOINT ["sh", "start.sh"]
