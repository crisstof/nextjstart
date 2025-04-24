# Étape de build
FROM node:20-bookworm AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape de runtime
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN groupadd -r nextjs && useradd --no-log-init -r -g nextjs nextjs

COPY package*.json ./
RUN npm ci --only=production

# Copier uniquement les fichiers nécessaires du build
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

# Donner les droits à l'utilisateur non-root
RUN chown -R nextjs:nextjs /app

EXPOSE 3000

USER nextjs

CMD ["npm", "start"]
