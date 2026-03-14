# Nexus — Project Context

> Place in `docs/PROJECT_CONTEXT.md`. Cursor references this for full project understanding.

---

## What is Nexus?

A self-hosted, AI-powered family operating system. 11 sub-projects, 3 backend stacks (Java + Python + Node.js), one platform. Runs entirely on a home Windows laptop (i5-6200U, 8GB RAM, SSD) via Docker. No cloud servers.

---

## Polyglot Architecture

| Stack | Service | Why | RAM |
|-------|---------|-----|-----|
| Java Spring Boot | 7 modules (Core, DocSense, MedPulse, Ledger, Timeline, Vault, Gallery, Atlas) | Enterprise framework. Shared auth, events, database. | 512MB |
| Python FastAPI | Cortex (AI Engine) | AI/ML tooling is Python-native. Ollama Python client is better. | 180MB |
| Node.js Express + Socket.io | Thread (Chat) | Socket.io is the industry standard for real-time messaging. | 150MB |
| Grafana | Console (monitoring) | Production-grade observability dashboards. | 200MB |

**Communication:** Spring Boot calls Cortex via REST. Thread and Spring Boot communicate via Redis pub/sub. All three verify the same JWT tokens. All connect to the same PostgreSQL (different schemas).

---

## Hardware & Hosting

**Machine**: i5-6200U, 8GB RAM (3.9GB available for Docker), SSD.
**Hosting**: EVERYTHING on home machine. Nginx serves React + proxies 3 backends.
**Cloud (free)**: Cloudflare Tunnel, GitHub, SendGrid. No Vercel.

### RAM Budget
| Service | Limit |
|---------|-------|
| PostgreSQL | 300MB |
| Redis | 80MB |
| Spring Boot (7 modules) | 600MB |
| Cortex (FastAPI) | 200MB |
| Thread (Node.js) | 180MB |
| MinIO | 200MB |
| Grafana | 250MB |
| Nginx + Cloudflared + WireGuard | 80MB |
| **Always-on total** | **~1,890MB** |
| Ollama (on-demand) | +700MB when active |
| n8n (optional) | +300MB if enabled |

---

## The 11 Sub-Projects

### Nexus Core (Java) — Stage 1-2
Auth, JWT, roles, spaces, WiFi-gated security, user invites, guest access.

### Cortex (Python FastAPI) — Stage 3
AI engine. Separate Docker container. Endpoints: embed, generate (SSE), classify, extract-entities, ocr, status. On-demand Ollama model loading (tinyllama, 2min idle unload). Redis request queue.

### DocSense (Java) — Stage 3
Document pipeline. Upload → MinIO → Cortex OCR → classify → extract → Spring Events → embed. Triggers MedPulse, Ledger, Timeline automatically.

### MedPulse (Java) — Stage 4
Medicine tracker. Auto-schedules from prescriptions. Web Push + email reminders. Adherence tracking.

### Ledger (Java) — Stage 5
Finance. Expenses + receipt OCR + budgets + bills + charts + CSV export.

### Timeline (Java) — Stage 6
Calendar. Auto-events. WebSocket STOMP real-time sync. iCal export.

### Thread (Node.js Express + Socket.io) — Stage 7
Chat. Separate Docker container. Real-time via Socket.io. Context references (link docs/expenses/meds in messages). Redis pub/sub bridges to Spring Boot for Feed activity.

### Vault (Java) — Stage 8, WiFi-Only
Password vault. Client-side AES-256-GCM encryption. Zero-knowledge. WiFi-gated.

### Gallery (Java) — Stage 9
Photos. MinIO + presigned URLs. AI tagging via Cortex. Masonry grid.

### Atlas (Java) — Stage 10
Semantic search. RAG: question → Cortex embed → pgvector search → Cortex generate answer with citations.

### Console (Java + Grafana) — Stage 11, WiFi-Only
Admin panel. Embedded Grafana dashboards. Server health, deployments, logs, backups, VPN peers.

---

## Security Model

1. **Role-based**: Spring Security JWT
2. **Network-based**: NetworkSecurityFilter (WiFi-gated Vault + Console)
3. **Space-based**: SpaceAccessFilter (family vs friend isolation)
4. **Encryption**: Vault client-side AES-256-GCM
5. **VPN**: WireGuard for remote admin access
