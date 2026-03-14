COMPOSE_FILE := docker/docker-compose.yml
COMPOSE_DEV  := docker/docker-compose.dev.yml
COMPOSE      := docker compose -f $(COMPOSE_FILE)
COMPOSE_D    := docker compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV)

.PHONY: up down logs fresh dev dev-down dev-logs build status ps

# ─── Production ─────────────────────────────────────────────────

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f $(SVC)

build:
	$(COMPOSE) build $(SVC)

status:
	$(COMPOSE) ps

ps: status

# Full reset: stop, remove volumes, rebuild, start
fresh:
	$(COMPOSE) down -v
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d

# Start with n8n included
up-full:
	$(COMPOSE) --profile full up -d

# ─── Development ────────────────────────────────────────────────

dev:
	$(COMPOSE_D) up -d

dev-down:
	$(COMPOSE_D) down

dev-logs:
	$(COMPOSE_D) logs -f $(SVC)

dev-build:
	$(COMPOSE_D) build $(SVC)

dev-fresh:
	$(COMPOSE_D) down -v
	$(COMPOSE_D) build --no-cache
	$(COMPOSE_D) up -d

# ─── Utilities ──────────────────────────────────────────────────

# Tail logs for a single service: make logs SVC=nexus-api
# Enter a container shell:       make shell SVC=nexus-api
shell:
	docker exec -it $(SVC) sh

# Pull latest AI model into Ollama
pull-model:
	docker exec nexus-ollama ollama pull tinyllama

# Database shell
db:
	docker exec -it nexus-postgres psql -U nexus

# Redis CLI
redis-cli:
	docker exec -it nexus-redis redis-cli
