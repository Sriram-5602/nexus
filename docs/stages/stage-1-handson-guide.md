# Stage 1 — Hands-On Build Guide

> **Purpose**: This guide walks you through every single command, file creation, and modification that was done in Stage 1. You'll do it all yourself, step by step, understanding why each piece exists.
>
> **Starting state**: Your workspace should have only: `.gitignore`, `LICENSE`, `README.md`, `.cursorrules`, and `docs/`.
>
> **Backup**: Everything is saved in git. Run `git checkout stage-1-complete` to restore the finished state at any time.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Phase 1: Backend Scaffold (Stage 1.1)](#phase-1-backend-scaffold-stage-11)
- [Phase 2: Frontend Scaffold (Stage 1.2a)](#phase-2-frontend-scaffold-stage-12a)
- [Phase 3: Docker Infrastructure (Stage 1.2b)](#phase-3-docker-infrastructure-stage-12b)
- [Phase 4: Health Endpoint + Network Detection (Stage 1.3)](#phase-4-health-endpoint--network-detection-stage-13)
- [Verification](#verification)

---

## Prerequisites

Before starting, make sure you have these installed:

| Tool | Why | Check command |
|------|-----|---------------|
| **Java (any version)** | Gradle wrapper will auto-download JDK 21, but needs a JVM to bootstrap | `java -version` |
| **Node.js 18+** | Frontend build tool (Vite) and Thread service | `node -v` |
| **npm** | Package manager for JavaScript | `npm -v` |
| **curl** | To download the Spring Boot starter project | `curl --version` |
| **unzip** | To extract the downloaded ZIP | `unzip -v` |
| **Docker + Docker Compose** | To run all 12 services in containers | `docker --version` |

> **Note**: You do NOT need to install Gradle or JDK 21 manually. The Gradle wrapper handles both automatically.

---

## Phase 1: Backend Scaffold (Stage 1.1)

This phase creates the Spring Boot backend — the heart of Nexus where 7 of 11 modules live.

---

### Step 1: Generate the Spring Boot project from Spring Initializr

```bash
curl -sL "https://start.spring.io/starter.zip" \
  -d type=gradle-project-kotlin \
  -d language=java \
  -d javaVersion=21 \
  -d bootVersion=3.5.0 \
  -d groupId=dev.nexus \
  -d artifactId=nexus \
  -d name=Nexus \
  -d packageName=dev.nexus \
  -d "dependencies=web,security,data-jpa,websocket,actuator,validation,data-redis,postgresql,lombok" \
  -o /tmp/nexus-init.zip
```

**Why**: Spring Initializr is Spring's official project generator. Instead of manually creating dozens of files and figuring out compatible dependency versions, it generates a ready-to-compile project skeleton. We're requesting:
- `gradle-project-kotlin` — Gradle build system with Kotlin DSL (`.kts` files for type-safe build configs)
- `javaVersion=21` — Java 21 LTS (virtual threads, pattern matching, record patterns)
- `bootVersion=3.5.0` — The Initializr no longer serves 3.3.x (minimum available as of March 2026 is 3.5.0). We'll downgrade to 3.3.7 manually in the next step
- The dependencies are Spring Boot "starters" — curated bundles of libraries (e.g., `web` gives you Tomcat + Jackson + MVC)

---

### Step 2: Unzip into the backend directory

```bash
mkdir -p backend
unzip -o /tmp/nexus-init.zip -d backend/
```

**Why**: Creates the `backend/` directory and extracts the generated project into it. The `-o` flag overwrites without prompting. After this, you'll have:
- `gradlew` / `gradlew.bat` — Gradle wrapper scripts (never install Gradle globally; always use these)
- `gradle/wrapper/` — The wrapper JAR and properties file (pins Gradle version)
- `build.gradle.kts` — Build configuration (we'll customize this next)
- `settings.gradle.kts` — Project name
- `src/main/java/dev/nexus/NexusApplication.java` — Entry point
- `src/main/resources/application.properties` — Config (we'll replace with YAML)
- `src/test/` — Test skeleton

---

### Step 3: Delete the Spring Initializr boilerplate file

```bash
rm -f backend/HELP.md
```

**Why**: Spring Initializr generates a `HELP.md` with generic links to Spring documentation. It's not useful for our project.

---

### Step 4: Customize build.gradle.kts

Open `backend/build.gradle.kts` and **replace its entire contents** with:

```kotlin
plugins {
	java
	id("org.springframework.boot") version "3.3.7"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "dev.nexus"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

val mapstructVersion = "1.6.3"
val jjwtVersion = "0.12.6"

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-websocket")
	implementation("org.springframework.boot:spring-boot-starter-actuator")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.boot:spring-boot-starter-data-redis")

	runtimeOnly("org.postgresql:postgresql")

	compileOnly("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok")

	implementation("org.mapstruct:mapstruct:$mapstructVersion")
	annotationProcessor("org.mapstruct:mapstruct-processor:$mapstructVersion")
	annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")

	implementation("io.jsonwebtoken:jjwt-api:$jjwtVersion")
	runtimeOnly("io.jsonwebtoken:jjwt-impl:$jjwtVersion")
	runtimeOnly("io.jsonwebtoken:jjwt-jackson:$jjwtVersion")

	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.springframework.security:spring-security-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
```

**Why — what changed from the Initializr default**:
- **Spring Boot 3.5.0 → 3.3.7**: We want the stable 3.3.x line. 3.3.7 is the latest patch of this LTS-compatible line.
- **dependency-management 1.1.7**: Manages transitive dependency versions so Spring libraries don't conflict.
- **MapStruct (1.6.3)**: Generates type-safe Java-to-Java mappers at compile time (e.g., `User` entity → `UserDto`). Eliminates manual mapping boilerplate.
- **lombok-mapstruct-binding (0.2.0)**: Makes Lombok and MapStruct work together — Lombok generates getters/setters first, then MapStruct uses them for mapping.
- **JJWT (0.12.6)**: JSON Web Token library split into 3 JARs — `jjwt-api` (compile-time interface), `jjwt-impl` (runtime implementation), `jjwt-jackson` (JSON serialization). Used for auth tokens shared across Spring Boot, Node.js, and Python.
- **`configurations` block**: Makes `compileOnly` dependencies (Lombok) available to annotation processors. Without this, Lombok annotations wouldn't generate code during compilation.
- Each `spring-boot-starter-*` is a curated bundle — e.g., `starter-web` includes Tomcat, Jackson, Spring MVC. See `stage-1.md` for detailed explanation of every dependency.

---

### Step 5: Add the Foojay toolchain resolver to settings.gradle.kts

Open `backend/settings.gradle.kts` and **replace its entire contents** with:

```kotlin
plugins {
	id("org.gradle.toolchains.foojay-resolver-convention") version "0.9.0"
}

rootProject.name = "nexus"
```

**Why**: Your machine might not have JDK 21 installed. The Foojay plugin auto-downloads it:
1. Gradle reads `build.gradle.kts` → sees `JavaLanguageVersion.of(21)`
2. Scans local JDKs → doesn't find 21
3. Foojay plugin queries the Foojay Disco API → finds a matching JDK (Temurin) for your OS/arch
4. Downloads it to `~/.gradle/jdks/` → uses it for compilation
5. Subsequent runs reuse the cached JDK instantly

Without this plugin, you'd need to install JDK 21 manually.

---

### Step 6: Replace application.properties with application.yml

```bash
rm -f backend/src/main/resources/application.properties
```

**Why**: Spring Boot supports both `.properties` (flat key-value) and `.yml` (hierarchical YAML) for configuration. YAML is more readable for nested config like Nexus needs.

Now create the file `backend/src/main/resources/application.yml` with this content:

```yaml
spring:
  application:
    name: nexus

  datasource:
    url: jdbc:postgresql://localhost:5432/nexus
    username: ${DB_USERNAME:nexus}
    password: ${DB_PASSWORD:nexus}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
    open-in-view: false

  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}

server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics

nexus:
  security:
    jwt-secret: ${JWT_SECRET:change-me-in-production}
    jwt-expiration-ms: 86400000
    home-subnets:
      - 192.168.0.0/16
      - 10.66.66.0/24
  services:
    minio-url: ${MINIO_ENDPOINT:http://localhost:9000}
    ollama-url: ${OLLAMA_BASE_URL:http://localhost:11434}
```

**Why — each section explained**:
- **`spring.datasource`**: PostgreSQL connection. `${DB_USERNAME:nexus}` means "use the `DB_USERNAME` env var, or default to `nexus`". This lets Docker override values without changing the file.
- **`spring.jpa.hibernate.ddl-auto: update`**: Hibernate auto-creates/updates database tables based on your `@Entity` classes. Perfect for development (in production, you'd use Flyway migrations).
- **`spring.jpa.open-in-view: false`**: Disables a performance anti-pattern where Hibernate keeps database sessions open during view rendering. Forces you to load all data in the service layer.
- **`spring.data.redis`**: Redis connection for caching, pub/sub (chat events between Spring Boot and Thread service), and Socket.io adapter.
- **`server.port: 8080`**: The HTTP port Spring Boot listens on.
- **`management.endpoints`**: Spring Actuator endpoints — `/actuator/health`, `/actuator/info`, `/actuator/metrics`. Used by Docker health checks and Grafana monitoring.
- **`nexus.security`**: Custom config namespace. `home-subnets` defines which IP ranges count as "home network" (WiFi LAN + WireGuard VPN). The NetworkSecurityFilter uses these to block remote access to Vault and Console.
- **`nexus.services`**: URLs for MinIO (file storage) and Ollama (AI model runtime). The health checker pings these to report service status.

---

### Step 7: Create the module package structure

Each Nexus module gets its own Java package. Java packages are directories with a `package-info.java` file. The `package-info.java` serves two purposes: (1) makes Git track the empty directory, and (2) documents what the module does.

```bash
# Navigate to the source root
cd backend/src/main/java/dev/nexus

# Create all module directories
mkdir -p core cortex docsense medpulse ledger timeline thread vault gallery atlas console spaces
mkdir -p shared/config shared/dto shared/events shared/exception shared/security
```

**Why these specific packages**: Each maps to one of Nexus's 11 sub-projects:
- `core` — Auth, JWT, roles, spaces, WiFi security
- `cortex` — REST client wrapper for the Python AI engine (NOT the Python service itself)
- `docsense` — Document upload → OCR → classify → extract → auto-actions
- `medpulse` — Medicine tracker, push reminders, adherence
- `ledger` — Expenses, receipt scanning, budgets
- `timeline` — Smart calendar, WebSocket sync, iCal
- `thread` — Java-side models + Redis pub/sub for the Node.js chat service
- `vault` — Password vault, AES-256-GCM, WiFi-only
- `gallery` — Photos, AI tagging, presigned URLs
- `atlas` — Semantic search, RAG pipeline
- `console` — Admin panel, monitoring, WiFi-only
- `spaces` — Family space, friend groups, shared contexts
- `shared` — Cross-cutting code used by all modules (config, DTOs, exceptions, security)

Now create the `package-info.java` files. Each file is tiny — just a Javadoc comment and a package declaration:

```bash
# Go back to project root first
cd /path/to/Nexus
```

Create `backend/src/main/java/dev/nexus/core/package-info.java`:
```java
/**
 * Nexus Core — Auth, JWT, roles, spaces, WiFi security.
 */
package dev.nexus.core;
```

Create `backend/src/main/java/dev/nexus/cortex/package-info.java`:
```java
/**
 * Cortex client — REST wrapper for the Python AI engine.
 */
package dev.nexus.cortex;
```

Create `backend/src/main/java/dev/nexus/docsense/package-info.java`:
```java
/**
 * DocSense — Document upload, OCR, classify, extract, auto-actions.
 */
package dev.nexus.docsense;
```

Create `backend/src/main/java/dev/nexus/medpulse/package-info.java`:
```java
/**
 * MedPulse — Medicine tracker, push reminders, adherence.
 */
package dev.nexus.medpulse;
```

Create `backend/src/main/java/dev/nexus/ledger/package-info.java`:
```java
/**
 * Ledger — Expenses, receipt scanning, budgets.
 */
package dev.nexus.ledger;
```

Create `backend/src/main/java/dev/nexus/timeline/package-info.java`:
```java
/**
 * Timeline — Smart calendar, WebSocket sync, iCal.
 */
package dev.nexus.timeline;
```

Create `backend/src/main/java/dev/nexus/thread/package-info.java`:
```java
/**
 * Thread — Java-side models and Redis pub/sub integration for the Node.js chat service.
 */
package dev.nexus.thread;
```

Create `backend/src/main/java/dev/nexus/vault/package-info.java`:
```java
/**
 * Vault — Password vault, AES-256-GCM, WiFi-only access.
 */
package dev.nexus.vault;
```

Create `backend/src/main/java/dev/nexus/gallery/package-info.java`:
```java
/**
 * Gallery — Photos, AI tagging, presigned URLs.
 */
package dev.nexus.gallery;
```

Create `backend/src/main/java/dev/nexus/atlas/package-info.java`:
```java
/**
 * Atlas — Semantic search, RAG pipeline.
 */
package dev.nexus.atlas;
```

Create `backend/src/main/java/dev/nexus/console/package-info.java`:
```java
/**
 * Console — Admin panel, monitoring, WiFi-only.
 */
package dev.nexus.console;
```

Create `backend/src/main/java/dev/nexus/spaces/package-info.java`:
```java
/**
 * Spaces — Family space, friend groups, shared contexts.
 */
package dev.nexus.spaces;
```

Create `backend/src/main/java/dev/nexus/shared/config/package-info.java`:
```java
/**
 * Shared configuration — security, Redis, WebSocket, etc.
 */
package dev.nexus.shared.config;
```

Create `backend/src/main/java/dev/nexus/shared/events/package-info.java`:
```java
/**
 * Cross-module Spring application events.
 */
package dev.nexus.shared.events;
```

---

### Step 8: Create ApiResponse.java — the unified response envelope

Create `backend/src/main/java/dev/nexus/shared/dto/ApiResponse.java`:

```java
package dev.nexus.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

    @Builder.Default
    private Instant timestamp = Instant.now();

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}
```

**Why**: Every single API endpoint in Nexus returns this wrapper. It guarantees a consistent JSON shape:
```json
{ "success": true, "data": { ... }, "timestamp": "2026-03-14T..." }
```
- `@Data` (Lombok) — generates getters, setters, toString, equals, hashCode
- `@Builder` (Lombok) — generates the builder pattern: `ApiResponse.builder().success(true).data(user).build()`
- `@JsonInclude(NON_NULL)` — omits null fields from JSON (so success responses don't show `"message": null`)
- `@Builder.Default` on timestamp — auto-sets to `Instant.now()` unless you override it
- The three static factory methods (`success(data)`, `success(msg, data)`, `error(msg)`) keep controller code clean — one-liners instead of builder chains

---

### Step 9: Create GlobalExceptionHandler.java — centralized error handling

Create `backend/src/main/java/dev/nexus/shared/exception/GlobalExceptionHandler.java`:

```java
package dev.nexus.shared.exception;

import dev.nexus.shared.dto.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(errors));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred"));
    }
}
```

**Why**: Without this, every controller would need its own try/catch blocks, and errors would have inconsistent JSON formats. `@RestControllerAdvice` makes Spring route ALL unhandled exceptions through this class. Every error returns a proper `ApiResponse` with the right HTTP status code:
- `EntityNotFoundException` → 404 (e.g., `findById(999)` returns empty)
- `AccessDeniedException` → 403 (e.g., FRIEND tries to access Vault)
- `MethodArgumentNotValidException` → 400 (e.g., `@Valid` catches missing fields)
- `IllegalArgumentException` → 400 (e.g., negative expense amount)
- `Exception` (catch-all) → 500 (generic message to avoid leaking internal details)

---

### Step 10: Create NetworkSecurityFilter.java — placeholder

Create `backend/src/main/java/dev/nexus/shared/security/NetworkSecurityFilter.java`:

> **Note**: This is initially a pass-through placeholder. We'll make it functional in Phase 4. For now it just lets all requests through.

```java
package dev.nexus.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class NetworkSecurityFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        // TODO: Implement network trust checking (Phase 4)
        filterChain.doFilter(request, response);
    }
}
```

**Why**: `OncePerRequestFilter` is a Spring base class that guarantees the filter runs exactly once per HTTP request. This filter will eventually block REMOTE access to `/api/v1/vault/**` and `/api/v1/admin/**`. For now it's a pass-through so the project compiles. Creating the placeholder now establishes the pattern — when we implement it in Phase 4, the class already exists in the right place.

---

### Step 11: Compile to verify everything works

```bash
cd backend
./gradlew compileJava
```

**Why**: This is your first "does it all work?" check. On first run, several things happen automatically:
1. Gradle wrapper downloads Gradle 8.14.4 (cached in `~/.gradle/wrapper/dists/`)
2. Foojay plugin downloads JDK 21 (cached in `~/.gradle/jdks/`)
3. Gradle downloads all dependencies from Maven Central (cached in `~/.gradle/caches/`)
4. Java compiler compiles all `.java` files

Expected output: `BUILD SUCCESSFUL`. If you see errors, check that your `build.gradle.kts` and Java files have no typos.

> **First run will take 1-3 minutes** (downloading Gradle + JDK + dependencies). Subsequent runs take seconds.

```bash
cd ..
```

---

## Phase 2: Frontend Scaffold (Stage 1.2a)

This phase creates the React frontend — a single-page application (SPA) that will be the UI for all Nexus modules.

---

### Step 12: Scaffold the React + TypeScript project with Vite

```bash
npm create vite@latest frontend -- --template react-ts
```

**Why**: Vite is a frontend build tool that provides:
- **Dev server** with instant hot reload (<100ms updates when you change code)
- **Production bundler** that tree-shakes and minifies for optimal file sizes
- The `react-ts` template gives us React 19 + TypeScript + ESLint pre-configured

This creates a `frontend/` directory with a working React app skeleton.

---

### Step 13: Install base dependencies

```bash
cd frontend
npm install
```

**Why**: Downloads React, ReactDOM, TypeScript, Vite, ESLint and all their sub-dependencies into `node_modules/`. Also creates `package-lock.json` which pins exact versions for reproducible builds.

---

### Step 14: Install Nexus-specific packages

```bash
npm install tailwindcss @tailwindcss/vite @tanstack/react-query zustand axios react-router-dom framer-motion lucide-react date-fns
```

**Why** — each package:
- **tailwindcss + @tailwindcss/vite**: Utility-first CSS framework. Instead of writing CSS files, you compose styles in JSX: `<div className="flex p-4 rounded-xl bg-white/[0.03]">`. The Vite plugin scans your code and generates only the CSS you actually use.
- **@tanstack/react-query**: Server state management. Handles API fetching, caching, retries, refetching, loading/error states. Replaces manual `useState`/`useEffect` patterns.
- **zustand**: Client state management. Lightweight alternative to Redux (1KB). For UI state like sidebar open/closed, current theme, selected module.
- **axios**: HTTP client for API calls. Supports interceptors (auto-attach JWT), request/response transformation, better error handling than native `fetch`.
- **react-router-dom**: Client-side routing. Maps URLs to components (e.g., `/vault` → VaultPage, `/chat` → ChatPage).
- **framer-motion**: Animation library. Declarative animations with `<motion.div animate={{ opacity: 1 }}>`. Used for page transitions, card animations, loading states.
- **lucide-react**: Icon library (1000+ icons as React components). `<Database />`, `<Brain />`, `<Wifi />`, etc.
- **date-fns**: Date utility library. `format(date, 'MMM d')`, `formatDistanceToNow(date)`. Tree-shakeable (only imports what you use, unlike Moment.js).

---

### Step 15: Downgrade react-router-dom to v6

```bash
npm install react-router-dom@6
```

**Why**: The previous step installs v7 by default (latest). React Router v7 is a major rewrite based on Remix with different patterns (loaders, actions, file-based routing). v6 uses the traditional `<Routes>/<Route>` pattern that's simpler, well-documented, and what Nexus is built around.

---

### Step 16: Clean up Vite defaults

```bash
rm -f src/App.css
rm -rf src/assets/
```

**Why**:
- `App.css` — We use Tailwind for all styling, not CSS files. Keeping this would create confusion about where styles should go.
- `src/assets/` — Contains default Vite and React logos. We don't need them.

---

### Step 17: Create the folder structure

```bash
mkdir -p src/components/shared src/hooks src/modules src/services src/store src/theme src/types
touch src/components/shared/.gitkeep src/hooks/.gitkeep src/store/.gitkeep src/theme/.gitkeep
```

**Why**: Establishes where every type of code lives:
- `components/shared/` — Reusable UI components (buttons, modals, cards)
- `hooks/` — Custom React hooks (useAuth, useDebounce, etc.)
- `modules/` — Page-level components, one per Nexus module
- `services/` — API client and service wrappers
- `store/` — Zustand state stores
- `theme/` — Design tokens and theme utilities
- `types/` — TypeScript type definitions

`.gitkeep` files make Git track otherwise empty directories. Git ignores empty directories by default.

---

### Step 18: Set up Tailwind CSS v4 design system

Open `frontend/src/index.css` and **replace its entire contents** with:

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-heading: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;

  --color-background: #07080d;
  --color-surface: rgba(255, 255, 255, 0.03);
  --color-surface-hover: rgba(255, 255, 255, 0.06);
  --color-border: rgba(255, 255, 255, 0.08);

  --color-primary: #0f172a;
  --color-accent: #6366f1;
  --color-accent-light: #818cf8;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #f43f5e;
}

body {
  background-color: var(--color-background);
  color: #e2e8f0;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Why**: Tailwind v4 uses `@theme {}` in CSS (not `tailwind.config.js` like v3) to define design tokens. These become Tailwind utility classes you can use throughout the app:
- `bg-background` → `#07080d` (dark glassmorphism background)
- `bg-surface` → semi-transparent white (glass card effect)
- `text-accent` → `#6366f1` (indigo)
- `border-border` → subtle white border for glass effect
- `font-heading` → Plus Jakarta Sans for headings

The `@import "tailwindcss"` line activates Tailwind's entire utility class system. The Vite plugin processes this and generates only the CSS your components actually reference.

---

### Step 19: Configure vite.config.ts

Open `frontend/vite.config.ts` and **replace its entire contents** with:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

**Why**:
- **`plugins: [react(), tailwindcss()]`** — Enables React JSX transformation and Tailwind CSS processing.
- **`alias: { '@': './src' }`** — Lets you write `import { Home } from '@/modules/Home'` instead of `import { Home } from '../../../modules/Home'`. The `@` symbol always resolves to `src/`, no matter how deeply nested your file is.
- **`server.port: 5173`** — Dev server runs on port 5173.
- **`server.proxy`** — During development, when the frontend calls `/api/...`, Vite proxies it to `http://localhost:8080` (Spring Boot). This avoids CORS issues and simulates the production Nginx setup.

---

### Step 20: Add TypeScript path aliases

Open `frontend/tsconfig.app.json` and **replace its entire contents** with:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

**Why**: The key addition is the `paths` section — `"@/*": ["src/*"]`. This tells TypeScript that `@/modules/Home` resolves to `src/modules/Home`. Without this, TypeScript would show red squiggles on `@/` imports even though Vite handles them correctly. Both Vite AND TypeScript need to know about the alias.

---

### Step 21: Set up App.tsx with Router and Query Client

Open `frontend/src/App.tsx` and **replace its entire contents** with:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Home } from '@/modules/Home'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
```

**Why**: This wires up the two foundational systems:
- **`QueryClientProvider`** — Makes React Query available to all components. `staleTime: 5 * 60 * 1000` means cached data is considered fresh for 5 minutes (won't refetch unnecessarily). `retry: 1` means failed requests retry once before showing an error.
- **`BrowserRouter` + `Routes`** — Client-side routing. Currently just one route (`/` → Home). Every new page (Vault, Chat, Calendar, etc.) will be a new `<Route>` here.

---

### Step 22: Set up main.tsx

Open `frontend/src/main.tsx` and make sure it contains:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Why**: This is the entry point — where React attaches to the DOM. `StrictMode` enables extra development warnings (double-renders to catch side effects, deprecation warnings). The `./index.css` import loads our Tailwind design system. This file was mostly generated by Vite — we just make sure it imports `App` (not `./App.tsx` with extension) and `./index.css` (not `./App.css` which we deleted).

---

### Step 23: Create the initial Home page

Create `frontend/src/modules/Home.tsx`:

```tsx
import { Sparkles } from 'lucide-react'

export function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h1 className="font-heading mb-2 text-4xl font-bold tracking-tight text-white">
          Hello, Nexus
        </h1>
        <p className="text-slate-400">
          Your family operating system
        </p>
      </div>
    </div>
  )
}
```

**Why**: A simple "Hello, Nexus" page that proves the entire frontend pipeline works — React rendering, Tailwind styling, Lucide icons, path aliases (`@/modules/Home`), and the design system (`font-heading`, `shadow-indigo-500/25`). We'll enhance this with a health dashboard in Phase 4.

---

### Step 24: Build and verify

```bash
npm run build
```

**Why**: Runs the full production build pipeline:
1. `tsc -b` — TypeScript type-checks all files (catches type errors)
2. `vite build` — Bundles, tree-shakes, and minifies into `dist/`

Expected: `✓ built in ~2s` with zero errors. The `dist/` directory contains the production-ready HTML/CSS/JS that Nginx will serve.

```bash
cd ..
```

---

## Phase 3: Docker Infrastructure (Stage 1.2b)

This phase creates the Docker setup for all 12 services — databases, AI engine, the three backend stacks, monitoring, networking, and automation.

---

### Step 25: Create the Docker directory structure

```bash
mkdir -p docker/nginx docker/postgres docker/grafana/provisioning/datasources docker/grafana/provisioning/dashboards
```

**Why**: Organizes Docker-related files. Each subdirectory holds configuration that gets mounted into the corresponding container.

---

### Step 26: Create docker-compose.yml — the main orchestration file

Create `docker/docker-compose.yml`:

```yaml
services:

  # ─── DATA STORES ─────────────────────────────────────────────

  postgres:
    image: pgvector/pgvector:pg16
    container_name: nexus-postgres
    restart: unless-stopped
    mem_limit: 300m
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-nexus}
      POSTGRES_USER: ${POSTGRES_USER:-nexus}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    command: >
      postgres
        -c shared_buffers=128MB
        -c max_connections=100
        -c work_mem=4MB
        -c effective_cache_size=256MB
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-nexus}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: nexus-redis
    restart: unless-stopped
    mem_limit: 80m
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: >
      redis-server
        --maxmemory 64mb
        --maxmemory-policy allkeys-lru
        --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    container_name: nexus-minio
    restart: unless-stopped
    mem_limit: 200m
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-nexus}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required}
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio-init:
    image: minio/mc:latest
    container_name: nexus-minio-init
    mem_limit: 64m
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
        mc alias set nexus http://minio:9000 $${MINIO_ROOT_USER} $${MINIO_ROOT_PASSWORD};
        mc mb --ignore-existing nexus/documents;
        mc mb --ignore-existing nexus/photos;
        mc mb --ignore-existing nexus/backups;
        echo 'Buckets created successfully';
      "
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-nexus}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required}

  # ─── AI ENGINE ───────────────────────────────────────────────

  ollama:
    image: ollama/ollama:latest
    container_name: nexus-ollama
    restart: unless-stopped
    mem_limit: 2g
    ports:
      - "11434:11434"
    environment:
      OLLAMA_KEEP_ALIVE: 2m
      OLLAMA_HOST: 0.0.0.0
    volumes:
      - ollama_data:/root/.ollama
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:11434/api/tags || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 3

  # ─── APPLICATION SERVICES ────────────────────────────────────

  nexus-api:
    build:
      context: ../backend
      dockerfile: Dockerfile
    container_name: nexus-api
    restart: unless-stopped
    mem_limit: 600m
    ports:
      - "8080:8080"
    environment:
      JAVA_OPTS: -Xmx512m -Xms256m
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB:-nexus}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER:-nexus}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
      SPRING_DATA_REDIS_HOST: redis
      SPRING_DATA_REDIS_PORT: 6379
      NEXUS_SECURITY_JWT_SECRET: ${JWT_SECRET:?JWT_SECRET is required}
      MINIO_ENDPOINT: http://minio:9000
      MINIO_ACCESS_KEY: ${MINIO_ROOT_USER:-nexus}
      MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required}
      CORTEX_BASE_URL: http://cortex-service:8000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:8080/actuator/health || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 30s

  cortex-service:
    build:
      context: ../cortex-service
      dockerfile: Dockerfile
    container_name: nexus-cortex
    restart: unless-stopped
    mem_limit: 200m
    ports:
      - "8000:8000"
    environment:
      OLLAMA_BASE_URL: http://ollama:11434
      DATABASE_URL: postgresql://${POSTGRES_USER:-nexus}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-nexus}
      REDIS_URL: redis://redis:6379
    depends_on:
      ollama:
        condition: service_healthy
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:8000/cortex/status || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 10s

  thread-service:
    build:
      context: ../thread-service
      dockerfile: Dockerfile
    container_name: nexus-thread
    restart: unless-stopped
    mem_limit: 180m
    ports:
      - "3000:3000"
    environment:
      NODE_OPTIONS: --max-old-space-size=128
      DATABASE_URL: postgresql://${POSTGRES_USER:-nexus}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-nexus}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET:?JWT_SECRET is required}
      PORT: 3000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:3000/health || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 10s

  # ─── MONITORING & AUTOMATION ─────────────────────────────────

  grafana:
    image: grafana/grafana-oss:latest
    container_name: nexus-grafana
    restart: unless-stopped
    mem_limit: 250m
    ports:
      - "3001:3000"
    environment:
      GF_SERVER_ROOT_URL: /grafana/
      GF_SERVER_SERVE_FROM_SUB_PATH: "true"
      GF_SECURITY_ADMIN_USER: ${GRAFANA_ADMIN_USER:-admin}
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:-admin}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro

  n8n:
    image: n8nio/n8n:latest
    container_name: nexus-n8n
    restart: unless-stopped
    mem_limit: 300m
    profiles:
      - full
    ports:
      - "5678:5678"
    environment:
      N8N_HOST: 0.0.0.0
      N8N_PORT: 5678
      N8N_PROTOCOL: http
      WEBHOOK_URL: https://${DOMAIN:-nexus.yourname.dev}/n8n/
      N8N_PATH: /n8n/
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: ${POSTGRES_DB:-nexus}
      DB_POSTGRESDB_USER: ${POSTGRES_USER:-nexus}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy

  # ─── NETWORKING & ACCESS ─────────────────────────────────────

  wireguard:
    image: lscr.io/linuxserver/wireguard:latest
    container_name: nexus-wireguard
    restart: unless-stopped
    mem_limit: 100m
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    ports:
      - "51820:51820/udp"
    environment:
      PUID: 1000
      PGID: 1000
      TZ: ${TZ:-Asia/Kolkata}
      SERVERURL: ${DOMAIN:-nexus.yourname.dev}
      PEERS: admin-phone,admin-laptop
      INTERNAL_SUBNET: 10.66.66.0
      PEERDNS: auto
    volumes:
      - wireguard_config:/config
      - /lib/modules:/lib/modules:ro
    sysctls:
      - net.ipv4.conf.all.src_valid_mark=1

  nginx:
    image: nginx:alpine
    container_name: nexus-nginx
    restart: unless-stopped
    mem_limit: 50m
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ../frontend/dist:/usr/share/nginx/html:ro
    depends_on:
      - nexus-api
      - thread-service
      - grafana

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: nexus-cloudflared
    restart: unless-stopped
    mem_limit: 100m
    command: tunnel run
    environment:
      TUNNEL_TOKEN: ${CLOUDFLARE_TUNNEL_TOKEN:?CLOUDFLARE_TUNNEL_TOKEN is required}

# ─── VOLUMES ───────────────────────────────────────────────────

volumes:
  postgres_data:
  redis_data:
  minio_data:
  ollama_data:
  grafana_data:
  n8n_data:
  wireguard_config:
```

**Why**: This is the entire Nexus infrastructure defined as code. Each service has:
- **`mem_limit`** — Critical for 8GB RAM machine. Every container is capped. Total budget ~3.9GB.
- **`healthcheck`** — Docker monitors each service and only starts dependents when healthy.
- **`depends_on: condition: service_healthy`** — Startup order. Spring Boot waits for Postgres/Redis/MinIO to be healthy before starting.
- **`environment`** — Configuration via env vars. `${VAR:?message}` means "required, fail with message if missing". `${VAR:-default}` means "use default if not set".
- **`volumes`** — Named volumes persist data across container restarts. Database data, uploaded files, AI models all survive `docker compose down`.
- **n8n has `profiles: [full]`** — Disabled by default (saves ~300MB RAM). Only starts with `docker compose --profile full up`.
- **Inside Docker, services reference each other by container name** (e.g., `postgres:5432`, `redis:6379`). Docker's internal DNS resolves these.

See `stage-1.md` sections on each service for deep explanations.

---

### Step 27: Create docker-compose.dev.yml — development overrides

Create `docker/docker-compose.dev.yml`:

```yaml
# Development overrides — use with:
#   docker compose -f docker-compose.yml -f docker-compose.dev.yml up
#
# Differences from production:
#   - No cloudflared (no tunnel needed locally)
#   - No wireguard (not needed for dev)
#   - No nginx (Vite dev server handles frontend + proxy)
#   - App services build from source on every up
#   - Debug ports exposed

services:

  # Disable production-only services
  cloudflared:
    profiles:
      - never

  wireguard:
    profiles:
      - never

  nginx:
    profiles:
      - never

  # Spring Boot with debug port
  nexus-api:
    environment:
      JAVA_OPTS: -Xmx512m -Xms256m -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
      SPRING_PROFILES_ACTIVE: dev
    ports:
      - "8080:8080"
      - "5005:5005"
    build:
      context: ../backend
      dockerfile: Dockerfile

  # Cortex with reload
  cortex-service:
    environment:
      ENVIRONMENT: development
    build:
      context: ../cortex-service
      dockerfile: Dockerfile

  # Thread with inspect
  thread-service:
    environment:
      NODE_ENV: development
      NODE_OPTIONS: --max-old-space-size=128 --inspect=0.0.0.0:9229
    ports:
      - "3000:3000"
      - "9229:9229"
    build:
      context: ../thread-service
      dockerfile: Dockerfile
```

**Why**: Docker Compose supports merging multiple files. The dev override:
- **Disables** Cloudflared, WireGuard, Nginx (not needed locally — Vite's proxy replaces Nginx)
- **Adds debug ports**: 5005 for Java remote debugging, 9229 for Node.js inspector
- **Sets `SPRING_PROFILES_ACTIVE: dev`** — Spring Boot can have different config per profile
- Uses `profiles: [never]` to disable services (a profile named "never" is never activated)

---

### Step 28: Create .env.example

Create `docker/.env.example`:

```bash
# ─── Nexus Environment Variables ───────────────────────────────
# Copy this file to .env and fill in the values:
#   cp .env.example .env

# ─── Domain ────────────────────────────────────────────────────
DOMAIN=nexus.yourname.dev
TZ=Asia/Kolkata

# ─── PostgreSQL ────────────────────────────────────────────────
POSTGRES_DB=nexus
POSTGRES_USER=nexus
POSTGRES_PASSWORD=CHANGE_ME_strong_password_here

# ─── Redis ─────────────────────────────────────────────────────
# No auth by default (internal network only). Add password if needed:
# REDIS_PASSWORD=

# ─── MinIO (Object Storage) ───────────────────────────────────
MINIO_ROOT_USER=nexus
MINIO_ROOT_PASSWORD=CHANGE_ME_minio_password_here

# ─── JWT (shared across Spring Boot, Node.js, Python) ─────────
# Generate with: openssl rand -base64 64
JWT_SECRET=CHANGE_ME_generate_with_openssl_rand_base64_64

# ─── Grafana ───────────────────────────────────────────────────
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=CHANGE_ME_grafana_password

# ─── Cloudflare Tunnel ─────────────────────────────────────────
# Get from: https://one.dash.cloudflare.com → Zero Trust → Tunnels
CLOUDFLARE_TUNNEL_TOKEN=CHANGE_ME_your_tunnel_token

# ─── SendGrid (email, used by Spring Boot) ─────────────────────
# SENDGRID_API_KEY=
```

**Why**: Environment variables keep secrets out of code. The `.env.example` is committed to git (shows what variables are needed), while `.env` (with real values) is gitignored. Variables marked `CHANGE_ME` must be replaced before running. The `?` syntax in docker-compose (`${VAR:?message}`) enforces required variables — Docker refuses to start if they're missing.

---

### Step 29: Create the Nginx reverse proxy config

Create `docker/nginx/nginx.conf`:

```nginx
worker_processes auto;

events {
    worker_connections 256;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    sendfile    on;
    tcp_nopush  on;

    keepalive_timeout 65;
    client_max_body_size 50m;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # ─── Upstream backends ──────────────────────────────────────

    upstream nexus_api {
        server nexus-api:8080;
    }

    upstream thread_service {
        server thread-service:3000;
    }

    upstream cortex_service {
        server cortex-service:8000;
    }

    upstream grafana {
        server grafana:3000;
    }

    upstream n8n {
        server n8n:5678;
    }

    # ─── HOME-only IP ranges ───────────────────────────────────
    # Used by geo block below to restrict Vault, Console, Grafana, n8n

    geo $is_home {
        default         0;
        192.168.0.0/16  1;    # WiFi LAN
        10.66.66.0/24   1;    # WireGuard VPN
        127.0.0.0/8     1;    # Localhost
        172.16.0.0/12   1;    # Docker internal
    }

    server {
        listen 80;
        server_name _;

        # ─── Thread (Node.js chat) — must be BEFORE /api/ ──────

        location /api/v1/chat/ {
            proxy_pass http://thread_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /ws/chat/ {
            proxy_pass http://thread_service;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_read_timeout 86400s;
        }

        # ─── Cortex (Python AI engine) ─────────────────────────

        location /cortex/ {
            proxy_pass http://cortex_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 300s;
        }

        # ─── Spring Boot API ───────────────────────────────────

        location /api/ {
            proxy_pass http://nexus_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /ws/ {
            proxy_pass http://nexus_api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_read_timeout 86400s;
        }

        # ─── Actuator (Spring Boot health, HOME only) ──────────

        location /actuator/ {
            if ($is_home = 0) {
                return 403;
            }
            proxy_pass http://nexus_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # ─── Grafana (HOME only) ───────────────────────────────

        location /grafana/ {
            if ($is_home = 0) {
                return 403;
            }
            proxy_pass http://grafana;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /grafana/api/live/ {
            if ($is_home = 0) {
                return 403;
            }
            proxy_pass http://grafana;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }

        # ─── n8n (HOME only) ───────────────────────────────────

        location /n8n/ {
            if ($is_home = 0) {
                return 403;
            }
            proxy_pass http://n8n;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # ─── Frontend (React SPA) ──────────────────────────────

        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }
    }
}
```

**Why**: Nginx is the single entry point. One URL (your domain) reaches three different backends based on the path:
- `/api/v1/chat/*` → Thread (Node.js) — listed BEFORE `/api/` because Nginx matches top-down
- `/cortex/*` → Cortex (Python FastAPI)
- `/api/*` → Spring Boot (catches everything not matched by chat)
- `/ws/chat/*` → Thread WebSocket — needs `Upgrade` headers for HTTP → WebSocket
- `/ws/*` → Spring Boot WebSocket (Timeline sync, etc.)
- `/grafana/`, `/n8n/`, `/actuator/` — HOME only (geo block returns 403 for non-home IPs)
- `/` → React SPA files from `frontend/dist/`. `try_files $uri $uri/ /index.html` is critical for SPA routing — any unknown path falls back to `index.html` where React Router handles it client-side.

The `geo $is_home` block maps IP ranges to a variable: `1` for home networks, `0` for everything else. This is Nginx's way of implementing network trust tiers.

---

### Step 30: Create the PostgreSQL initialization script

Create `docker/postgres/init.sql`:

```sql
-- Enable pgvector extension for semantic search (Atlas / Cortex embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- Schemas: each backend stack gets its own namespace
-- Spring Boot uses the default 'public' schema
CREATE SCHEMA IF NOT EXISTS cortex;
CREATE SCHEMA IF NOT EXISTS chat;

-- Grant access to the application user on all schemas
GRANT ALL ON SCHEMA public TO nexus;
GRANT ALL ON SCHEMA cortex TO nexus;
GRANT ALL ON SCHEMA chat   TO nexus;

-- Set default search path so each service finds its tables
ALTER DATABASE nexus SET search_path TO public, cortex, chat;
```

**Why**: This runs once when the PostgreSQL container is first created (via `docker-entrypoint-initdb.d/`). It sets up:
- **pgvector extension** — Adds vector data type and similarity search operators. Used by Atlas (RAG search) and Cortex (embeddings). Without this, `CREATE TABLE ... embedding vector(768)` would fail.
- **Three schemas** — `public` (Spring Boot tables: users, expenses, medicines, etc.), `cortex` (Python embedding tables), `chat` (Node.js message tables). Schemas are like namespaces — they prevent table name collisions between the three backends sharing one database.
- **Grants** — The `nexus` database user needs explicit permission to access non-public schemas.

---

### Step 31: Create Grafana provisioning files

Create `docker/grafana/provisioning/datasources/datasource.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://nexus-api:8080/actuator/prometheus
    isDefault: true
    editable: false
```

Create `docker/grafana/provisioning/dashboards/dashboard.yml`:

```yaml
apiVersion: 1

providers:
  - name: Nexus
    orgId: 1
    folder: Nexus
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /etc/grafana/provisioning/dashboards
      foldersFromFilesStructure: false
```

**Why**: Grafana provisioning files auto-configure Grafana on startup (no manual clicks in the UI). The datasource points Grafana at Spring Boot's Actuator Prometheus endpoint for metrics (JVM memory, HTTP request counts, response times). The dashboard provider tells Grafana where to find dashboard JSON files (we'll add actual dashboards later).

---

### Step 32: Create the Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY build/libs/nexus-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

**Why**:
- **`eclipse-temurin:21-jre-alpine`** — Adoptium's JRE 21 on Alpine Linux. JRE (not JDK) because containers only need to **run** Java, not compile it. Alpine keeps the image small (~100MB vs ~300MB for Debian).
- **`COPY build/libs/nexus-*.jar`** — Copies the fat JAR built by `./gradlew bootJar`. You must build the backend BEFORE building the Docker image.
- **`ENTRYPOINT ["sh", "-c", ...]`** — Using `sh -c` allows the `$JAVA_OPTS` env var to be expanded at runtime. This is how Docker Compose passes `-Xmx512m` (memory limit) into the JVM.

---

### Step 33: Create the Cortex service (Python FastAPI)

Create `cortex-service/Dockerfile`:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `cortex-service/requirements.txt`:

```
# Cortex — Python AI Engine dependencies
fastapi>=0.115.0
uvicorn[standard]>=0.32.0
httpx>=0.27.0
psycopg2-binary>=2.9.9
pgvector>=0.3.0
redis>=5.0.0
pydantic>=2.9.0
python-multipart>=0.0.12
Pillow>=10.4.0
```

Create `cortex-service/main.py`:

```python
from fastapi import FastAPI

app = FastAPI(title="Nexus Cortex", root_path="/cortex")


@app.get("/cortex/status")
async def status():
    return {"status": "ok", "service": "cortex"}
```

**Why**: Cortex is the AI engine — a separate Python service because Python has the best AI/ML ecosystem (Ollama client, pgvector, PIL for image processing). For now it's a minimal health-check endpoint. Future stages add OCR, classification, entity extraction, embedding generation, and RAG query endpoints.

Dependencies explained:
- **fastapi** — Async web framework with automatic OpenAPI docs
- **uvicorn** — ASGI server that runs FastAPI
- **httpx** — Async HTTP client for calling Ollama
- **psycopg2-binary** — PostgreSQL driver for storing embeddings
- **pgvector** — Python client for pgvector similarity search
- **redis** — Caching and queue integration
- **pydantic** — Data validation (FastAPI's foundation)
- **python-multipart** — File upload handling (documents, images)
- **Pillow** — Image processing for OCR preprocessing

---

### Step 34: Create the Thread service (Node.js Express + Socket.io)

Create `thread-service/Dockerfile`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

Create `thread-service/package.json`:

```json
{
  "name": "nexus-thread",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "socket.io": "^4.8.0",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.13.0",
    "ioredis": "^5.4.0",
    "cors": "^2.8.5"
  }
}
```

Create `thread-service/src/index.js`:

```javascript
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'thread' });
});

app.listen(port, () => {
  console.log(`Thread service listening on port ${port}`);
});
```

**Why**: Thread is the real-time chat service — a separate Node.js process because Socket.io (WebSocket library) is natively JavaScript and handles thousands of concurrent connections efficiently. For now it's a minimal Express server with a health endpoint. Future stages add Socket.io, JWT verification, message CRUD, and Redis pub/sub for cross-service events.

Dependencies explained:
- **express** — HTTP framework for REST endpoints (message CRUD)
- **socket.io** — WebSocket library for real-time chat
- **jsonwebtoken** — Verifies the same JWTs Spring Boot issues (shared secret)
- **pg** — PostgreSQL client for chat message storage (in `chat` schema)
- **ioredis** — Redis client for pub/sub (chat events ↔ Spring Boot) and Socket.io adapter
- **cors** — Cross-origin resource sharing middleware

---

### Step 35: Create the Makefile — shortcut commands

Create `Makefile` (in project root, NOT in docker/):

```makefile
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
```

> **IMPORTANT**: Makefile rules must use **tabs** for indentation, not spaces. If you copy-paste this, make sure each indented line starts with a real tab character.

**Why**: Typing `docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d` every time is painful. The Makefile gives you shortcuts:
- `make up` — Start production stack
- `make dev` — Start development stack (no Nginx/Cloudflared/WireGuard, debug ports)
- `make logs SVC=nexus-api` — Tail logs for a specific service
- `make fresh` — Nuclear option: stop, delete volumes, rebuild, restart
- `make db` — Quick PostgreSQL shell
- `make pull-model` — Download the TinyLlama AI model into Ollama

---

### Step 36: Update the root .gitignore

Open `.gitignore` (in project root) and **replace its entire contents** with:

```gitignore
# === Java / Spring Boot ===
*.class
*.jar
*.war
*.ear
*.log
hs_err_pid*
replay_pid*

# Gradle
backend/.gradle/
backend/build/
!backend/gradle/wrapper/gradle-wrapper.jar

# === Node / Frontend ===
node_modules/
frontend/dist/
frontend/.vite/

# === Python ===
__pycache__/
*.pyc
.venv/

# === IDE ===
.idea/
*.iml
.vscode/
*.swp
*.swo
*~

# === OS ===
.DS_Store
Thumbs.db

# === Docker ===
docker/.env

# === Environment ===
.env
.env.local
.env.*.local
```

**Why**: The original `.gitignore` (from GitHub's Java template) was too basic. The updated version covers all three stacks:
- **Java**: Compiled classes, JARs, Gradle build output (but keeps the wrapper JAR since it's needed to bootstrap Gradle)
- **Node**: `node_modules/` (thousands of dependency files — always regenerated from `package-lock.json`), `dist/` (build output), `.vite/` (cache)
- **Python**: `__pycache__/` (bytecode cache), `.venv/` (virtual environment)
- **Docker**: `docker/.env` (contains real passwords — never commit)
- **IDE**: IntelliJ, VS Code project files (personal preferences, not shared)

---

## Phase 4: Health Endpoint + Network Detection (Stage 1.3)

This phase makes the app actually DO something — a health endpoint that checks all services and detects whether you're accessing from localhost, home WiFi, or remotely.

---

### Step 37: Create NetworkTrust enum

Create `backend/src/main/java/dev/nexus/shared/security/NetworkTrust.java`:

```java
package dev.nexus.shared.security;

public enum NetworkTrust {
    LOCALHOST,
    HOME,
    REMOTE
}
```

**Why**: Nexus has three trust tiers:
- **LOCALHOST** — Direct server access. Full access to everything including raw database.
- **HOME** — WiFi LAN (192.168.x.x) or WireGuard VPN (10.66.66.x). Full app access including Vault and Console.
- **REMOTE** — Via Cloudflare Tunnel (public internet). Everything EXCEPT Vault and Console.

An enum is cleaner than string constants — the compiler catches typos, and IDE autocomplete shows all options.

---

### Step 38: Create NetworkUtils — IP detection and trust classification

Create `backend/src/main/java/dev/nexus/shared/security/NetworkUtils.java`:

```java
package dev.nexus.shared.security;

import dev.nexus.shared.config.NexusSecurityProperties;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;

@Slf4j
@Component
public class NetworkUtils {

    private static final CidrRange LOOPBACK = CidrRange.parse("127.0.0.0/8");
    private final List<CidrRange> homeRanges;

    public NetworkUtils(NexusSecurityProperties properties) {
        this.homeRanges = properties.getHomeSubnets().stream()
                .map(CidrRange::parse)
                .toList();
        log.info("Network trust configured with {} home subnets", homeRanges.size());
    }

    public NetworkTrust determineTrust(HttpServletRequest request) {
        String ip = extractClientIp(request);
        return determineTrust(ip);
    }

    public NetworkTrust determineTrust(String ip) {
        if (ip == null || ip.isBlank()) {
            return NetworkTrust.REMOTE;
        }

        if (LOOPBACK.contains(ip) || "0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return NetworkTrust.LOCALHOST;
        }

        for (CidrRange range : homeRanges) {
            if (range.contains(ip)) {
                return NetworkTrust.HOME;
            }
        }

        return NetworkTrust.REMOTE;
    }

    public String extractClientIp(HttpServletRequest request) {
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }

        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }

    static class CidrRange {
        private final int network;
        private final int mask;

        private CidrRange(int network, int mask) {
            this.network = network;
            this.mask = mask;
        }

        static CidrRange parse(String cidr) {
            try {
                String[] parts = cidr.split("/");
                InetAddress addr = InetAddress.getByName(parts[0]);
                byte[] bytes = addr.getAddress();
                if (bytes.length != 4) {
                    log.warn("IPv6 CIDR not supported: {}", cidr);
                    return new CidrRange(0, 0);
                }
                int network = toInt(bytes);
                int prefixLen = Integer.parseInt(parts[1]);
                int mask = prefixLen == 0 ? 0 : (0xFFFFFFFF << (32 - prefixLen));
                return new CidrRange(network & mask, mask);
            } catch (UnknownHostException e) {
                log.error("Invalid CIDR range: {}", cidr, e);
                return new CidrRange(0, 0);
            }
        }

        boolean contains(String ip) {
            try {
                InetAddress addr = InetAddress.getByName(ip);
                byte[] bytes = addr.getAddress();
                if (bytes.length != 4) return false;
                int ipInt = toInt(bytes);
                return (ipInt & mask) == network;
            } catch (UnknownHostException e) {
                return false;
            }
        }

        private static int toInt(byte[] bytes) {
            return ((bytes[0] & 0xFF) << 24)
                 | ((bytes[1] & 0xFF) << 16)
                 | ((bytes[2] & 0xFF) << 8)
                 | (bytes[3] & 0xFF);
        }
    }
}
```

**Why**: This is the core of network security. It:
1. **Extracts the real client IP** — Behind Nginx and Cloudflare, `request.getRemoteAddr()` returns the proxy's IP. We check `X-Real-IP` (set by Nginx) and `X-Forwarded-For` (set by Cloudflare) first.
2. **Classifies the IP into a trust tier** — Checks against loopback (127.x.x.x, ::1), then against configurable home subnets (from `application.yml`).
3. **CIDR range matching** — Implements subnet math: converts IP to 32-bit integer, applies subnet mask, checks if it matches the network address. `192.168.0.0/16` means "any IP where the first 16 bits are `192.168`".

The home subnets come from `NexusSecurityProperties` (next step), so they're configurable without code changes.

---

### Step 39: Create NexusSecurityProperties — externalized configuration

Create `backend/src/main/java/dev/nexus/shared/config/NexusSecurityProperties.java`:

```java
package dev.nexus.shared.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@Data
@ConfigurationProperties(prefix = "nexus.security")
public class NexusSecurityProperties {

    private String jwtSecret = "change-me-in-production";
    private long jwtExpirationMs = 86400000;
    private List<String> homeSubnets = List.of("192.168.0.0/16", "10.66.66.0/24");
}
```

**Why**: `@ConfigurationProperties` binds YAML config to a Java object. The `prefix = "nexus.security"` means this class maps to:
```yaml
nexus:
  security:
    jwt-secret: ...        → jwtSecret field
    jwt-expiration-ms: ... → jwtExpirationMs field
    home-subnets: [...]    → homeSubnets field
```
This is type-safe — if someone puts a string where a number is expected, Spring fails at startup with a clear error. Default values in the class serve as fallbacks.

---

### Step 40: Create SecurityConfig — Spring Security filter chain

Create `backend/src/main/java/dev/nexus/shared/config/SecurityConfig.java`:

```java
package dev.nexus.shared.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(NexusSecurityProperties.class)
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

**Why**: Spring Security locks down ALL endpoints by default (returns 401 for everything). This config:
- **Disables CSRF** — Not needed for stateless JWT APIs (CSRF protects cookie-based sessions, which Nexus doesn't use).
- **Stateless sessions** — Spring won't create HTTP sessions. Auth is via JWT in the `Authorization` header.
- **Permits public endpoints** — `/api/v1/public/**` (health check, login, register) and `/actuator/**` (monitoring) are accessible without authentication.
- **Everything else requires authentication** — Future stages add a JWT filter that validates tokens before these endpoints are reached.
- **`@EnableConfigurationProperties`** — Activates `NexusSecurityProperties` so Spring creates and injects it.

---

### Step 41: Create AppConfig — RestTemplate bean

Create `backend/src/main/java/dev/nexus/shared/config/AppConfig.java`:

```java
package dev.nexus.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(3000);
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setRequestFactory(factory);
        return restTemplate;
    }
}
```

**Why**: `RestTemplate` is Spring's HTTP client for making outbound REST calls. The health checker (next step) uses it to ping MinIO and Ollama. The 3-second timeouts prevent health checks from hanging if a service is down — without timeouts, a connection attempt to a dead service could block for 30+ seconds.

---

### Step 42: Create HealthResponse DTO

Create `backend/src/main/java/dev/nexus/core/health/HealthResponse.java`:

```java
package dev.nexus.core.health;

import dev.nexus.shared.security.NetworkTrust;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthResponse {

    private String status;
    private Map<String, String> services;
    private NetworkTrust networkTrust;
}
```

**Why**: The response shape for the health endpoint. Contains:
- `status` — "UP" (all services healthy) or "DEGRADED" (some down)
- `services` — Map of service name → status (e.g., `{"postgres": "UP", "redis": "UP", "minio": "DOWN", "ollama": "DOWN"}`)
- `networkTrust` — Which trust tier the requester is in (LOCALHOST/HOME/REMOTE)

---

### Step 43: Create ServiceHealthChecker — pings all external services

Create `backend/src/main/java/dev/nexus/core/health/ServiceHealthChecker.java`:

```java
package dev.nexus.core.health;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
public class ServiceHealthChecker {

    private final DataSource dataSource;
    private final RedisConnectionFactory redisConnectionFactory;
    private final RestTemplate restTemplate;
    private final String minioUrl;
    private final String ollamaUrl;

    public ServiceHealthChecker(
            DataSource dataSource,
            RedisConnectionFactory redisConnectionFactory,
            RestTemplate restTemplate,
            @Value("${nexus.services.minio-url:http://localhost:9000}") String minioUrl,
            @Value("${nexus.services.ollama-url:http://localhost:11434}") String ollamaUrl) {
        this.dataSource = dataSource;
        this.redisConnectionFactory = redisConnectionFactory;
        this.restTemplate = restTemplate;
        this.minioUrl = minioUrl;
        this.ollamaUrl = ollamaUrl;
    }

    public Map<String, String> checkAll() {
        Map<String, String> results = new LinkedHashMap<>();
        results.put("postgres", checkPostgres());
        results.put("redis", checkRedis());
        results.put("minio", checkMinio());
        results.put("ollama", checkOllama());
        return results;
    }

    private String checkPostgres() {
        try (Connection conn = dataSource.getConnection()) {
            conn.createStatement().execute("SELECT 1");
            return "UP";
        } catch (Exception e) {
            log.warn("PostgreSQL health check failed: {}", e.getMessage());
            return "DOWN";
        }
    }

    private String checkRedis() {
        try {
            String pong = redisConnectionFactory.getConnection().ping();
            return "PONG".equals(pong) ? "UP" : "DOWN";
        } catch (Exception e) {
            log.warn("Redis health check failed: {}", e.getMessage());
            return "DOWN";
        }
    }

    private String checkMinio() {
        try {
            restTemplate.getForEntity(minioUrl + "/minio/health/live", String.class);
            return "UP";
        } catch (Exception e) {
            log.warn("MinIO health check failed: {}", e.getMessage());
            return "DOWN";
        }
    }

    private String checkOllama() {
        try {
            restTemplate.getForEntity(ollamaUrl + "/api/tags", String.class);
            return "UP";
        } catch (Exception e) {
            log.warn("Ollama health check failed: {}", e.getMessage());
            return "DOWN";
        }
    }
}
```

**Why**: Pings each external service to check if it's alive:
- **PostgreSQL** — Opens a JDBC connection and runs `SELECT 1`. Uses `try-with-resources` to auto-close the connection.
- **Redis** — Sends a `PING` command, expects `PONG` back.
- **MinIO** — HTTP GET to `/minio/health/live` (MinIO's built-in health endpoint).
- **Ollama** — HTTP GET to `/api/tags` (lists loaded models — if it responds, Ollama is running).

Each check catches all exceptions and returns "DOWN" instead of crashing. The `@Value` annotations pull MinIO/Ollama URLs from `application.yml`, with fallback defaults for local development.

---

### Step 44: Create HealthController — the public health endpoint

Create `backend/src/main/java/dev/nexus/core/health/HealthController.java`:

```java
package dev.nexus.core.health;

import dev.nexus.shared.dto.ApiResponse;
import dev.nexus.shared.security.NetworkTrust;
import dev.nexus.shared.security.NetworkUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class HealthController {

    private final ServiceHealthChecker healthChecker;
    private final NetworkUtils networkUtils;

    @GetMapping("/health")
    public ApiResponse<HealthResponse> health(HttpServletRequest request) {
        Map<String, String> services = healthChecker.checkAll();
        NetworkTrust trust = networkUtils.determineTrust(request);

        boolean allUp = services.values().stream().allMatch("UP"::equals);
        String status = allUp ? "UP" : "DEGRADED";

        HealthResponse response = HealthResponse.builder()
                .status(status)
                .services(services)
                .networkTrust(trust)
                .build();

        return ApiResponse.success(response);
    }
}
```

**Why**: `GET /api/v1/public/health` — the first real endpoint. It's under `/public/` so it doesn't require authentication (matches the `permitAll()` rule in SecurityConfig). It:
1. Checks all services (Postgres, Redis, MinIO, Ollama)
2. Determines the requester's network trust tier
3. Returns both in a standard `ApiResponse` wrapper

This endpoint serves as a dashboard for the frontend and as a smoke test to verify the entire stack is wired correctly.

---

### Step 45: Update NetworkSecurityFilter — make it functional

Now replace the placeholder from Step 10. Open `backend/src/main/java/dev/nexus/shared/security/NetworkSecurityFilter.java` and **replace its entire contents** with:

```java
package dev.nexus.shared.security;

import dev.nexus.shared.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Blocks REMOTE access to Vault and Console endpoints.
 * HOME network (WiFi/VPN) and LOCALHOST get full access.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NetworkSecurityFilter extends OncePerRequestFilter {

    private static final List<String> HOME_ONLY_PATHS = List.of(
            "/api/v1/vault",
            "/api/v1/admin"
    );

    private final NetworkUtils networkUtils;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        boolean isHomePath = HOME_ONLY_PATHS.stream().anyMatch(path::startsWith);

        if (isHomePath) {
            NetworkTrust trust = networkUtils.determineTrust(request);
            if (trust == NetworkTrust.REMOTE) {
                String clientIp = networkUtils.extractClientIp(request);
                log.warn("Blocked REMOTE access to {} from {}", path, clientIp);

                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                objectMapper.writeValue(response.getWriter(),
                        ApiResponse.error("This resource is only accessible from the home network"));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

**Why**: Now the filter actually enforces network security:
1. Checks if the request path starts with `/api/v1/vault` or `/api/v1/admin`
2. If yes, determines the requester's trust tier using `NetworkUtils`
3. If REMOTE → blocks with 403 Forbidden and a JSON error response
4. If HOME or LOCALHOST → allows through (`filterChain.doFilter`)
5. Non-restricted paths always pass through

`ObjectMapper` (Jackson) serializes the `ApiResponse` to JSON. `@RequiredArgsConstructor` (Lombok) generates a constructor that takes `NetworkUtils` and `ObjectMapper` — Spring auto-injects both.

---

### Step 46: Recompile the backend

```bash
cd backend
./gradlew compileJava
cd ..
```

**Why**: Verifies all the new Java files compile correctly together — no typos, no missing imports, no circular dependencies. Expected: `BUILD SUCCESSFUL`.

---

### Step 47: Create the frontend API client

Create `frontend/src/services/api.ts`:

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err),
)

export default api
```

**Why**: Centralized Axios instance that all API calls use. Benefits:
- **`baseURL: '/api/v1'`** — Every call is relative to this. `api.get('/public/health')` calls `/api/v1/public/health`.
- **Response interceptor** — `res.data` unwraps Axios's response envelope. Without this, you'd get `{ data: { success: true, data: {...} }, status: 200, ... }`. With it, you get `{ success: true, data: {...} }` directly.
- **Single place for future auth** — Later, we'll add a request interceptor that attaches the JWT token to every request.

---

### Step 48: Create TypeScript health types

Create `frontend/src/types/health.ts`:

```typescript
export type NetworkTrust = 'LOCALHOST' | 'HOME' | 'REMOTE'

export interface ServiceStatus {
  postgres: string
  redis: string
  minio: string
  ollama: string
}

export interface HealthResponse {
  status: string
  services: ServiceStatus
  networkTrust: NetworkTrust
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  timestamp: string
}
```

**Why**: TypeScript interfaces that mirror the backend's Java DTOs. When the frontend calls the health endpoint, TypeScript knows exactly what shape the response will be — autocomplete works, and typos are caught at compile time instead of runtime.

---

### Step 49: Update Home.tsx with the health dashboard

Open `frontend/src/modules/Home.tsx` and **replace its entire contents** with:

```tsx
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Sparkles,
  Database,
  HardDrive,
  Brain,
  Wifi,
  Globe,
  Monitor,
  Server,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import api from '@/services/api'
import type { ApiResponse, HealthResponse, NetworkTrust } from '@/types/health'

const SERVICE_META: Record<string, { label: string; icon: typeof Database }> = {
  postgres: { label: 'PostgreSQL', icon: Database },
  redis: { label: 'Redis', icon: HardDrive },
  minio: { label: 'MinIO', icon: Server },
  ollama: { label: 'Ollama', icon: Brain },
}

const TRUST_META: Record<NetworkTrust, { label: string; icon: typeof Wifi; color: string; glow: string }> = {
  LOCALHOST: {
    label: 'Localhost',
    icon: Monitor,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    glow: 'shadow-violet-500/20',
  },
  HOME: {
    label: 'Home Network',
    icon: Wifi,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    glow: 'shadow-emerald-500/20',
  },
  REMOTE: {
    label: 'Remote',
    icon: Globe,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    glow: 'shadow-amber-500/20',
  },
}

export function Home() {
  const {
    data: health,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<HealthResponse>>({
    queryKey: ['health'],
    queryFn: () => api.get('/public/health'),
    refetchInterval: 30_000,
  })

  const response = health?.data

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25"
          >
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>

          <h1 className="font-heading mb-2 text-4xl font-bold tracking-tight text-white">
            Hello, Nexus
          </h1>
          <p className="text-slate-400">
            Your family operating system
          </p>
        </div>

        {/* Network Trust Badge */}
        {response && <TrustBadge trust={response.networkTrust} />}

        {/* Service Health Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Services
            </h2>
            <button
              onClick={() => refetch()}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          )}

          {isError && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-center text-sm text-rose-400">
              Backend unreachable
            </div>
          )}

          {response && (
            <div className="space-y-3">
              {Object.entries(response.services).map(([key, status], i) => {
                const meta = SERVICE_META[key]
                if (!meta) return null
                const Icon = meta.icon
                const isUp = status === 'UP'

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-300">{meta.label}</span>
                    </div>
                    {isUp ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-400" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Overall Status */}
          {response && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-4 flex items-center justify-center gap-2 pt-3 border-t border-white/[0.06]"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  response.status === 'UP'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span className="text-xs text-slate-500">
                {response.status === 'UP' ? 'all systems operational' : 'degraded'}
              </span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

function TrustBadge({ trust }: { trust: NetworkTrust }) {
  const meta = TRUST_META[trust]
  const Icon = meta.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="mb-6 flex justify-center"
    >
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-md ${meta.color} ${meta.glow}`}
      >
        <Icon className="h-4 w-4" />
        {meta.label}
      </div>
    </motion.div>
  )
}
```

**Why**: This replaces the simple "Hello, Nexus" page with a live health dashboard that:
- Calls `GET /api/v1/public/health` via React Query (auto-refetches every 30 seconds)
- Shows each service's status with icons (green check = UP, red X = DOWN)
- Shows the network trust badge (Localhost/Home/Remote with color coding)
- Shows overall status (UP = green pulse, DEGRADED = amber pulse)
- Has a manual refresh button
- Uses Framer Motion for staggered entrance animations
- Uses the glassmorphism design (semi-transparent cards, blur, subtle borders)

---

### Step 50: Rebuild the frontend

```bash
cd frontend
npm run build
cd ..
```

**Why**: Rebuilds the production bundle with the new health dashboard. This generates updated files in `frontend/dist/` that Nginx will serve.

---

## Verification

After completing all steps, you should be able to:

**1. Compile the backend:**
```bash
cd backend && ./gradlew compileJava && cd ..
```
Expected: `BUILD SUCCESSFUL`

**2. Build the frontend:**
```bash
cd frontend && npm run build && cd ..
```
Expected: `✓ built in ~2s`

**3. Check the file tree matches:**
```bash
find . -type f \
  -not -path './.git/*' \
  -not -path './frontend/node_modules/*' \
  -not -path './frontend/dist/*' \
  -not -path './backend/.gradle/*' \
  -not -path './backend/build/*' \
  -not -path './docs/*' \
  | sort
```

Expected files (excluding docs/):
```
./.cursorrules
./.gitignore
./LICENSE
./Makefile
./README.md
./backend/.gitattributes
./backend/.gitignore
./backend/Dockerfile
./backend/build.gradle.kts
./backend/gradle/wrapper/gradle-wrapper.jar
./backend/gradle/wrapper/gradle-wrapper.properties
./backend/gradlew
./backend/gradlew.bat
./backend/settings.gradle.kts
./backend/src/main/java/dev/nexus/NexusApplication.java
./backend/src/main/java/dev/nexus/atlas/package-info.java
./backend/src/main/java/dev/nexus/console/package-info.java
./backend/src/main/java/dev/nexus/core/health/HealthController.java
./backend/src/main/java/dev/nexus/core/health/HealthResponse.java
./backend/src/main/java/dev/nexus/core/health/ServiceHealthChecker.java
./backend/src/main/java/dev/nexus/core/package-info.java
./backend/src/main/java/dev/nexus/cortex/package-info.java
./backend/src/main/java/dev/nexus/docsense/package-info.java
./backend/src/main/java/dev/nexus/gallery/package-info.java
./backend/src/main/java/dev/nexus/ledger/package-info.java
./backend/src/main/java/dev/nexus/medpulse/package-info.java
./backend/src/main/java/dev/nexus/shared/config/AppConfig.java
./backend/src/main/java/dev/nexus/shared/config/NexusSecurityProperties.java
./backend/src/main/java/dev/nexus/shared/config/SecurityConfig.java
./backend/src/main/java/dev/nexus/shared/config/package-info.java
./backend/src/main/java/dev/nexus/shared/dto/ApiResponse.java
./backend/src/main/java/dev/nexus/shared/events/package-info.java
./backend/src/main/java/dev/nexus/shared/exception/GlobalExceptionHandler.java
./backend/src/main/java/dev/nexus/shared/security/NetworkSecurityFilter.java
./backend/src/main/java/dev/nexus/shared/security/NetworkTrust.java
./backend/src/main/java/dev/nexus/shared/security/NetworkUtils.java
./backend/src/main/java/dev/nexus/spaces/package-info.java
./backend/src/main/java/dev/nexus/thread/package-info.java
./backend/src/main/java/dev/nexus/timeline/package-info.java
./backend/src/main/java/dev/nexus/vault/package-info.java
./backend/src/main/resources/application.yml
./backend/src/test/java/dev/nexus/NexusApplicationTests.java
./cortex-service/Dockerfile
./cortex-service/main.py
./cortex-service/requirements.txt
./docker/.env.example
./docker/docker-compose.dev.yml
./docker/docker-compose.yml
./docker/grafana/provisioning/dashboards/dashboard.yml
./docker/grafana/provisioning/datasources/datasource.yml
./docker/nginx/nginx.conf
./docker/postgres/init.sql
./frontend/.gitignore
./frontend/README.md
./frontend/eslint.config.js
./frontend/index.html
./frontend/package-lock.json
./frontend/package.json
./frontend/public/vite.svg
./frontend/src/App.tsx
./frontend/src/components/shared/.gitkeep
./frontend/src/hooks/.gitkeep
./frontend/src/index.css
./frontend/src/main.tsx
./frontend/src/modules/Home.tsx
./frontend/src/services/api.ts
./frontend/src/store/.gitkeep
./frontend/src/theme/.gitkeep
./frontend/src/types/health.ts
./frontend/tsconfig.app.json
./frontend/tsconfig.json
./frontend/tsconfig.node.json
./frontend/vite.config.ts
./thread-service/Dockerfile
./thread-service/package.json
./thread-service/src/index.js
```

**4. To restore the completed Stage 1 at any time:**
```bash
git checkout stage-1-complete
```

---

## Summary of Steps

| # | What | Type | Phase |
|---|------|------|-------|
| 1 | curl Spring Initializr | Command | Backend |
| 2 | Unzip to backend/ | Command | Backend |
| 3 | Delete HELP.md | Command | Backend |
| 4 | Customize build.gradle.kts | File edit | Backend |
| 5 | Add Foojay to settings.gradle.kts | File edit | Backend |
| 6 | Replace application.properties with .yml | File create | Backend |
| 7 | Create 12 module + 2 shared packages | Dirs + files | Backend |
| 8 | Create ApiResponse.java | File create | Backend |
| 9 | Create GlobalExceptionHandler.java | File create | Backend |
| 10 | Create NetworkSecurityFilter.java (placeholder) | File create | Backend |
| 11 | ./gradlew compileJava | Command | Backend |
| 12 | npm create vite frontend | Command | Frontend |
| 13 | npm install | Command | Frontend |
| 14 | npm install (Nexus packages) | Command | Frontend |
| 15 | npm install react-router-dom@6 | Command | Frontend |
| 16 | Delete App.css + assets/ | Command | Frontend |
| 17 | Create folder structure + .gitkeep | Command | Frontend |
| 18 | Replace index.css (Tailwind design system) | File edit | Frontend |
| 19 | Replace vite.config.ts | File edit | Frontend |
| 20 | Replace tsconfig.app.json (path aliases) | File edit | Frontend |
| 21 | Replace App.tsx (router + query client) | File edit | Frontend |
| 22 | Verify main.tsx | File check | Frontend |
| 23 | Create Home.tsx (simple) | File create | Frontend |
| 24 | npm run build | Command | Frontend |
| 25 | Create docker/ dirs | Command | Docker |
| 26 | Create docker-compose.yml | File create | Docker |
| 27 | Create docker-compose.dev.yml | File create | Docker |
| 28 | Create .env.example | File create | Docker |
| 29 | Create nginx.conf | File create | Docker |
| 30 | Create postgres/init.sql | File create | Docker |
| 31 | Create Grafana provisioning | Files create | Docker |
| 32 | Create backend/Dockerfile | File create | Docker |
| 33 | Create cortex-service/ (3 files) | Files create | Docker |
| 34 | Create thread-service/ (3 files) | Files create | Docker |
| 35 | Create Makefile | File create | Docker |
| 36 | Update root .gitignore | File edit | Docker |
| 37 | Create NetworkTrust.java | File create | Health |
| 38 | Create NetworkUtils.java | File create | Health |
| 39 | Create NexusSecurityProperties.java | File create | Health |
| 40 | Create SecurityConfig.java | File create | Health |
| 41 | Create AppConfig.java | File create | Health |
| 42 | Create HealthResponse.java | File create | Health |
| 43 | Create ServiceHealthChecker.java | File create | Health |
| 44 | Create HealthController.java | File create | Health |
| 45 | Replace NetworkSecurityFilter.java (functional) | File edit | Health |
| 46 | ./gradlew compileJava | Command | Health |
| 47 | Create api.ts | File create | Health |
| 48 | Create health.ts types | File create | Health |
| 49 | Replace Home.tsx (health dashboard) | File edit | Health |
| 50 | npm run build | Command | Health |
