FROM node

WORKDIR /app

# COPY package-lock.json package-lock.json
# COPY package.json package.json
# package se start hone wali sbhi files
COPY package*.json .  
RUN npm install

# Folder k sare files ko current directory mei same name se copy kr do
COPY . .
# COPY index.js index.js

CMD ["npm","run","dev"]


