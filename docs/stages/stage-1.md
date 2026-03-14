# Stage 1 — Project Scaffold

> **Status**: Complete
> **Date**: March 12, 2026
> **What this stage does**: Creates the empty skeleton for the entire Nexus project — a Spring Boot backend, a React frontend, and the full Docker infrastructure (12 containers) — with all dependencies wired, folder structure laid out, and placeholder classes in place. Nothing "runs" yet as a full app, but every piece is ready for actual feature code to be written.

---

## Table of Contents

- [1.1 Backend Scaffold](#11-backend-scaffold)
  - [What does "scaffold" mean?](#what-does-scaffold-mean)
  - [What is this prompt for? How does it help the project?](#what-is-this-prompt-for-how-does-it-help-the-project)
  - [Prompt breakdown — what each word means](#prompt-breakdown--what-each-word-means)
  - [Technology deep-dives](#technology-deep-dives)
    - [Java 21](#java-21)
    - [Spring Boot 3.3](#spring-boot-33)
    - [Gradle Kotlin DSL](#gradle-kotlin-dsl)
    - [Spring Initializr — how the base was generated](#spring-initializr--how-the-base-was-generated)
  - [build.gradle.kts — The build file, line by line](#buildgradlekts--the-build-file-line-by-line)
    - [Plugins block](#plugins-block)
    - [Group and version](#group-and-version)
    - [Java toolchain](#java-toolchain)
    - [Configurations block](#configurations-block)
    - [Dependencies — every single one explained with Nexus use cases](#dependencies--every-single-one-explained-with-nexus-use-cases)
  - [settings.gradle.kts — Toolchain auto-provisioning](#settingsgradlekts--toolchain-auto-provisioning)
  - [application.yml — App configuration explained](#applicationyml--app-configuration-explained)
  - [NexusApplication.java — The entry point](#nexusapplicationjava--the-entry-point)
  - [Package structure — What each package is for](#package-structure--what-each-package-is-for)
  - [Shared classes — The three placeholders](#shared-classes--the-three-placeholders)
    - [ApiResponse\<T\>](#apiresponset)
    - [GlobalExceptionHandler](#globalexceptionhandler)
    - [NetworkSecurityFilter](#networksecurityfilter)
  - [Commands that were run (backend)](#commands-that-were-run-backend)
- [1.2 Frontend Scaffold](#12-frontend-scaffold)
  - [Vite — what it is and why not alternatives](#vite--what-it-is-and-why-not-alternatives)
  - [React 19 + TypeScript](#react-19--typescript)
  - [Commands that were run (frontend)](#commands-that-were-run-frontend)
  - [Dependencies — every package explained with Nexus use cases](#dependencies--every-package-explained-with-nexus-use-cases)
  - [Tailwind CSS v4 — Design system setup](#tailwind-css-v4--design-system-setup)
  - [vite.config.ts — Dev server, plugins, aliases, proxy](#viteconfigts--dev-server-plugins-aliases-proxy)
  - [tsconfig.app.json — TypeScript compiler config](#tsconfigappjson--typescript-compiler-config)
  - [App.tsx — Router and query client wiring](#apptsx--router-and-query-client-wiring)
  - [Home.tsx — The Hello Nexus page](#hometsx--the-hello-nexus-page)
  - [Folder structure — What goes where](#folder-structure--what-goes-where)
- [1.2 Docker Infrastructure](#12-docker-infrastructure)
  - [What was asked (1.2)](#what-was-asked-12)
  - [What is Docker and why does Nexus need it?](#what-is-docker-and-why-does-nexus-need-it)
  - [What is Docker Compose?](#what-is-docker-compose)
  - [The RAM budget — why mem_limit matters](#the-ram-budget--why-mem_limit-matters)
  - [docker-compose.yml — every service explained](#docker-composeyml--every-service-explained)
    - [1. PostgreSQL (pgvector)](#1-postgresql-pgvector)
    - [2. Redis](#2-redis)
    - [3. MinIO (Object Storage)](#3-minio-object-storage)
    - [4. Ollama (AI Model Runtime)](#4-ollama-ai-model-runtime)
    - [5. nexus-api (Spring Boot)](#5-nexus-api-spring-boot)
    - [6. cortex-service (Python FastAPI)](#6-cortex-service-python-fastapi)
    - [7. thread-service (Node.js)](#7-thread-service-nodejs)
    - [8. Grafana (Monitoring)](#8-grafana-monitoring)
    - [9. n8n (Automation — optional)](#9-n8n-automation--optional)
    - [10. WireGuard (VPN)](#10-wireguard-vpn)
    - [11. Nginx (Reverse Proxy)](#11-nginx-reverse-proxy)
    - [12. Cloudflared (Tunnel)](#12-cloudflared-tunnel)
  - [Nginx routing — how one URL reaches three backends](#nginx-routing--how-one-url-reaches-three-backends)
  - [.env.example — environment variables](#envexample--environment-variables)
  - [docker-compose.dev.yml — development overrides](#docker-composedevyml--development-overrides)
  - [Dockerfiles — how each service is containerized](#dockerfiles--how-each-service-is-containerized)
  - [postgres/init.sql — database initialization](#postgresinitsql--database-initialization)
  - [Makefile — shortcut commands](#makefile--shortcut-commands)
  - [Files created in 1.2](#files-created-in-12)
- [1.3 Health Endpoint + Network Detection](#13-health-endpoint--network-detection)
  - [What was asked (1.3)](#what-was-asked-13)
  - [What this prompt does and why it matters](#what-this-prompt-does-and-why-it-matters)
  - [NetworkTrust enum](#networktrust-enum)
  - [NetworkUtils — IP to trust tier](#networkutils--ip-to-trust-tier)
  - [NexusSecurityProperties — externalized config](#nexussecurityproperties--externalized-config)
  - [SecurityConfig — Spring Security filter chain](#securityconfig--spring-security-filter-chain)
  - [HealthController + ServiceHealthChecker](#healthcontroller--servicehealthchecker)
  - [NetworkSecurityFilter — now functional](#networksecurityfilter--now-functional)
  - [Frontend health dashboard](#frontend-health-dashboard)
  - [Hands-on verification steps](#hands-on-verification-steps)
  - [Files created/modified in 1.3](#files-createdmodified-in-13)
- [Post-scaffold fix: JDK 21 auto-provisioning](#post-scaffold-fix-jdk-21-auto-provisioning)
- [Final file tree](#final-file-tree)
- [How to run](#how-to-run)
- [Changelog](#changelog)

---

## 1.1 Backend Scaffold

### What does "scaffold" mean?

In construction, scaffolding is the temporary metal framework erected around a building before the actual walls go up. In software, **scaffolding** means exactly the same thing — you create the project's skeleton structure before writing any real business logic.

A scaffold gives you:

1. **Build system** — The machinery that compiles code, downloads libraries, runs tests, and produces a deployable artifact. For Nexus backend, this is Gradle.
2. **Dependency declarations** — A list of every library the project needs (Spring Boot, database driver, JWT library, etc.) pinned to specific versions so builds are reproducible.
3. **Folder structure** — Empty directories laid out according to the project's architecture. This is like the blueprint's room layout before any furniture goes in.
4. **Placeholder files** — Skeleton classes that define the patterns all future code will follow (how API responses look, how errors are handled, etc.).
5. **Configuration** — Database URLs, server ports, security settings — everything the app needs to know about its environment.

**Why scaffold first?** Because if you jump straight into writing features, you'll constantly stop to set up infrastructure. Scaffolding eliminates that friction — once it's done, every developer (or AI) can immediately start writing feature code inside the pre-built structure without worrying about "where does this file go?" or "how do I add a dependency?"

For Nexus specifically, this is critical because the project has **11 sub-projects** across 3 backend stacks. Getting the structure right at the start prevents chaos later.

### What is this prompt for? How does it help the project?

The prompt asks to create the **Spring Boot backend** portion of the scaffold. This is the heart of Nexus — 7 of the 11 modules run inside this single Spring Boot application (Core, DocSense, MedPulse, Ledger, Timeline, Vault, Gallery, Atlas, Console). The other 2 services (Cortex/Python and Thread/Node.js) are separate containers that communicate with this backend.

By creating this scaffold, we get:

- A **compilable Java project** that can start up (once databases are available)
- All **13 packages** carved out matching Nexus's architecture, so every future feature knows exactly where it lives
- The **3 shared foundation classes** (ApiResponse, GlobalExceptionHandler, NetworkSecurityFilter) that establish patterns every module will follow
- A **config file** pre-wired for PostgreSQL, Redis, JWT, and Nexus-specific settings
- All **17 dependencies** declared and version-locked, so we never hit "works on my machine" issues

Think of it like laying the foundation and framing the walls of a house. No rooms are finished yet, but you can walk through and see where the kitchen, bedrooms, and bathrooms will be.

### Prompt breakdown — what each word means

Let's dissect the original prompt piece by piece:

> **"Create Nexus project scaffold"**

Create the empty project structure for the Nexus application.

> **"BACKEND: Spring Boot 3.3, Java 21, Gradle Kotlin DSL"**

- **Spring Boot 3.3** — The framework version. Spring Boot is a Java framework for building web applications. Version 3.3 is a specific release line (we used 3.3.7, the latest patch).
- **Java 21** — The programming language version. Java 21 is an LTS (Long-Term Support) release with features like virtual threads, pattern matching, and record patterns.
- **Gradle Kotlin DSL** — The build tool (Gradle) using Kotlin syntax for its configuration files (`.kts` extension instead of `.gradle`).

> **"Group: dev.nexus"**

The Java package namespace. All code lives under `dev.nexus.*`. This follows the reverse-domain convention (if the project's domain were `nexus.dev`, the package would be `dev.nexus`).

> **"Deps: web, security, data-jpa, websocket, actuator, validation, postgresql, lombok, mapstruct, jjwt 0.12.x, data-redis"**

A shorthand list of libraries to include. Each of these is explained in detail in the [dependencies section](#dependencies--every-single-one-explained-with-nexus-use-cases).

> **"Packages under dev/nexus/: core/, cortex/, docsense/, ..."**

Create empty Java packages (directories) for each Nexus module. In Java, a package is both a directory on disk and a namespace in code.

> **"shared/ (config/, events/, dto/ApiResponse.java, exception/GlobalExceptionHandler.java, security/NetworkSecurityFilter.java placeholder)"**

The `shared/` package gets special treatment — it's not a Nexus module but a cross-cutting utility package. Three specific files are created as starting points (the rest are empty).

---

### Technology deep-dives

#### Java 21

**What is Java?** Java is a compiled, statically-typed, object-oriented programming language that runs on the JVM (Java Virtual Machine). Code is compiled to bytecode (`.class` files), which runs on any OS with a JVM installed. This is the "write once, run anywhere" promise.

**Why Java 21 specifically?** Java releases a new version every 6 months, but only some are LTS (Long-Term Support) — meaning they receive security patches for years. Java 21 (released September 2023) is an LTS release.

Key Java 21 features relevant to Nexus:

| Feature | What it is | Nexus use case |
|---|---|---|
| **Virtual Threads** (Project Loom) | Lightweight threads managed by the JVM, not the OS. You can create millions of them. | When Nexus handles 50+ simultaneous API calls (document uploads, chat message relays, etc.), virtual threads prevent thread pool exhaustion. Spring Boot 3.2+ can use them via a config flag. |
| **Record Patterns** | Decompose record types in `instanceof` checks and switch expressions. | Cleaner event handling: `if (event instanceof DocumentProcessedEvent(var doc, var type))` |
| **Pattern Matching for switch** | Use patterns in switch statements instead of chains of if-else. | Cleaner routing in ClassifyService: `switch(docType) { case "prescription" -> ... }` |
| **Sequenced Collections** | `SequencedCollection`, `SequencedMap` interfaces with `getFirst()`, `getLast()`. | Cleaner code when accessing first/last elements of lists (feed items, messages). |

**What is a JDK?** The Java Development Kit includes the compiler (`javac`), the runtime (`java`), and standard libraries. Your machine had JDK 8, 11, and 17 but not 21. Gradle's toolchain + Foojay plugin auto-downloaded JDK 21 for you.

#### Spring Boot 3.3

**What is Spring?** Spring is a Java framework that handles the plumbing of enterprise applications — dependency injection, web servers, database access, security, messaging, etc. Instead of writing hundreds of lines of boilerplate, you annotate a class and Spring wires everything together.

**What is Spring Boot?** Spring Boot is Spring's opinionated, auto-configured layer on top. It says: "if you add the `spring-boot-starter-web` library, I'll automatically set up an embedded Tomcat server, configure JSON serialization, and register your `@RestController` classes." Zero XML, zero manual configuration for the common case.

**How Spring Boot works in Nexus — a concrete example:**

Without Spring Boot, creating a REST endpoint would look like:
```java
// 1. Configure a servlet container (Tomcat) manually
// 2. Register a servlet mapping
// 3. Parse the HTTP request manually
// 4. Deserialize JSON manually
// 5. Call your business logic
// 6. Serialize the response manually
// 7. Handle errors manually
```

With Spring Boot:
```java
@RestController
@RequestMapping("/api/v1/medicines")
public class MedicineController {

    @GetMapping("/{id}")
    public ApiResponse<MedicineDto> getMedicine(@PathVariable Long id) {
        return ApiResponse.success(medicineService.findById(id));
    }
}
```

That's it. Spring Boot handles the server, JSON parsing, routing, and error handling.

**Why 3.3 specifically?**
- 3.3.x is the latest stable LTS-aligned line when Nexus was designed
- Requires Java 17+ (we use 21)
- Includes Spring Framework 6.1.x with support for virtual threads
- Works with Spring Security 6.3.x (latest auth features)
- Jakarta EE namespace (the `jakarta.*` packages, replacing the old `javax.*`)

**What's a "starter"?** Spring Boot uses "starters" — curated dependency bundles. Instead of adding 15 individual JARs for web functionality, you add one starter (`spring-boot-starter-web`) and it pulls in everything: Tomcat, Jackson, Spring MVC, etc.

#### Gradle Kotlin DSL

**What is Gradle?** Gradle is a build automation tool. Its job:

1. **Download dependencies** — Fetch JARs from Maven Central (a public repository of Java libraries)
2. **Compile code** — Run `javac` on your `.java` files
3. **Run annotation processors** — Execute Lombok, MapStruct during compilation
4. **Run tests** — Execute JUnit test classes
5. **Package** — Create a JAR or WAR file for deployment
6. **Custom tasks** — Anything else (Docker builds, code generation, etc.)

**What is "Kotlin DSL"?** Gradle's build files can be written in two languages:
- **Groovy DSL** — `build.gradle` (dynamic, no autocompletion)
- **Kotlin DSL** — `build.gradle.kts` (static typing, full IDE autocompletion)

We use Kotlin DSL because when you type `implementation(` in your IDE, it shows you exactly what methods are available and catches typos at write-time, not at build-time.

**Gradle vs Maven — why Gradle?**

| Aspect | Gradle | Maven |
|---|---|---|
| Config language | Kotlin/Groovy (programmable) | XML (static, verbose) |
| Build speed | Incremental + build cache | Full rebuild every time |
| Flexibility | Custom tasks are easy | Plugin-oriented, rigid |
| Multi-module | Native, elegant | Works but XML gets massive |
| Learning curve | Steeper | Simpler initially |

For Nexus with 11 sub-projects and eventual Docker integration, Gradle's programmability and speed win.

**What is the Gradle Wrapper?**

The wrapper (`gradlew` / `gradlew.bat`) is a shell script bundled with your project that:
1. Checks if the correct Gradle version is installed locally
2. If not, downloads it automatically to `~/.gradle/wrapper/dists/`
3. Runs the command using that exact version

This means every developer, CI server, and deployment pipeline uses **exactly the same Gradle version**, eliminating "works on my machine" issues.

```
backend/
├── gradlew              ← Bash script (Linux/macOS)
├── gradlew.bat          ← Batch script (Windows)
└── gradle/wrapper/
    ├── gradle-wrapper.jar         ← Tiny bootstrap JAR (~60KB)
    └── gradle-wrapper.properties  ← "Download Gradle 8.14.4 from this URL"
```

You never install Gradle globally. You always run `./gradlew <task>`.

#### Spring Initializr — how the base was generated

**What is Spring Initializr?** It's an official web service by Spring (https://start.spring.io) that generates starter project ZIP files. You select your options (Java version, Spring Boot version, dependencies) and it gives you a ready-to-use project.

**What command was run:**

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

**What this command does:**
- `curl -sL` — Download a file from a URL silently (`-s`) and follow redirects (`-L`)
- `-d type=gradle-project-kotlin` — "I want a Gradle project with Kotlin DSL"
- `-d javaVersion=21` — "Target Java 21"
- `-d bootVersion=3.5.0` — We had to use 3.5.0 because the Initializr no longer serves 3.3.x (it only offers currently supported versions). We then **manually changed** the version to 3.3.7 in `build.gradle.kts`.
- `-d dependencies=web,security,...` — Shorthand IDs for Spring Boot starters
- `-o /tmp/nexus-init.zip` — Save the ZIP to a temp file

**What it generated:**
```
├── build.gradle.kts            ← Build file (we then customized this heavily)
├── settings.gradle.kts         ← Project settings (we added the Foojay plugin)
├── gradlew + gradlew.bat       ← Gradle wrapper scripts (kept as-is)
├── gradle/wrapper/             ← Wrapper JAR + properties (kept as-is)
├── src/main/java/dev/nexus/
│   └── NexusApplication.java   ← Entry point (kept as-is)
├── src/main/resources/
│   └── application.properties  ← Empty config (we replaced with application.yml)
└── src/test/java/dev/nexus/
    └── NexusApplicationTests.java  ← Smoke test (kept as-is)
```

After unzipping, we customized everything: changed the Spring Boot version, added MapStruct + JJWT deps, replaced the properties file with YAML, and created all 13 packages with their placeholder files.

---

### build.gradle.kts — The build file, line by line

Location: `backend/build.gradle.kts`

This is the most important file in the backend. It defines what libraries the project uses, what Java version it targets, and how it builds.

#### Plugins block

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.3.7"
    id("io.spring.dependency-management") version "1.1.7"
}
```

**`java`** — A built-in Gradle plugin that tells Gradle "this is a Java project." It adds tasks like:
- `compileJava` — Compile `src/main/java/**` to `build/classes/`
- `test` — Run JUnit tests in `src/test/java/**`
- `jar` — Package compiled classes into a JAR file

**`org.springframework.boot` version "3.3.7"** — The Spring Boot Gradle plugin. What it adds:
- `bootRun` task — Starts the app directly from source (for development)
- `bootJar` task — Creates a **fat JAR** (a single JAR file containing your code + ALL dependencies, typically ~80MB). You can run it with just `java -jar nexus-0.0.1-SNAPSHOT.jar`.
- Configures the manifest so `java -jar` knows which class to start (`NexusApplication`)

Version 3.3.7 means Spring Boot 3.3, patch 7 (bug fixes, security patches). This dictates the versions of ALL Spring libraries in the project.

**`io.spring.dependency-management` version "1.1.7"** — This is Spring's BOM (Bill of Materials) importer. When Spring Boot 3.3.7 says "use Spring Security 6.3.x, Jackson 2.17.x, Hibernate 6.5.x," this plugin enforces those versions automatically. Without it, you'd have to manually specify the version of every transitive dependency and ensure they're compatible.

#### Group and version

```kotlin
group = "dev.nexus"
version = "0.0.1-SNAPSHOT"
```

**`group = "dev.nexus"`** — The Maven coordinate group ID. When the JAR is published (to a repository, Docker image, etc.), it's identified as `dev.nexus:nexus:0.0.1-SNAPSHOT`. The group also determines the base package in Java — all code lives under `dev.nexus.*`.

**`version = "0.0.1-SNAPSHOT"`** — `SNAPSHOT` is a Maven convention meaning "this is a development build, not a release." SNAPSHOT versions are never cached by dependency resolvers, so you always get the latest. When we release, this would become `1.0.0`.

#### Java toolchain

```kotlin
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}
```

This is a Gradle feature (introduced in Gradle 6.7) that decouples "the JDK you have installed" from "the JDK the project uses."

**Without toolchain:** You'd need to set `JAVA_HOME` to a JDK 21 installation. If your machine has JDK 17 as default, the build fails.

**With toolchain:** Gradle says "I need JDK 21" and:
1. Checks if any locally installed JDK matches
2. If not, the Foojay plugin (in `settings.gradle.kts`) downloads one automatically
3. Uses that JDK for compilation, testing, and running — regardless of your system `JAVA_HOME`

This is why you didn't need to install Java 21 manually.

#### Configurations block

```kotlin
configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}
```

**What are Gradle configurations?** They're buckets that categorize dependencies by when they're needed:
- `implementation` — Needed at compile time AND runtime. Bundled into the JAR.
- `compileOnly` — Needed at compile time only. NOT in the JAR.
- `runtimeOnly` — NOT at compile time. Only in the JAR.
- `annotationProcessor` — Runs during compilation to generate code.
- `testImplementation` — Only for test code.

**What does `extendsFrom` do here?** It makes the `compileOnly` configuration include everything from `annotationProcessor`. This means Lombok (declared as both `compileOnly` and `annotationProcessor`) is properly available during compilation to generate getters/setters, but its JAR isn't bundled into the production deployment.

#### Dependencies — every single one explained with Nexus use cases

```kotlin
val mapstructVersion = "1.6.3"
val jjwtVersion = "0.12.6"
```

Version variables at the top so MapStruct and JJWT versions are declared once and reused across multiple dependency lines.

---

**1. `spring-boot-starter-web`**

```kotlin
implementation("org.springframework.boot:spring-boot-starter-web")
```

**What it pulls in:** Embedded Apache Tomcat (web server), Spring MVC (routing framework), Jackson (JSON serializer/deserializer), Bean Validation integration.

**What it means:** This single line gives Nexus a fully functional HTTP server that starts on port 8080 and can serve REST API endpoints.

**Nexus use case — MedPulse medicine endpoint:**
```java
@RestController
@RequestMapping("/api/v1/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ApiResponse<List<MedicineDto>> getAll() {
        return ApiResponse.success(medicineService.findAll());
    }

    @PostMapping
    public ApiResponse<MedicineDto> create(@Valid @RequestBody CreateMedicineRequest req) {
        return ApiResponse.success("Medicine added", medicineService.create(req));
    }
}
```

When a request hits `GET /api/v1/medicines`:
1. Tomcat receives the HTTP request
2. Spring MVC routes it to `getAll()` based on the `@GetMapping` annotation
3. Jackson serializes the `ApiResponse<List<MedicineDto>>` to JSON
4. Tomcat sends the HTTP response

---

**2. `spring-boot-starter-security`**

```kotlin
implementation("org.springframework.boot:spring-boot-starter-security")
```

**What it pulls in:** Spring Security framework — authentication filters, authorization rules, CSRF protection, session management.

**What it means:** The moment this is on the classpath, **every endpoint is locked down by default** (returns 401 Unauthorized). You must explicitly configure which endpoints are public.

**Nexus use case — JWT authentication:**
```java
// SecurityConfig will be created in a later stage
@Bean
SecurityFilterChain filterChain(HttpSecurity http) {
    http
        .csrf(csrf -> csrf.disable())  // APIs use JWT, not cookies
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/v1/auth/**").permitAll()  // login/register are public
            .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
            .requestMatchers("/api/v1/vault/**").hasRole("FAMILY_MEMBER")
            .anyRequest().authenticated()
        );
    return http.build();
}
```

Nexus roles: `ADMIN`, `FAMILY_MEMBER`, `FRIEND`, `GUEST`. Security enforces which endpoints each role can access.

---

**3. `spring-boot-starter-data-jpa`**

```kotlin
implementation("org.springframework.boot:spring-boot-starter-data-jpa")
```

**What it pulls in:** Hibernate ORM (Object-Relational Mapper), Spring Data JPA (repository abstraction), HikariCP (connection pool).

**What is an ORM?** It maps Java objects to database tables. Instead of writing SQL, you define a class and Hibernate generates the SQL for you.

**What is Spring Data JPA?** An abstraction on top of Hibernate. You define an interface with method names, and Spring **auto-implements the SQL at runtime**.

**Nexus use case — Ledger expense repository:**
```java
@Entity
@Table(name = "expenses")
public class Expense {
    @Id @GeneratedValue(strategy = IDENTITY)
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDate date;

    @ManyToOne
    private User createdBy;
}

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByCreatedByAndDateBetween(User user, LocalDate from, LocalDate to);
    // Spring auto-generates: SELECT * FROM expenses WHERE created_by = ? AND date BETWEEN ? AND ?
}
```

You never write that SQL. The method name IS the query.

---

**4. `spring-boot-starter-websocket`**

```kotlin
implementation("org.springframework.boot:spring-boot-starter-websocket")
```

**What it pulls in:** Spring WebSocket support with STOMP protocol.

**What is WebSocket?** HTTP is request-response (client asks, server responds). WebSocket is a persistent, bi-directional connection — the server can push data to the client at any time without the client asking.

**What is STOMP?** A simple messaging protocol that runs over WebSocket. It adds topics (channels) that clients can subscribe to.

**Nexus use case — Timeline live sync:**
```java
// When someone creates a calendar event, push it to all connected clients
@Service
public class TimelineNotificationService {

    private final SimpMessagingTemplate messaging;

    public void notifyEventCreated(CalendarEvent event) {
        messaging.convertAndSendToUser(
            event.getSpace().getId().toString(),
            "/topic/calendar",
            event
        );
        // All family members viewing the calendar see the new event instantly
    }
}
```

This is different from Thread's chat WebSocket (which runs in Node.js via Socket.io). Spring's WebSocket handles Timeline sync, live notifications, and Vault status updates.

---

**5. `spring-boot-starter-actuator`**

```kotlin
implementation("org.springframework.boot:spring-boot-starter-actuator")
```

**What it pulls in:** Production-ready monitoring endpoints.

**What it means:** Adds endpoints like:
- `GET /actuator/health` — Is the app running? Is the database connected? Is Redis alive?
- `GET /actuator/metrics` — JVM memory usage, HTTP request counts, garbage collection stats
- `GET /actuator/info` — App version, build time, Git commit hash

**Nexus use case — Console/Grafana dashboards:**

The Console module includes embedded Grafana. Grafana scrapes these actuator endpoints to display real-time dashboards: memory usage, API response times, error rates. This is how the admin monitors the health of the entire Nexus system from their browser.

In `application.yml`, we only expose `health`, `info`, and `metrics` — not `shutdown` or `env` (which would be security risks).

---

**6. `spring-boot-starter-validation`**

```kotlin
implementation("org.springframework.boot:spring-boot-starter-validation")
```

**What it pulls in:** Jakarta Bean Validation (Hibernate Validator implementation).

**What it means:** You can annotate request DTOs with constraints, and Spring automatically validates incoming data before your code even runs.

**Nexus use case — User registration validation:**
```java
public class RegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}

// In controller:
@PostMapping("/register")
public ApiResponse<UserDto> register(@Valid @RequestBody RegisterRequest req) {
    // If validation fails, GlobalExceptionHandler catches MethodArgumentNotValidException
    // and returns: { "success": false, "message": "email: Invalid email format" }
    return ApiResponse.success(authService.register(req));
}
```

Without this, you'd write manual if-checks for every field in every endpoint.

---

**7. `spring-boot-starter-data-redis`**

```kotlin
implementation("org.springframework.boot:spring-boot-starter-data-redis")
```

**What it pulls in:** Lettuce Redis client, Spring Data Redis, connection pool.

**What is Redis?** An in-memory key-value store. It's like a super-fast HashMap that lives outside your app. Used for:
- **Caching** — Store frequently accessed data (user profiles, permissions) to avoid hitting PostgreSQL every time
- **Pub/Sub** — A messaging system where one service publishes a message to a channel, and all subscribers receive it
- **Socket.io adapter** — Thread (Node.js) uses Redis as the backend for Socket.io, allowing multiple Node.js instances to share WebSocket state

**Nexus use case — Cross-service communication:**

When a family member sends a chat message in Thread (Node.js), Thread publishes an event to Redis:
```
PUBLISH chat:activity {"type":"NEW_MESSAGE","userId":5,"channelId":12}
```

Spring Boot subscribes to this channel and creates a Feed entry:
```java
@Component
public class ChatActivityListener {
    @RedisSubscribe("chat:activity")
    public void onChatActivity(ChatActivityEvent event) {
        feedService.createEntry("New message in #general", event.getUserId());
    }
}
```

This is how the 3 backend stacks (Java, Python, Node.js) communicate without HTTP calls.

---

**8. `postgresql`**

```kotlin
runtimeOnly("org.postgresql:postgresql")
```

**What it is:** The JDBC (Java Database Connectivity) driver for PostgreSQL.

**Why `runtimeOnly`?** Your Java code never imports `org.postgresql.*` directly — it talks to the database through JPA/Hibernate abstractions. The driver is only needed when the app actually runs and connects to PostgreSQL.

**Nexus use case:** All three services (Spring Boot, Cortex, Thread) share the **same PostgreSQL database** but use different schemas:
- Spring Boot → `public` schema (users, medicines, expenses, events, etc.)
- Cortex → `cortex` schema (embeddings via pgvector)
- Thread → `chat` schema (channels, messages, reactions)

---

**9. `lombok`**

```kotlin
compileOnly("org.projectlombok:lombok")
annotationProcessor("org.projectlombok:lombok")
```

**What is Lombok?** A compile-time code generator. You annotate a class, and Lombok generates boilerplate code (getters, setters, constructors, builders, toString, equals, hashCode) during compilation.

**Why two lines?** `compileOnly` makes Lombok available for your code to reference its annotations. `annotationProcessor` tells the Java compiler to run Lombok's processor during compilation, which generates the actual code.

**Nexus use case — before and after Lombok:**

Without Lombok (traditional Java):
```java
public class User {
    private Long id;
    private String name;
    private String email;

    public User() {}
    public User(Long id, String name, String email) { this.id = id; this.name = name; this.email = email; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    // plus toString(), equals(), hashCode(), builder...
    // ~60 lines of boilerplate
}
```

With Lombok:
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long id;
    private String name;
    private String email;
}
// 7 lines. Same functionality. All getters/setters/builder generated at compile time.
```

This is used on virtually every class in Nexus (entities, DTOs, config objects).

---

**10. `mapstruct`**

```kotlin
implementation("org.mapstruct:mapstruct:$mapstructVersion")
annotationProcessor("org.mapstruct:mapstruct-processor:$mapstructVersion")
annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")
```

**What is MapStruct?** A compile-time code generator for mapping between Java objects. It generates type-safe, null-safe mapper implementations.

**Why do we need mapping?** In a well-designed app, you never expose your database entities directly to the frontend. You have:
- **Entity** — Database representation (`User` with password hash, internal IDs)
- **DTO** — What the API returns (`UserDto` without password hash, with formatted dates)
- **Request** — What the API receives (`CreateUserRequest` with just the fields needed)

MapStruct generates the conversion code between these.

**Why not manual mapping?** When you have 30+ entities with 10+ fields each, writing `dto.setName(entity.getName())` for every field is tedious, error-prone, and a maintenance nightmare.

**What is `lombok-mapstruct-binding`?** Lombok and MapStruct both run as annotation processors during compilation. Without this binding, MapStruct runs before Lombok and can't see the getters/setters Lombok would generate. The binding coordinates their execution order.

**Nexus use case — Medicine entity to DTO:**
```java
@Mapper(componentModel = "spring")
public interface MedicineMapper {
    MedicineDto toDto(Medicine entity);
    Medicine toEntity(CreateMedicineRequest request);
    // MapStruct generates these implementations at compile time
    // Matches fields by name: entity.getName() → dto.setName()
}
```

---

**11. `jjwt` (JSON Web Token library)**

```kotlin
implementation("io.jsonwebtoken:jjwt-api:$jjwtVersion")
runtimeOnly("io.jsonwebtoken:jjwt-impl:$jjwtVersion")
runtimeOnly("io.jsonwebtoken:jjwt-jackson:$jjwtVersion")
```

**What is a JWT?** A JSON Web Token is a compact, URL-safe token that contains a JSON payload (called "claims") signed with a secret key. It looks like: `eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMSJ9.xxxxx`

**How Nexus uses JWT:**
1. User logs in with email/password → Spring Boot verifies credentials
2. Spring Boot creates a JWT containing: `{ "sub": "user@nexus.dev", "roles": ["FAMILY_MEMBER"], "exp": 1741891200 }`
3. JWT is signed with the secret key from `application.yml`
4. Frontend stores the JWT in memory (NOT localStorage — per `.cursorrules`)
5. Every subsequent request includes the JWT in the `Authorization: Bearer <token>` header
6. Spring Boot validates the signature and extracts the user info — no database lookup needed
7. Thread (Node.js) and Cortex (Python) can also validate the **same JWT** because they share the same secret key

**Why 3 separate JARs?**
- `jjwt-api` — The interfaces you code against (`Jwts.builder()`, `Jwts.parser()`)
- `jjwt-impl` — The actual implementation (kept as `runtimeOnly` so your code depends on abstractions, not implementations)
- `jjwt-jackson` — Tells JJWT to use Jackson for JSON serialization (consistent with Spring Boot's JSON handling)

**Version 0.12.6** — The latest JJWT 0.12.x line. This version has a cleaner API than 0.11.x and fixes several security issues.

---

**12. Test dependencies**

```kotlin
testImplementation("org.springframework.boot:spring-boot-starter-test")
testImplementation("org.springframework.security:spring-security-test")
testRuntimeOnly("org.junit.platform:junit-platform-launcher")
```

- `starter-test` — JUnit 5 (test runner), Mockito (mocking framework), AssertJ (assertions), Spring Test (app context for integration tests). Only available in `src/test/`.
- `spring-security-test` — Lets you write tests with `@WithMockUser("admin")` to simulate authenticated users without real login flows.
- `junit-platform-launcher` — JUnit 5's discovery engine. Needed at test runtime for Gradle to find and run test classes.

---

### settings.gradle.kts — Toolchain auto-provisioning

Location: `backend/settings.gradle.kts`

```kotlin
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.9.0"
}

rootProject.name = "nexus"
```

**`foojay-resolver-convention`** — When Gradle's toolchain needs JDK 21 and can't find it on your machine, this plugin queries the [Foojay Disco API](https://github.com/foojayio/discoapi) — an index of every JDK distribution from every vendor (Temurin, Zulu, Oracle, GraalVM, etc.). It picks the best match for your OS and architecture, downloads it to `~/.gradle/jdks/`, and uses it. This download happens once and is cached.

**`rootProject.name = "nexus"`** — The Gradle project name. Used in:
- Task paths: `:compileJava`, `:bootRun`
- The generated JAR: `nexus-0.0.1-SNAPSHOT.jar`
- IDE project name

---

### application.yml — App configuration explained

Location: `backend/src/main/resources/application.yml`

**Why YAML instead of .properties?** Spring supports both. YAML is chosen because Nexus has nested configuration (subnets list, JPA properties, etc.) that would be verbose in `.properties` format:

```properties
# .properties style (verbose, repetitive)
spring.datasource.url=jdbc:postgresql://localhost:5432/nexus
spring.datasource.username=nexus
spring.jpa.hibernate.ddl-auto=update
nexus.security.home-subnets[0]=192.168.0.0/16
nexus.security.home-subnets[1]=10.66.66.0/24
```

```yaml
# YAML style (clean, hierarchical)
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/nexus
    username: nexus
  jpa:
    hibernate:
      ddl-auto: update
nexus:
  security:
    home-subnets:
      - 192.168.0.0/16
      - 10.66.66.0/24
```

**Section-by-section breakdown:**

**`spring.datasource`** — PostgreSQL connection. The `${DB_USERNAME:nexus}` syntax is Spring's property placeholder: it reads the `DB_USERNAME` environment variable; if not set, falls back to `nexus`. This pattern keeps secrets out of the codebase — in Docker, you'd pass `DB_PASSWORD` as an env var.

**`spring.jpa.hibernate.ddl-auto: update`** — Hibernate will automatically create tables if they don't exist and alter them if your `@Entity` classes change. Good for development. In production, you'd use `validate` (fail if schema doesn't match) plus Flyway/Liquibase for controlled migrations.

**`spring.jpa.open-in-view: false`** — Disables the "Open Session in View" anti-pattern. By default, Spring keeps the Hibernate session open during the entire HTTP request (including view rendering). This can cause lazy loading issues and hidden N+1 queries. Setting it to `false` forces proper service-layer data fetching.

**`spring.data.redis`** — Redis connection. Defaults to `localhost:6379`. In Docker, the `REDIS_HOST` env var would point to the Redis container.

**`server.port: 8080`** — The embedded Tomcat listens on port 8080. Nginx reverse-proxies `https://nexus.yourdomain.com/api/*` to `http://localhost:8080`.

**`management.endpoints`** — Only expose 3 actuator endpoints. By default, Actuator exposes many endpoints including `shutdown` (stop the app!) and `env` (show all environment variables including secrets). We restrict this to `health`, `info`, and `metrics`.

**`nexus.security`** — Custom Nexus configuration (not part of Spring Boot). These are read by our own `@ConfigurationProperties` classes:
- `jwt-secret` — The HMAC key used to sign JWTs. Must be a strong random string in production.
- `jwt-expiration-ms` — How long a JWT is valid. 86,400,000 ms = 24 hours.
- `home-subnets` — IP ranges that constitute "HOME" network: WiFi (`192.168.0.0/16`), WireGuard VPN (`10.66.66.0/24`), and localhost (`127.0.0.1/32`). The `NetworkSecurityFilter` will check incoming IPs against these to determine access tier.

---

### NexusApplication.java — The entry point

Location: `backend/src/main/java/dev/nexus/NexusApplication.java`

```java
package dev.nexus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class NexusApplication {
    public static void main(String[] args) {
        SpringApplication.run(NexusApplication.class, args);
    }
}
```

**`@SpringBootApplication`** — This single annotation is a shortcut for three annotations:

1. **`@Configuration`** — Marks this class as a source of bean definitions. Spring's IoC (Inversion of Control) container can read `@Bean` methods from this class.

2. **`@EnableAutoConfiguration`** — The magic of Spring Boot. It scans the classpath (all the JARs in your dependencies), sees what's available, and auto-configures them. For example:
   - Sees `spring-boot-starter-web` → starts Tomcat on port 8080
   - Sees `spring-boot-starter-data-jpa` + `postgresql` → creates a HikariCP connection pool to PostgreSQL
   - Sees `spring-boot-starter-security` → locks down all endpoints
   - Sees `spring-boot-starter-data-redis` → creates a Redis connection

3. **`@ComponentScan`** — Scans all packages starting from this class's package (`dev.nexus`) and registers any class annotated with `@Component`, `@Service`, `@Repository`, `@Controller`, `@Configuration`, etc. as a Spring bean.

**This is why package placement matters.** Because `NexusApplication` is in `dev.nexus`, it automatically scans `dev.nexus.core`, `dev.nexus.ledger`, `dev.nexus.shared.config`, etc. If a module were placed at `com.other.package`, it would NOT be scanned.

**`SpringApplication.run(...)`** — Bootstraps the entire application:
1. Creates the Spring application context (IoC container)
2. Runs all auto-configurations
3. Scans for components
4. Starts the embedded Tomcat server
5. Opens the database connection pool
6. Connects to Redis
7. Logs `Started NexusApplication in X seconds`

---

### Package structure — What each package is for

All packages live under `backend/src/main/java/dev/nexus/`:

| Package | What will go here | Nexus example |
|---|---|---|
| `core/` | Authentication, JWT token provider, user entity/repository, role management | `AuthController.java`, `JwtTokenProvider.java`, `User.java`, `UserRepository.java` |
| `cortex/` | REST wrapper for the Python AI engine. Spring Boot never calls Ollama directly. | `CortexClient.java` with methods like `ocr(file)`, `classify(text)`, `embed(text)` |
| `docsense/` | Document upload, OCR pipeline, classification, entity extraction. Fires Spring events. | `DocumentController.java`, `DocumentProcessingService.java`, `DocumentProcessedEvent.java` |
| `medpulse/` | Medicine tracking, reminders, adherence. Listens to DocSense events. | `Medicine.java`, `ReminderScheduler.java`, `MedicineController.java` |
| `ledger/` | Expenses, budgets, receipt scanning, friend group splits. | `Expense.java`, `Budget.java`, `ExpenseController.java`, `SplitCalculator.java` |
| `timeline/` | Calendar events, WebSocket sync, iCal import/export. | `CalendarEvent.java`, `TimelineWebSocketHandler.java`, `ICalService.java` |
| `thread/` | Java-side bridge for Node.js chat service. Redis pub/sub integration. | `ChatActivityListener.java`, `ChatEventPublisher.java` |
| `vault/` | Password entries, AES-256-GCM encryption, WiFi-only enforcement. | `VaultEntry.java`, `EncryptionService.java`, `VaultController.java` |
| `gallery/` | Photo metadata, MinIO presigned URLs, AI tags. | `Photo.java`, `GalleryController.java`, `PresignedUrlService.java` |
| `atlas/` | Semantic search, RAG pipeline, embedding queries via Cortex. | `SearchController.java`, `RagPipelineService.java`, `SearchResult.java` |
| `console/` | Admin panel, system health, user management. WiFi-only. | `AdminController.java`, `SystemHealthService.java` |
| `spaces/` | Family space, friend groups, membership management. | `Space.java`, `SpaceMembership.java`, `SpaceController.java` |
| `shared/config/` | Shared Spring `@Configuration` classes. | `SecurityConfig.java`, `RedisConfig.java`, `WebSocketConfig.java` |
| `shared/events/` | Spring Application Events for cross-module communication. | `DocumentProcessedEvent.java`, `MedicineCreatedEvent.java` |
| `shared/dto/` | Data Transfer Objects shared across modules. | `ApiResponse.java`, `PagedResponse.java` |
| `shared/exception/` | Centralized exception handling. | `GlobalExceptionHandler.java`, `ResourceNotFoundException.java` |
| `shared/security/` | Security filters and utilities. | `NetworkSecurityFilter.java`, `JwtAuthenticationFilter.java` |

**What is `package-info.java`?** A Java convention file that documents a package. It can hold package-level annotations and Javadoc. In our case, each has a simple Javadoc comment describing the module's purpose. It also serves a practical purpose: **Git doesn't track empty directories**, so without at least one file, these package directories wouldn't be committed.

---

### Shared classes — The three placeholders

These three files establish patterns that every module will follow. They're not "placeholder" in the sense of "delete later" — they're the foundation that grows with the project.

#### ApiResponse\<T\>

Location: `backend/src/main/java/dev/nexus/shared/dto/ApiResponse.java`

Every single endpoint in Nexus returns this wrapper. This is a project-wide convention from `.cursorrules`:

> ALL endpoints return `ApiResponse<T>`: `{success, message, data, timestamp}`

**The class explained:**

- `@Data` (Lombok) — Generates getters, setters, `toString()`, `equals()`, `hashCode()`
- `@Builder` (Lombok) — Generates a builder pattern: `ApiResponse.builder().success(true).data(user).build()`
- `@NoArgsConstructor` / `@AllArgsConstructor` (Lombok) — Generates empty and full constructors (needed by Jackson for JSON deserialization)
- `@JsonInclude(NON_NULL)` (Jackson) — When serializing to JSON, skip any field that's null. So a success response doesn't include `"message": null` clutter.

**The fields:**
- `success` (boolean) — `true` for 2xx responses, `false` for errors
- `message` (String) — Human-readable message, nullable (skipped if null)
- `data` (T, generic) — The actual payload. Can be any type: `User`, `List<Medicine>`, `Map`, etc.
- `timestamp` (Instant) — When the response was generated. `@Builder.Default` means it auto-sets to `Instant.now()` unless overridden.

**The static factory methods:**
```java
ApiResponse.success(data)              // { success: true, data: {...}, timestamp: "..." }
ApiResponse.success("Created", data)   // { success: true, message: "Created", data: {...}, timestamp: "..." }
ApiResponse.error("Bad email")         // { success: false, message: "Bad email", timestamp: "..." }
```

These keep controller code clean — instead of calling `builder()` every time, you use one-liners.

#### GlobalExceptionHandler

Location: `backend/src/main/java/dev/nexus/shared/exception/GlobalExceptionHandler.java`

**What is `@RestControllerAdvice`?** It's a Spring annotation that makes this class a global exception handler for ALL controllers. When any controller throws an unhandled exception, Spring routes it here instead of returning a raw 500 error with a stack trace.

**Why centralized error handling matters:** Without this, every controller would need try/catch blocks, and errors would have inconsistent formats. With this, all errors flow through one place and always return a proper `ApiResponse`.

**Each handler explained:**

| Handler | Exception | HTTP Status | When it fires |
|---|---|---|---|
| `handleNotFound` | `EntityNotFoundException` | 404 | `expenseRepository.findById(999)` returns empty → service throws | 
| `handleAccessDenied` | `AccessDeniedException` | 403 | User with `FRIEND` role tries to access `/api/v1/vault/**` |
| `handleValidation` | `MethodArgumentNotValidException` | 400 | `@Valid` catches missing/invalid fields in request body |
| `handleBadRequest` | `IllegalArgumentException` | 400 | Business logic rejects input (e.g., negative expense amount) |
| `handleException` | `Exception` (catch-all) | 500 | Anything unexpected (null pointer, connection timeout, etc.) |

The catch-all handler returns a generic message (`"An unexpected error occurred"`) instead of exposing the real exception — which could contain internal details (SQL queries, file paths, etc.) that attackers shouldn't see.

#### NetworkSecurityFilter

Location: `backend/src/main/java/dev/nexus/shared/security/NetworkSecurityFilter.java`

**What is `OncePerRequestFilter`?** A Spring base class that guarantees the filter runs exactly once per HTTP request (even if the request is forwarded internally). Every HTTP request passes through this filter before reaching a controller.

**What are the HOME_ONLY_PATHS?** `/api/v1/vault` (password vault) and `/api/v1/admin` (console). These are too sensitive for remote access — they should only be accessible from the home WiFi or VPN.

**What will the implementation look like (not built yet):**
1. Get the client IP from the request (checking `X-Forwarded-For` for proxied requests via Nginx/Cloudflare)
2. Check if the requested path starts with any HOME_ONLY_PATH
3. If yes, check if the client IP falls within any of the `nexus.security.home-subnets` CIDRs
4. If not in a home subnet → return 403 Forbidden
5. If in a home subnet, or the path isn't restricted → continue the filter chain

Currently it's a pass-through that lets everything through. The actual IP checking will be implemented when we build the Core auth system.

---

### Commands that were run (backend)

Every command below was executed during the scaffold creation:

**1. Generate the base project from Spring Initializr**
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
- Downloads a ZIP from Spring's official project generator
- We used `bootVersion=3.5.0` because the Initializr no longer serves 3.3.x (minimum is 3.5.0 as of March 2026)
- The version was manually changed to 3.3.7 after unzipping

**2. Unzip into the backend directory**
```bash
mkdir -p backend
unzip -o /tmp/nexus-init.zip -d backend/
```
- Creates the `backend/` directory
- Extracts the generated project (Gradle wrapper, build files, source skeleton)

**3. Customize build.gradle.kts**
- Changed Spring Boot version from `3.5.0` → `3.3.7`
- Added MapStruct dependency (1.6.3) + annotation processor
- Added JJWT dependency (0.12.6) — api, impl, jackson
- Added `lombok-mapstruct-binding` (0.2.0) annotation processor

**4. Replace application.properties with application.yml**
- Deleted the empty `application.properties`
- Created `application.yml` with PostgreSQL, Redis, JWT, actuator, and home-subnet config

**5. Create all package-info.java files**
- Created 14 files: one in each of the 12 module packages + 2 in shared sub-packages
- Each contains a Javadoc comment documenting the package's purpose

**6. Create the three shared classes**
- `ApiResponse.java` — Unified response envelope
- `GlobalExceptionHandler.java` — Centralized exception handling
- `NetworkSecurityFilter.java` — Network trust tier stub

**7. Deleted the generated HELP.md** (Spring Initializr boilerplate, not useful)

**8. Compile to verify everything works**
```bash
cd backend
./gradlew compileJava
```
- First run: downloaded Gradle 8.14.4, auto-provisioned JDK 21 via Foojay, downloaded all dependencies from Maven Central
- Result: `BUILD SUCCESSFUL in 31s` — all Java files compiled with zero errors

---

## 1.2 Frontend Scaffold

### Vite — what it is and why not alternatives

**What is a frontend build tool?** Browsers understand HTML, CSS, and JavaScript. But modern frontend development uses TypeScript (not JS), JSX (not HTML), and Tailwind (not raw CSS). A build tool transforms your source code into browser-ready files.

**What is Vite?** (pronounced "veet", French for "fast") A frontend build tool created by Evan You (creator of Vue.js). It does two things:

1. **Dev server** — Serves files during development with instant hot reload. When you change a component, the browser updates in <100ms without a full page refresh.
2. **Production bundler** — Bundles all your code into optimized, minified files for deployment.

**Why Vite over alternatives?**

| Tool | Status | Why not for Nexus |
|---|---|---|
| Create React App (CRA) | Deprecated | Officially deprecated in 2023. No longer maintained. |
| Next.js | Active | Designed for server-side rendering. Nexus serves static files from Nginx — no SSR needed. Next.js would add unnecessary complexity and a Node.js runtime in production. |
| Webpack | Active | Works but slow. Vite's dev server is 10-100x faster because it uses native ESM instead of bundling. |
| Parcel | Active | Good but less ecosystem support and plugin availability than Vite. |

**How Vite's dev server works differently:**
- **Webpack/CRA**: Bundles ALL files into one big JavaScript file, then serves it. Slow startup, slow rebuilds.
- **Vite**: Serves each file individually as an ES module. The browser requests what it needs. Only the changed file is re-processed on save. Startup is nearly instant regardless of project size.

### React 19 + TypeScript

**React 19** was installed (latest stable as of March 2026). The prompt said "React 18+" — React 19 satisfies this. React 19 brings server components, use() hook, and improved Suspense — but for Nexus's client-side SPA, the main benefit is the latest performance optimizations and bug fixes.

**TypeScript 5.9** was installed. TypeScript adds static types to JavaScript — catching bugs at compile time instead of runtime. With strict mode enabled, you can't accidentally pass `null` where a string is expected, or call a function with missing arguments.

### Commands that were run (frontend)

**1. Scaffold the React + TypeScript project**
```bash
npm create vite@latest frontend -- --template react-ts
```
- `npm create vite@latest` — Runs the `create-vite` package (Vite's project generator)
- `frontend` — The directory name to create
- `--template react-ts` — Use the React + TypeScript template

**What this generated:**
```
frontend/
├── package.json          ← Dependency list + scripts
├── vite.config.ts        ← Vite configuration
├── tsconfig.json         ← TypeScript project references
├── tsconfig.app.json     ← TypeScript compiler options for app code
├── tsconfig.node.json    ← TypeScript compiler options for Vite config
├── index.html            ← The single HTML page (SPA entry point)
├── eslint.config.js      ← Linter configuration
├── src/
│   ├── App.tsx           ← Root React component (we replaced this)
│   ├── App.css           ← Default styles (we deleted this)
│   ├── main.tsx          ← ReactDOM entry point (we customized this)
│   ├── index.css         ← Global styles (we replaced with Tailwind setup)
│   └── assets/           ← Static assets (we deleted this)
```

**2. Install base dependencies**
```bash
cd frontend
npm install
```
- Downloads React, ReactDOM, TypeScript, Vite, ESLint, and their dependencies
- Creates `node_modules/` (~227 packages)
- Creates `package-lock.json` (locks exact versions for reproducible builds)

**3. Install Nexus-specific dependencies**
```bash
npm install tailwindcss @tailwindcss/vite @tanstack/react-query zustand axios react-router-dom framer-motion lucide-react date-fns
```
- Adds 70 packages to `node_modules/`
- Updates `package.json` with the new dependencies
- This installed `react-router-dom` v7 by default (latest)

**4. Downgrade react-router-dom to v6**
```bash
npm install react-router-dom@6
```
- The prompt specifically asked for v6. React Router v7 is a major rewrite based on Remix with different patterns (loaders, actions, file-based routing). v6 uses the traditional `<Routes>/<Route>` pattern that's simpler and well-understood.

**5. Clean up defaults**
- Deleted `src/App.css` (we use Tailwind, not CSS files)
- Deleted `src/assets/` directory (contained default Vite/React logos)

**6. Create folder structure**
- Created `src/components/shared/`, `src/hooks/`, `src/services/`, `src/store/`, `src/theme/`, `src/types/`, `src/modules/`
- Each has a `.gitkeep` file (empty file that makes Git track the directory)

**7. Verify the build**
```bash
npm run build
```
- Runs TypeScript compiler (`tsc -b`) to check for type errors
- Runs Vite's production bundler (`vite build`)
- Output: `dist/` directory with optimized HTML/CSS/JS
- Result: `✓ built in 1.73s` — zero errors

---

### Dependencies — every package explained with Nexus use cases

**1. Tailwind CSS (v4.2.1) + @tailwindcss/vite**

**What is Tailwind?** A utility-first CSS framework. Instead of writing CSS in separate files, you compose styles directly in JSX using pre-built class names.

**Traditional CSS approach:**
```css
/* styles.css */
.card {
  display: flex;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
}
```
```jsx
<div className="card">...</div>
```

**Tailwind approach:**
```jsx
<div className="flex p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">...</div>
```

No separate CSS file. The styles are colocated with the component. When you delete the component, the styles are automatically gone — no orphaned CSS.

**Why v4?** Tailwind v4 (released 2025) is a ground-up rewrite:
- **No config file** — Theme is defined in CSS using `@theme {}`, not `tailwind.config.js`
- **CSS-native** — Uses CSS custom properties under the hood (better performance)
- **Smaller output** — More aggressive tree-shaking

**Nexus use case — glassmorphism card:**
```jsx
<div className="rounded-xl bg-surface border border-border backdrop-blur-md p-6 shadow-lg shadow-accent/10">
  <h2 className="font-heading text-xl text-white">Recent Expenses</h2>
  {/* ... */}
</div>
```

**`@tailwindcss/vite`** is the Vite plugin that makes Tailwind work with Vite's build system. It scans your JSX files for class names and generates only the CSS you actually use.

---

**2. @tanstack/react-query (v5.90.x)**

**What problem does it solve?** Fetching data from APIs in React is painful with raw hooks:

```jsx
// Without React Query — you manage everything manually
function Expenses() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/v1/expenses')
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error) return <Error />
  return <ExpenseList data={data} />
}
```

With React Query:
```jsx
function Expenses() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => axios.get('/api/v1/expenses').then(r => r.data),
  })

  if (isLoading) return <Spinner />
  if (error) return <Error />
  return <ExpenseList data={data} />
}
```

But the real power is what happens behind the scenes:
- **Caching** — If another component also requests `['expenses']`, it returns the cached data instantly (no duplicate API calls)
- **Background refetching** — When you revisit a page, it shows the cached data immediately and refreshes in the background
- **Stale-while-revalidate** — Data is served from cache while a fresh copy is being fetched
- **Automatic retries** — Failed requests are retried (we configured 1 retry)
- **Optimistic updates** — UI updates immediately before the server confirms (useful for chat, todos)

**Nexus use case — MedPulse medicine list with mutation:**
```jsx
function useMedicines() {
  return useQuery({
    queryKey: ['medicines'],
    queryFn: () => api.get('/api/v1/medicines'),
  })
}

function useAddMedicine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (med) => api.post('/api/v1/medicines', med),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medicines'] }),
    // After adding a medicine, refetch the list automatically
  })
}
```

---

**3. Zustand (v5.0.x)**

**What is it?** A lightweight state management library for React. Think of it as "Redux but 10x simpler."

**React Query vs Zustand — what goes where?**
- **React Query** = **server state** (data that lives on the backend: users, expenses, messages)
- **Zustand** = **client state** (data that only lives in the browser: sidebar open/closed, dark mode, active tab)

**Why not Redux?** Redux requires actions, reducers, action creators, middleware, selectors — hundreds of lines of boilerplate for simple state. Zustand is a single function call.

**Nexus use case — sidebar and theme state:**
```jsx
// store/useSidebarStore.ts
const useSidebarStore = create((set) => ({
  isOpen: true,
  activeSpace: 'family',
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setSpace: (space) => set({ activeSpace: space }),
}))

// In any component:
function Sidebar() {
  const { isOpen, toggle, activeSpace } = useSidebarStore()
  // ...
}
```

No providers, no context, no boilerplate. Just define the store and use it.

---

**4. Axios (v1.13.x)**

**What is it?** An HTTP client for making API calls. It's like `fetch()` but with more features.

**Why not native fetch()?** Axios provides:
- **Interceptors** — Run code before every request (add JWT token) or after every response (handle 401 redirects)
- **Automatic JSON** — No need to call `.json()` on responses
- **Request cancellation** — Cancel in-flight requests when components unmount
- **Error handling** — Rejects on non-2xx status codes (fetch doesn't)

**Nexus use case — API client with JWT injection:**
```jsx
// services/api.ts
const api = axios.create({ baseURL: '/api/v1' })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token  // JWT from memory (not localStorage!)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()  // Token expired, redirect to login
    }
    return Promise.reject(err)
  }
)
```

Every API call automatically includes the JWT. Every 401 response automatically triggers logout. You write this once and never think about it again.

---

**5. React Router DOM v6 (v6.30.x)**

**What is client-side routing?** In a traditional website, clicking a link causes a full page reload from the server. In a SPA (Single Page Application), the router intercepts link clicks, updates the URL, and swaps the visible component — without a page reload. The browser stays on the same HTML page.

**Why v6 specifically (not v7)?** React Router v7 merged with Remix and introduces file-based routing, loaders, and actions — patterns designed for server-rendered apps. Nexus is a client-side SPA served from Nginx, so the simpler v6 patterns are a better fit.

**Nexus use case — module routing:**
```jsx
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/medicines" element={<MedPulse />} />
  <Route path="/expenses" element={<Ledger />} />
  <Route path="/calendar" element={<Timeline />} />
  <Route path="/chat" element={<Thread />} />
  <Route path="/vault" element={<Vault />} />
  <Route path="/search" element={<Atlas />} />
  <Route path="/gallery" element={<Gallery />} />
  <Route path="/admin" element={<Console />} />
</Routes>
```

---

**6. Framer Motion (v12.35.x)**

**What is it?** A React animation library. It lets you animate components declaratively — describe the start state and end state, and Framer Motion handles the interpolation.

**Why animations matter for Nexus:** The design direction is "dark glassmorphism" — a premium, polished look. Without animations, the UI feels static and cheap. With subtle fade-ins, slide transitions, and spring physics, it feels alive.

**Nexus use case — page transition:**
```jsx
<motion.div
  initial={{ opacity: 0, x: -20 }}   // Start: invisible, shifted left
  animate={{ opacity: 1, x: 0 }}      // End: fully visible, in position
  exit={{ opacity: 0, x: 20 }}        // When leaving: fade out, shift right
  transition={{ duration: 0.3 }}
>
  <ExpenseList />
</motion.div>
```

**Use case — modal appearing:**
```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: "spring", stiffness: 300, damping: 25 }}
  className="rounded-2xl bg-surface border border-border backdrop-blur-xl p-6"
>
  <h2>Add Expense</h2>
  {/* ... */}
</motion.div>
```

---

**7. Lucide React (v0.577.x)**

**What is it?** An icon library — a collection of 1,500+ clean, consistent SVG icons. It's a community fork of Feather Icons with more icons and active maintenance.

**Why not Font Awesome?** Font Awesome bundles all icons into a large font file. Lucide is **tree-shakeable** — you import only the icons you use, and the bundler strips everything else. A single icon is ~1KB instead of the ~300KB Font Awesome bundle.

**Nexus use case:**
```jsx
import { Home, Pill, Receipt, Calendar, MessageCircle, Shield, Image, Search, Settings } from 'lucide-react'

// Sidebar navigation
<NavItem icon={<Pill />} label="MedPulse" to="/medicines" />
<NavItem icon={<Receipt />} label="Ledger" to="/expenses" />
<NavItem icon={<Calendar />} label="Timeline" to="/calendar" />
```

---

**8. date-fns (v4.1.x)**

**What is it?** A collection of 200+ date utility functions. Each function is standalone and tree-shakeable.

**Why not Moment.js?** Moment.js is 330KB, not tree-shakeable (you import the entire library even if you use one function), and officially in maintenance mode (no new features).

**date-fns vs native Date:** JavaScript's built-in `Date` is notoriously bad — no formatting, no parsing, no relative time, no timezone support. date-fns fills these gaps.

**Nexus use case — Timeline and MedPulse:**
```jsx
import { format, formatDistanceToNow, isToday, addDays } from 'date-fns'

format(event.date, 'MMM d, yyyy')          // "Mar 12, 2026"
formatDistanceToNow(message.createdAt)      // "5 minutes ago"
isToday(reminder.date)                       // true/false
addDays(prescription.startDate, 30)          // 30 days from start
```

---

### Tailwind CSS v4 — Design system setup

Location: `frontend/src/index.css`

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
```

**`@import "tailwindcss"`** — In Tailwind v4, this single import loads the entire framework. In v3, you needed three directives (`@tailwind base; @tailwind components; @tailwind utilities;`).

**`@theme { ... }`** — This is Tailwind v4's way of defining design tokens. In v3, you'd use a JavaScript config file (`tailwind.config.js`). In v4, everything is CSS-native.

Each variable becomes a usable Tailwind class:
- `--font-sans` → `font-sans` class
- `--font-heading` → `font-heading` class
- `--color-background` → `bg-background`, `text-background` classes
- `--color-accent` → `bg-accent`, `text-accent`, `border-accent` classes
- `--color-danger` → `bg-danger`, `text-danger` classes

**The Nexus design system colors from `.cursorrules`:**
- **Background** `#07080d` — Near-black with a subtle blue tint. This is the base of the dark glassmorphism look.
- **Surface** `rgba(255,255,255,0.03)` — Barely-visible white overlay. When layered on the background with `backdrop-blur`, it creates the glass effect.
- **Accent** `#6366f1` — Indigo. Used for buttons, links, active states, glow effects.
- **Success/Warning/Danger** — Emerald/Amber/Rose. Standard semantic colors for status indicators.

**The body styles:**
```css
body {
  background-color: var(--color-background);
  color: #e2e8f0;           /* Slate-200 — light gray text on dark background */
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;      /* Smoother font rendering on macOS */
  -moz-osx-font-smoothing: grayscale;       /* Smoother font rendering on Firefox */
}
```

---

### vite.config.ts — Dev server, plugins, aliases, proxy

Location: `frontend/vite.config.ts`

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

**`plugins: [react(), tailwindcss()]`**
- `react()` — Enables JSX transformation (converting `<Component />` to `React.createElement(...)`) and Fast Refresh (hot reload that preserves component state)
- `tailwindcss()` — Scans all source files for Tailwind class names and generates the corresponding CSS

**`resolve.alias`**
Maps `@` to the `src/` directory. This means:
```typescript
// Without alias (fragile, changes if file moves):
import { Button } from '../../../components/shared/Button'

// With alias (always works from any depth):
import { Button } from '@/components/shared/Button'
```

**`server.port: 5173`** — Vite's dev server runs on port 5173 during development.

**`server.proxy`** — The critical piece for frontend-backend communication during development:

When the frontend (running on `localhost:5173`) makes an API call to `/api/v1/medicines`, the browser would normally send it to `localhost:5173/api/...` (same origin). Vite's proxy intercepts this and forwards it to `localhost:8080/api/...` (Spring Boot).

Without this proxy, the browser would block the request due to **CORS** (Cross-Origin Resource Sharing) — a security policy that prevents `localhost:5173` from calling `localhost:8080`.

In production, this proxy isn't needed because Nginx serves both the frontend and proxies API calls from the same domain.

---

### tsconfig.app.json — TypeScript compiler config

Location: `frontend/tsconfig.app.json`

Key settings:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

- **`target: "ES2022"`** — Compile TypeScript to ES2022 JavaScript. Modern browsers support ES2022, so no downleveling needed.
- **`strict: true`** — Enables all strict type-checking options. Catches more bugs at compile time.
- **`baseUrl` + `paths`** — Mirrors the `@` alias from `vite.config.ts`. Vite uses its alias for bundling; TypeScript uses this for type-checking. Both must agree.

---

### App.tsx — Router and query client wiring

Location: `frontend/src/App.tsx`

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})
```

**`QueryClient`** is the central cache for React Query. All API data lives here.

- `staleTime: 5 * 60 * 1000` (5 minutes) — After fetching data, it's considered "fresh" for 5 minutes. During this window, if another component requests the same data, React Query returns the cached version without hitting the API. After 5 minutes, the data is "stale" and will be refetched on next access.
- `retry: 1` — If an API call fails (network error, 500, etc.), retry once before showing an error. Default is 3, but on a home server with limited RAM, we don't want to hammer a struggling backend.

```tsx
<QueryClientProvider client={queryClient}>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  </BrowserRouter>
</QueryClientProvider>
```

**Provider nesting order matters:**
1. `QueryClientProvider` (outermost) — Makes the cache available to everything inside
2. `BrowserRouter` — Enables routing for everything inside
3. `Routes`/`Route` — Maps URL paths to components

Currently there's only one route (`/` → `Home`). As we build modules, more routes will be added.

---

### Home.tsx — The Hello Nexus page

Location: `frontend/src/modules/Home.tsx`

This is a "smoke test" page — its sole purpose is to confirm that the scaffold works: React renders, Tailwind styles apply, Framer Motion animates, Lucide icons display.

**What it renders:**
1. A centered, vertically-and-horizontally aligned container (`flex min-h-screen items-center justify-center`)
2. An animated icon box — indigo-to-violet gradient with a glow shadow, bounces in with a spring animation
3. "Hello, Nexus" heading using the `font-heading` class (Plus Jakarta Sans)
4. A subtitle in muted gray
5. A status pill with a pulsing green dot ("scaffold ready")

**Framer Motion animations used:**
- `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}` — Fade in and slide up
- `initial={{ scale: 0 }}` → `animate={{ scale: 1 }}` with `type: "spring"` — Scale in with spring physics (overshoot and settle)
- `transition={{ delay: 0.8 }}` — The status pill fades in last, after the main content

This page will be replaced with the real Nexus dashboard in later stages.

---

### Folder structure — What goes where

```
frontend/src/
├── components/shared/   ← Reusable UI atoms/molecules (Button, Modal, Card, Input)
├── modules/             ← Page-level components, one per route (Home, Dashboard, etc.)
├── hooks/               ← Custom React hooks (useAuth, useDebounce, useMediaQuery)
├── services/            ← API service layer (axios instances, endpoint functions)
├── store/               ← Zustand stores (useThemeStore, useSidebarStore)
├── theme/               ← Theme tokens, dark/light mode logic
├── types/               ← Shared TypeScript type definitions
├── App.tsx              ← Root component with router + providers
├── main.tsx             ← ReactDOM entry point
└── index.css            ← Tailwind imports + design system tokens
```

**Why this structure?**

- **`components/shared/`** — Reusable across all modules. A `<Button>` component used by MedPulse, Ledger, and Timeline lives here. Module-specific components (like `<MedicineCard>`) would live inside their module folder.
- **`modules/`** — One file (or folder) per page/route. Keeps top-level pages easy to find.
- **`hooks/`** — Custom hooks that encapsulate reusable logic (e.g., `useDebounce` for search input, `useAuth` for authentication state).
- **`services/`** — The API layer. Contains the axios instance and endpoint functions. Components never call `axios` directly — they call `medicineService.getAll()`.
- **`store/`** — Zustand stores for client-side state. Not server data (that's React Query).
- **`theme/`** — Theme-related logic beyond what's in CSS (e.g., dark/light mode toggle, design token exports for use in JS).
- **`types/`** — Shared TypeScript interfaces/types (`User`, `Medicine`, `Expense`, etc.) used across multiple modules.

Each folder has a `.gitkeep` file because Git doesn't track empty directories. These will be deleted once real files are added.

---

## 1.2 Docker Infrastructure

### What was asked (1.2)

> docker-compose.yml in docker/: IMPORTANT: Add mem_limit to EVERY container. We have 8GB RAM (~4GB for Docker). 12 containers: postgres, redis, minio, ollama, nexus-api, cortex-service, thread-service, grafana, n8n, wireguard, nginx, cloudflared. .env.example + docker-compose.dev.yml + Makefile (up/down/logs/fresh).

### What is Docker and why does Nexus need it?

**Docker** is a tool that packages software into **containers** — isolated, lightweight environments that include everything needed to run an application: code, runtime, libraries, and OS-level dependencies. Think of a container as a tiny virtual machine, except it shares the host's OS kernel (making it much faster and lighter than a real VM).

**Why Nexus needs Docker:**

Nexus runs **3 different programming languages** (Java, Python, Node.js), **2 databases** (PostgreSQL, Redis), **1 object store** (MinIO), **1 AI runtime** (Ollama), **1 web server** (Nginx), **1 monitoring tool** (Grafana), and optional extras (n8n, WireGuard, Cloudflare Tunnel). Installing all of these directly on a Windows machine would be a nightmare — version conflicts, PATH issues, startup order problems, cleanup difficulties.

With Docker:
- Each tool runs in its own isolated container
- `docker compose up` starts everything with one command
- `docker compose down -v` tears everything down cleanly
- The exact same setup works on any machine (dev laptop, production server)
- Version pinning means "PostgreSQL 16" always means PostgreSQL 16, not whatever the OS package manager gives you

**Key Docker concepts used in Nexus:**

| Concept | What it means | Nexus example |
|---|---|---|
| **Image** | A read-only template for a container. Downloaded from Docker Hub. | `postgres:16-alpine`, `redis:7-alpine`, `nginx:alpine` |
| **Container** | A running instance of an image. Has its own filesystem, network, processes. | `nexus-postgres`, `nexus-redis`, `nexus-api` |
| **Volume** | Persistent storage that survives container restarts/deletions. | `postgres_data` — your database doesn't vanish when you restart. |
| **Port mapping** | Maps a port inside the container to a port on the host. | `"5432:5432"` means host port 5432 → container port 5432 |
| **Network** | Containers on the same Compose network can reach each other by service name. | `nexus-api` calls `postgres:5432` — Docker resolves `postgres` to the container's IP. |
| **Healthcheck** | A command Docker runs periodically to check if a container is healthy. | `pg_isready` for Postgres, `redis-cli ping` for Redis |
| **depends_on + condition** | Start container B only after container A is healthy. | `nexus-api` waits for `postgres` and `redis` to be healthy before starting. |
| **mem_limit** | Hard cap on how much RAM a container can use. Kernel kills it if exceeded. | `mem_limit: 600m` for nexus-api |
| **profiles** | A container with a profile only starts when that profile is activated. | n8n has `profiles: [full]` — only starts with `docker compose --profile full up` |

### What is Docker Compose?

**Docker Compose** is a tool that defines multi-container applications in a single YAML file (`docker-compose.yml`). Instead of running 12 separate `docker run` commands with dozens of flags each, you write a declarative file and run `docker compose up`.

**Compose file location:** `docker/docker-compose.yml`

The file lives in a `docker/` subdirectory to keep the project root clean. The `Makefile` at the project root wraps the `docker compose -f docker/docker-compose.yml` command so you just type `make up`.

### The RAM budget — why mem_limit matters

Nexus runs on a home machine with **8GB total RAM**. The OS (Windows) uses ~4GB, leaving **~3.9GB for Docker**. Every container MUST have `mem_limit` to prevent one runaway container from starving the others.

**RAM allocation:**

| Service | mem_limit | Why this amount |
|---|---|---|
| PostgreSQL | 300m | `shared_buffers=128MB` + overhead. Handles all 3 stacks' data. |
| Redis | 80m | `maxmemory=64MB` + 16MB overhead. In-memory cache + pub/sub. |
| MinIO | 200m | Object storage server. Serves presigned URLs for documents/photos. |
| Ollama | 2g | Needs room to load AI models (tinyllama ~700MB). When idle (model unloaded after 2min), uses ~50MB. |
| nexus-api | 600m | Spring Boot with `-Xmx512m` heap + ~88MB for non-heap (metaspace, stacks). |
| cortex-service | 200m | Python FastAPI. Lightweight HTTP wrapper around Ollama calls. |
| thread-service | 180m | Node.js with `--max-old-space-size=128`. Chat server. |
| Grafana | 250m | Dashboard rendering, alert evaluation. |
| n8n | 300m | Workflow automation (OPTIONAL — only starts with `--profile full`). |
| WireGuard | 100m | VPN tunnel. Kernel-level, very lightweight. |
| Nginx | 50m | Static file server + reverse proxy. Alpine-based, tiny footprint. |
| Cloudflared | 100m | Cloudflare Tunnel daemon. Maintains one outbound connection. |
| minio-init | 64m | Runs once to create buckets, then exits. |

**Total without optional (n8n):** 300 + 80 + 200 + 2048 + 600 + 200 + 180 + 250 + 100 + 50 + 100 = **4,108m (~4GB)**

This looks like it exceeds the 3.9GB budget, but Ollama's 2GB is a **burst allocation**. When no AI model is loaded (which is most of the time — models unload after 2 minutes of idle), Ollama uses ~50MB. Effective steady-state RAM is ~2.1GB, well within budget.

**What happens when a container exceeds its mem_limit?** The Linux kernel's OOM (Out Of Memory) killer terminates the container's main process. Docker then restarts it (because of `restart: unless-stopped`). This prevents one runaway process from freezing the entire machine.

### docker-compose.yml — every service explained

#### 1. PostgreSQL (pgvector)

```yaml
postgres:
  image: pgvector/pgvector:pg16
  mem_limit: 300m
  command: postgres -c shared_buffers=128MB -c max_connections=100
```

**What is PostgreSQL?** An open-source relational database. It stores all of Nexus's structured data: users, medicines, expenses, calendar events, chat messages, password vault entries, etc.

**Why `pgvector/pgvector:pg16` instead of `postgres:16`?** The `pgvector` image is the official PostgreSQL 16 image with the **pgvector extension** pre-installed. pgvector adds a `vector` column type that stores mathematical embeddings (arrays of floating-point numbers) and supports similarity search. This is critical for Atlas (semantic search) and Cortex (embedding storage).

**What is pgvector / vector embeddings?** When you search "what medicine do I take for headaches?", a traditional database does keyword matching. With vector embeddings, the AI converts the question into a list of ~384 numbers (an embedding), and pgvector finds the most mathematically similar entries — even if they don't contain the exact words. This powers Nexus's semantic search.

**Command flags:**
- `shared_buffers=128MB` — How much RAM PostgreSQL uses for caching frequently accessed data. Default is 128KB which is too small. 128MB is appropriate for our 300MB container.
- `max_connections=100` — Maximum simultaneous database connections. Three services (Spring Boot, Cortex, Thread) each maintain connection pools.
- `work_mem=4MB` — Memory per query operation (sorts, hashes). Kept low because many queries run concurrently.
- `effective_cache_size=256MB` — Tells the query planner how much total cache is available (OS + shared_buffers). Helps it choose better query plans.

**Volume:** `postgres_data:/var/lib/postgresql/data` — Database files persist across container restarts.

**Init script:** `./postgres/init.sql` is mounted into the container's init directory. PostgreSQL runs it automatically on first startup. It enables pgvector and creates the three schemas (public, cortex, chat).

**Healthcheck:** `pg_isready` is PostgreSQL's built-in readiness checker. Other services (nexus-api, cortex, thread) wait for this healthcheck to pass before starting.

#### 2. Redis

```yaml
redis:
  image: redis:7-alpine
  mem_limit: 80m
  command: redis-server --maxmemory 64mb --maxmemory-policy allkeys-lru --appendonly yes
```

**What is Redis?** An in-memory data store. Data lives in RAM, making reads/writes orders of magnitude faster than disk-based databases. Redis is used in Nexus for three things:

1. **Caching** — Store frequently accessed data (user sessions, permissions) to avoid hitting PostgreSQL. Example: after validating a JWT, cache the user's roles in Redis for 5 minutes.

2. **Pub/Sub** — A messaging system. Spring Boot publishes a "new expense created" event to a Redis channel. Thread (Node.js) subscribes to that channel and receives the event. This is how the three backend stacks communicate without direct HTTP calls.

3. **Socket.io adapter** — Thread (Node.js) uses Redis as the backend for Socket.io, allowing future scaling to multiple Node.js instances sharing WebSocket state.

**`alpine` image:** Alpine Linux is a tiny Linux distribution (~5MB). Using `redis:7-alpine` instead of `redis:7` saves ~100MB of image size.

**Command flags:**
- `--maxmemory 64mb` — Hard cap on Redis memory usage. Once reached, Redis evicts old keys.
- `--maxmemory-policy allkeys-lru` — LRU = Least Recently Used. When memory is full, Redis deletes the key that hasn't been accessed for the longest time.
- `--appendonly yes` — Enables AOF (Append-Only File) persistence. Every write is logged to disk, so data survives container restarts. Without this, all cached data vanishes on restart.

#### 3. MinIO (Object Storage)

```yaml
minio:
  image: minio/minio:latest
  mem_limit: 200m
  command: server /data --console-address ":9001"
```

**What is MinIO?** A self-hosted, S3-compatible object storage server. It stores files (documents, photos, backups) — things that don't belong in a relational database.

**What does "S3-compatible" mean?** Amazon S3 is the industry-standard API for object storage. MinIO implements the same API, so any code written for S3 works with MinIO. If you ever migrate to cloud, you just change the endpoint URL.

**Two ports:**
- `9000` — The S3 API. Application code (Spring Boot) talks to this port.
- `9001` — The web console. A browser UI for managing buckets and files. Dev/admin use only.

**Buckets created by minio-init:**
- `documents` — DocSense uploads (prescriptions, receipts, invoices)
- `photos` — Gallery photo storage
- `backups` — Database and config backups

**minio-init container:** A separate one-shot container that runs the `mc` (MinIO Client) CLI to create the three buckets. It runs after MinIO is healthy, creates the buckets, prints "Buckets created successfully", and exits. It never runs again (no `restart` policy).

**Why not store files in PostgreSQL?** Databases are optimized for structured, queryable data. Storing a 5MB photo as a BLOB in PostgreSQL wastes database memory, slows backups, and makes the database massive. MinIO is purpose-built for file storage.

**Presigned URLs:** Nexus never exposes MinIO directly to the frontend. Instead, Spring Boot generates a **presigned URL** — a temporary, signed link that grants access to a specific file for a limited time (e.g., 15 minutes). The frontend uses this URL to download/upload directly from/to MinIO without going through Spring Boot. This keeps the backend stateless and fast.

#### 4. Ollama (AI Model Runtime)

```yaml
ollama:
  image: ollama/ollama:latest
  mem_limit: 2g
  environment:
    OLLAMA_KEEP_ALIVE: 2m
```

**What is Ollama?** A tool for running Large Language Models (LLMs) locally. It downloads, manages, and serves AI models like tinyllama, llama3, mistral, etc. Ollama exposes a REST API at port 11434 that applications can call to generate text, create embeddings, etc.

**Why local AI?** Nexus processes sensitive family data (medical records, financial documents, passwords). Sending this to OpenAI's API means your data travels to their servers. With Ollama, everything stays on your machine. Privacy by architecture.

**`mem_limit: 2g` — the largest allocation.** When Ollama loads a model (e.g., tinyllama at ~700MB), the model's weights are loaded into RAM. The model + Ollama runtime + processing buffers can use up to 2GB during active inference. This is the peak allocation — most of the time, no model is loaded.

**`OLLAMA_KEEP_ALIVE: 2m`** — This is the critical setting for the 8GB RAM constraint. After an AI request completes, Ollama keeps the model loaded for 2 minutes in case another request comes. After 2 minutes of idle, it **unloads the model from RAM**, freeing ~700MB+. Without this, the model would stay loaded indefinitely, consuming RAM even when nobody is using AI features.

**On-demand loading pattern:**
1. User uploads a prescription → Spring Boot calls Cortex → Cortex calls Ollama
2. Ollama loads tinyllama into RAM (~3 seconds)
3. Ollama processes the request (OCR/classification/extraction)
4. Ollama keeps the model loaded for 2 more minutes
5. No more requests → Ollama unloads the model, RAM freed
6. Steady-state: Ollama uses ~50MB

**Only Cortex calls Ollama.** Per `.cursorrules`: "Do NOT call Ollama from anywhere except Cortex (Python)." Spring Boot and Thread never talk to Ollama directly.

#### 5. nexus-api (Spring Boot)

```yaml
nexus-api:
  build:
    context: ../backend
    dockerfile: Dockerfile
  mem_limit: 600m
  environment:
    JAVA_OPTS: -Xmx512m -Xms256m
```

**This is the main Nexus backend** — the Spring Boot application from step 1.1. It runs all 7 Java modules (Core, DocSense, MedPulse, Ledger, Timeline, Vault, Gallery, Atlas, Console).

**`build: context: ../backend`** — Docker builds this container from the `backend/` directory using the `Dockerfile` there. This is a custom image, not a pre-built one from Docker Hub.

**`JAVA_OPTS: -Xmx512m -Xms256m`:**
- `-Xmx512m` — Maximum heap size. The JVM will never use more than 512MB of heap memory. If it tries, it gets an `OutOfMemoryError`.
- `-Xms256m` — Initial heap size. The JVM starts with 256MB and grows to 512MB as needed. Starting lower saves RAM during idle periods.
- Why 600m container but 512m heap? The JVM uses non-heap memory too: metaspace (class metadata ~50MB), thread stacks (~1MB per thread), direct buffers, GC overhead. The ~88MB gap covers these.

**Environment variables:** All sensitive config (database credentials, JWT secret, MinIO keys) comes from the `.env` file via Docker Compose variable substitution. The Spring Boot app reads them as `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, etc. Spring Boot automatically maps `SPRING_DATASOURCE_URL` to the `spring.datasource.url` property in `application.yml`.

**`depends_on` with `condition: service_healthy`:** The nexus-api container won't start until PostgreSQL, Redis, and MinIO have all passed their healthchecks. This prevents "Connection refused" errors on startup.

**Healthcheck:** Calls `GET /actuator/health`. Spring Boot's Actuator returns `{"status":"UP"}` when the app is ready. `start_period: 30s` gives Spring Boot time to initialize (it typically takes 15-25 seconds to start).

#### 6. cortex-service (Python FastAPI)

```yaml
cortex-service:
  build:
    context: ../cortex-service
    dockerfile: Dockerfile
  mem_limit: 200m
```

**This is the AI engine** — a Python FastAPI application that sits between Spring Boot and Ollama. It handles:
- `/cortex/ocr` — Extract text from document images
- `/cortex/classify` — Classify documents (prescription, receipt, invoice, etc.)
- `/cortex/extract-entities` — Extract structured data from text (medicine names, amounts, dates)
- `/cortex/embed` — Create vector embeddings for semantic search
- `/cortex/generate` — Generate text via Ollama (SSE streaming)
- `/cortex/status` — Health check

**Why a separate Python service instead of doing AI in Java?** Python has the best AI/ML ecosystem: `httpx` for async HTTP to Ollama, `pgvector` for embedding storage, `Pillow` for image processing, `pydantic` for data validation. Java's AI libraries exist but are less mature and harder to use.

**200m is sufficient** because Cortex is a thin HTTP wrapper — the heavy computation happens inside Ollama. Cortex just formats requests, parses responses, and stores embeddings.

**Currently a placeholder:** `main.py` has a single `/cortex/status` endpoint. Full implementation comes in a later stage.

#### 7. thread-service (Node.js)

```yaml
thread-service:
  build:
    context: ../thread-service
    dockerfile: Dockerfile
  mem_limit: 180m
  environment:
    NODE_OPTIONS: --max-old-space-size=128
```

**This is the real-time chat service** — a Node.js Express + Socket.io application. It handles:
- REST endpoints for message CRUD (create, read, update, delete)
- Socket.io for real-time message delivery (WebSocket connections)
- JWT verification using the same secret as Spring Boot
- Redis pub/sub for cross-service communication

**Why Node.js for chat instead of Spring Boot?** Socket.io is the gold standard for real-time WebSocket communication. Its Node.js implementation is mature, battle-tested, and handles thousands of concurrent connections efficiently. Java's WebSocket support works but is less ergonomic for chat-specific features like rooms, namespaces, and broadcasting.

**`NODE_OPTIONS: --max-old-space-size=128`** — Limits Node.js's V8 heap to 128MB. The default is ~1.5GB which would blow the 180m container limit. Node.js needs ~50MB for its runtime, so 128MB heap + 50MB overhead ≈ 178MB, fitting within the 180m limit.

**Currently a placeholder:** `src/index.js` has a single `/health` endpoint. Full chat implementation comes in a later stage.

#### 8. Grafana (Monitoring)

```yaml
grafana:
  image: grafana/grafana-oss:latest
  mem_limit: 250m
  environment:
    GF_SERVER_ROOT_URL: /grafana/
    GF_SERVER_SERVE_FROM_SUB_PATH: "true"
```

**What is Grafana?** An open-source dashboarding tool. It connects to data sources (Prometheus, PostgreSQL, etc.) and displays real-time charts, graphs, and alerts. In Nexus, it's part of the Console module — the admin dashboard for monitoring system health.

**What will Grafana show?**
- JVM memory usage, GC pauses, thread counts (from Spring Boot Actuator)
- API response times and error rates
- PostgreSQL query performance
- Redis hit/miss ratios
- Container CPU/memory usage

**`GF_SERVER_ROOT_URL: /grafana/` and `GF_SERVER_SERVE_FROM_SUB_PATH: "true"`** — Grafana is served at `/grafana/` (not the root `/`). These settings tell Grafana to generate all its internal links with the `/grafana/` prefix so navigation works behind the Nginx reverse proxy.

**HOME only:** Nginx blocks access to `/grafana/` from remote IPs. Only WiFi, VPN, and localhost can reach it.

**Provisioning:** The `grafana/provisioning/` directory contains YAML files that auto-configure Grafana's data sources and dashboard providers on first startup. No manual setup needed.

#### 9. n8n (Automation — optional)

```yaml
n8n:
  image: n8nio/n8n:latest
  mem_limit: 300m
  profiles:
    - full
```

**What is n8n?** A visual workflow automation tool (like Zapier, but self-hosted). You create workflows by connecting nodes: "when X happens, do Y, then Z."

**Nexus use case:** Automating complex sequences that span multiple services — e.g., "when a new document is uploaded, wait for OCR to complete, then if it's a prescription, create a medicine entry, send a notification, and update the family feed."

**`profiles: [full]`** — This is Docker Compose's profile system. By default, `docker compose up` does NOT start n8n. It only starts when you explicitly include the profile:

```bash
docker compose --profile full up
# or via Makefile:
make up-full
```

Why optional? n8n uses 300MB of RAM. On an 8GB machine, that's significant. The `.cursorrules` say: "Use Spring `@Scheduled` instead if RAM tight." n8n is for power users who want visual automation; `@Scheduled` handles basic recurring tasks (like medicine reminders) without the RAM cost.

#### 10. WireGuard (VPN)

```yaml
wireguard:
  image: lscr.io/linuxserver/wireguard:latest
  mem_limit: 100m
  cap_add:
    - NET_ADMIN
    - SYS_MODULE
  environment:
    SERVERURL: ${DOMAIN:-nexus.yourname.dev}
    PEERS: admin-phone,admin-laptop
    INTERNAL_SUBNET: 10.66.66.0
```

**What is WireGuard?** A modern VPN (Virtual Private Network) protocol. It creates an encrypted tunnel between your phone/laptop and the home server, making it appear as if you're on the home network even when you're away.

**Why Nexus needs VPN:** The Vault (password manager) and Console (admin panel) are blocked for REMOTE access — they only work from HOME network IPs. WireGuard gives you HOME access from anywhere:

1. You're at a coffee shop → your phone connects to WireGuard
2. Your traffic enters the encrypted tunnel → exits at your home server
3. Your home server sees your IP as `10.66.66.x` (WireGuard's internal subnet)
4. Nginx/NetworkSecurityFilter sees `10.66.66.x` → recognizes it as HOME
5. You can access Vault and Console as if you were on WiFi

**`PEERS: admin-phone,admin-laptop`** — Auto-generates VPN configs for two devices. Each gets a QR code you scan with the WireGuard app.

**`INTERNAL_SUBNET: 10.66.66.0`** — The virtual network for VPN clients. This is why `application.yml` has `10.66.66.0/24` in `nexus.security.home-subnets`.

**`cap_add: NET_ADMIN, SYS_MODULE`** — WireGuard needs Linux kernel capabilities to create network interfaces and load kernel modules. These are elevated permissions, but necessary for VPN functionality.

**Note:** WireGuard requires kernel module support. It works on the production Windows machine (via WSL2/Docker) but may not work on macOS Docker Desktop. This container is disabled in `docker-compose.dev.yml`.

#### 11. Nginx (Reverse Proxy)

```yaml
nginx:
  image: nginx:alpine
  mem_limit: 50m
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ../frontend/dist:/usr/share/nginx/html:ro
```

**What is Nginx?** A high-performance web server and reverse proxy. In Nexus, it does two jobs:

1. **Serves the React frontend** — The built React files (`frontend/dist/`) are served as static files. When you visit `https://nexus.yourname.dev/`, Nginx serves `index.html` and all the JS/CSS bundles.

2. **Routes API calls to the correct backend** — Nexus has three backend services on three different ports. Nginx inspects the URL path and forwards the request to the right service. The browser only ever talks to Nginx on port 80/443.

**Why Nginx instead of serving from Spring Boot?** Spring Boot can serve static files, but Nginx is vastly more efficient at it (purpose-built for static content). It also handles SSL termination, gzip compression, and request buffering — things that would waste Spring Boot's resources.

**`50m mem_limit`** — Nginx is incredibly lightweight. The Alpine image is ~5MB, and the running process typically uses ~10-20MB of RAM. 50m is generous.

**Volume mounts:**
- `./nginx/nginx.conf:/etc/nginx/nginx.conf:ro` — Custom config (`:ro` = read-only)
- `../frontend/dist:/usr/share/nginx/html:ro` — React build output served at `/`

#### 12. Cloudflared (Tunnel)

```yaml
cloudflared:
  image: cloudflare/cloudflared:latest
  mem_limit: 100m
  command: tunnel run
  environment:
    TUNNEL_TOKEN: ${CLOUDFLARE_TUNNEL_TOKEN}
```

**What is Cloudflare Tunnel?** A service that securely exposes your local server to the internet without opening ports on your router, without a static IP, and without buying a domain's SSL certificate.

**How it works:**
1. Cloudflared (the daemon) starts inside Docker
2. It establishes an **outbound** connection to Cloudflare's network (no inbound ports needed)
3. Cloudflare assigns your tunnel to a domain (e.g., `nexus.yourname.dev`)
4. When someone visits `nexus.yourname.dev`, Cloudflare routes the request through the tunnel to your local Nginx
5. Cloudflare handles SSL, DDoS protection, and caching

**Why not port forwarding?** Traditional approach: open port 80/443 on your router, point a domain to your IP. Problems: your ISP might block ports, your IP changes (dynamic IP), you need to manage SSL certificates, and your home network is directly exposed to the internet. Cloudflare Tunnel solves all of these.

**`TUNNEL_TOKEN`** — You create a tunnel in Cloudflare's Zero Trust dashboard, and it gives you a token. This token authenticates the daemon. The token is stored in `.env` (not committed to Git).

### Nginx routing — how one URL reaches three backends

This is the central routing problem Nexus solves: the browser sends all requests to one domain (`nexus.yourname.dev`), but three different backend services need to handle them.

**The routing table:**

| URL pattern | Backend | Port | Why this service |
|---|---|---|---|
| `/api/v1/chat/*` | thread-service (Node.js) | 3000 | Chat CRUD endpoints |
| `/ws/chat/*` | thread-service (Node.js) | 3000 | Chat WebSocket connections |
| `/cortex/*` | cortex-service (Python) | 8000 | AI engine endpoints |
| `/api/*` | nexus-api (Spring Boot) | 8080 | Everything else (auth, medicines, expenses, etc.) |
| `/ws/*` | nexus-api (Spring Boot) | 8080 | Non-chat WebSockets (Timeline sync, notifications) |
| `/actuator/*` | nexus-api (Spring Boot) | 8080 | Health/metrics (HOME only) |
| `/grafana/*` | grafana | 3000 | Monitoring dashboards (HOME only) |
| `/n8n/*` | n8n | 5678 | Automation workflows (HOME only) |
| `/` | Static files | — | React SPA (`frontend/dist/`) |

**Order matters!** Nginx matches locations top-to-bottom. `/api/v1/chat/` MUST come before `/api/` — otherwise `/api/v1/chat/messages` would match `/api/` and go to Spring Boot instead of Thread.

**WebSocket handling:** WebSocket connections start as HTTP requests with an `Upgrade: websocket` header. Nginx needs special configuration for this:

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_read_timeout 86400s;  # Keep the connection open for 24 hours
```

Without these headers, Nginx would close WebSocket connections after 60 seconds.

**HOME-only restriction:** Nginx uses a `geo` block to check the client's IP:

```nginx
geo $is_home {
    default         0;        # Not home by default
    192.168.0.0/16  1;        # WiFi LAN
    10.66.66.0/24   1;        # WireGuard VPN
    127.0.0.0/8     1;        # Localhost
    172.16.0.0/12   1;        # Docker internal
}
```

For Grafana and n8n locations:
```nginx
location /grafana/ {
    if ($is_home = 0) { return 403; }
    proxy_pass http://grafana;
}
```

If the client IP isn't in a home subnet → 403 Forbidden. This is Nginx-level protection, separate from the `NetworkSecurityFilter` in Spring Boot (defense in depth — two layers of protection).

**`try_files $uri $uri/ /index.html`** — This is critical for the React SPA. When someone navigates to `/medicines` in the browser, there's no actual file at that path — it's a client-side route handled by React Router. `try_files` tells Nginx: "try serving the exact file, then try the directory, then fall back to `index.html`." React Router then reads the URL and renders the correct page.

### .env.example — environment variables

Location: `docker/.env.example`

This file is a template for the real `.env` file (which is gitignored). It documents every environment variable the Docker stack needs.

**How to use:**
```bash
cd docker
cp .env.example .env
# Edit .env with real values
```

**The variables:**

| Variable | Used by | What it is |
|---|---|---|
| `DOMAIN` | WireGuard, n8n | Your public domain (e.g., `nexus.yourname.dev`) |
| `TZ` | WireGuard | Timezone for timestamps |
| `POSTGRES_DB/USER/PASSWORD` | PostgreSQL, nexus-api, cortex, thread, n8n | Database credentials. All services share one database. |
| `MINIO_ROOT_USER/PASSWORD` | MinIO, nexus-api | Object storage credentials |
| `JWT_SECRET` | nexus-api, thread-service | The shared secret for signing/verifying JWTs. All services that verify tokens need the same secret. |
| `GRAFANA_ADMIN_USER/PASSWORD` | Grafana | Admin login for dashboards |
| `CLOUDFLARE_TUNNEL_TOKEN` | Cloudflared | Authenticates the tunnel daemon |

**Required vs optional:** Variables with `${VAR:?message}` in docker-compose.yml are **required** — Docker Compose refuses to start if they're missing. Variables with `${VAR:-default}` have defaults and are optional.

**Security:** The `.env` file contains real passwords and must NEVER be committed to Git. The `.gitignore` has `docker/.env` explicitly listed.

### docker-compose.dev.yml — development overrides

Location: `docker/docker-compose.dev.yml`

This is a **Compose override file**. When you run:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Docker Compose merges the two files. The dev file overrides or extends specific services.

**What's different in dev mode:**

| Change | Why |
|---|---|
| `cloudflared` disabled (profile: never) | No tunnel needed — you access everything via localhost |
| `wireguard` disabled (profile: never) | VPN irrelevant for local development |
| `nginx` disabled (profile: never) | Vite's dev server handles the frontend with hot reload + API proxy |
| nexus-api gets debug port `5005` | Attach IntelliJ/VS Code debugger to the running Spring Boot app |
| nexus-api gets `SPRING_PROFILES_ACTIVE=dev` | Loads `application-dev.yml` for dev-specific config |
| thread-service gets inspect port `9229` | Attach Chrome DevTools / VS Code debugger to Node.js |
| cortex-service gets `ENVIRONMENT=development` | Enable debug logging |

**Why disable Nginx in dev?** During development, you run `npm run dev` which starts Vite's dev server on port 5173. Vite provides instant hot reload (changes appear without page refresh) and proxies `/api/*` to Spring Boot. This is much faster than building `frontend/dist/` and having Nginx serve it. In production, you build once and Nginx serves the static files.

### Dockerfiles — how each service is containerized

**Backend Dockerfile** (`backend/Dockerfile`):

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY build/libs/nexus-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

- `eclipse-temurin:21-jre-alpine` — Adoptium's JRE 21 on Alpine Linux. JRE (not JDK) because we only need to **run** Java, not compile it. Alpine keeps the image small (~100MB vs ~300MB for full Debian).
- `COPY build/libs/nexus-*.jar` — Copies the fat JAR built by `./gradlew bootJar`. You must build before Docker builds.
- `ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]` — Using `sh -c` allows the `$JAVA_OPTS` environment variable to be expanded at runtime. This is how Docker Compose passes `-Xmx512m` into the JVM.

**Cortex Dockerfile** (`cortex-service/Dockerfile`):

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- `python:3.12-slim` — Python 3.12 on Debian slim (~150MB). Alpine causes issues with some Python packages that need C compilation.
- `COPY requirements.txt` first, then `RUN pip install` — Docker caches layers. If `requirements.txt` hasn't changed, Docker reuses the cached layer and skips `pip install`. Only the application code is re-copied.
- `uvicorn` — An ASGI server for FastAPI. `--host 0.0.0.0` makes it accessible from outside the container (not just localhost).

**Thread Dockerfile** (`thread-service/Dockerfile`):

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
```

- `node:22-alpine` — Node.js 22 on Alpine.
- `npm ci --omit=dev` — `ci` (clean install) installs exact versions from `package-lock.json` (reproducible builds). `--omit=dev` skips devDependencies (eslint, etc.) to keep the image small.
- Same layer caching strategy: `package*.json` first, then application code.

### postgres/init.sql — database initialization

Location: `docker/postgres/init.sql`

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE SCHEMA IF NOT EXISTS cortex;
CREATE SCHEMA IF NOT EXISTS chat;

GRANT ALL ON SCHEMA public TO nexus;
GRANT ALL ON SCHEMA cortex TO nexus;
GRANT ALL ON SCHEMA chat   TO nexus;

ALTER DATABASE nexus SET search_path TO public, cortex, chat;
```

**What this does:**

1. **`CREATE EXTENSION vector`** — Enables pgvector. Adds the `vector` column type and similarity operators (`<->` for L2 distance, `<=>` for cosine distance).

2. **Three schemas** — PostgreSQL schemas are like namespaces within a database. All three services share one database (`nexus`) but use different schemas:
   - `public` — Spring Boot (users, medicines, expenses, events, vault entries, photos, etc.)
   - `cortex` — Cortex Python service (embeddings table with vector columns)
   - `chat` — Thread Node.js service (channels, messages, reactions, read receipts)

   This separation means each service's tables don't collide. A `users` table in `public` won't conflict with a `users` table in `chat`.

3. **`GRANT ALL`** — Gives the `nexus` database user full access to all three schemas.

4. **`SET search_path`** — When a query doesn't specify a schema, PostgreSQL searches schemas in this order. This lets Spring Boot query without prefixing every table with `public.`.

**When does this run?** Only on first startup — when PostgreSQL initializes an empty data directory. If `postgres_data` volume already exists with data, the init script is skipped.

### Makefile — shortcut commands

Location: `Makefile` (project root)

A Makefile provides short, memorable commands that wrap longer Docker Compose commands:

| Command | What it does |
|---|---|
| `make up` | Start all production containers in detached mode |
| `make down` | Stop all containers |
| `make logs` | Follow logs from all containers |
| `make logs SVC=nexus-api` | Follow logs from just the Spring Boot container |
| `make build` | Rebuild all custom images |
| `make status` / `make ps` | Show running containers and their status |
| `make fresh` | Nuclear option: stop everything, delete all volumes (data!), rebuild from scratch |
| `make up-full` | Start everything including n8n (`--profile full`) |
| `make dev` | Start dev mode (no nginx/cloudflared/wireguard, debug ports open) |
| `make dev-down` | Stop dev containers |
| `make dev-logs` | Follow dev logs |
| `make dev-fresh` | Nuclear dev reset |
| `make shell SVC=nexus-api` | Open a shell inside a running container |
| `make pull-model` | Download the tinyllama AI model into Ollama |
| `make db` | Open a PostgreSQL shell (`psql`) |
| `make redis-cli` | Open a Redis CLI |

**Why a Makefile?** Without it, you'd type:
```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d
```

With it:
```bash
make dev
```

### Files created in 1.2

```
docker/
├── docker-compose.yml              ← Main compose file (12 services + 1 init container)
├── docker-compose.dev.yml          ← Development overrides (disables nginx/cloudflared/wireguard)
├── .env.example                    ← Environment variable template
├── nginx/
│   └── nginx.conf                  ← Reverse proxy routing rules
├── postgres/
│   └── init.sql                    ← pgvector + schema initialization
└── grafana/provisioning/
    ├── datasources/datasource.yml  ← Auto-configure Grafana data source
    └── dashboards/dashboard.yml    ← Auto-configure dashboard provider

cortex-service/
├── Dockerfile                      ← Python container image
├── requirements.txt                ← Python dependencies
└── main.py                         ← Placeholder FastAPI app

thread-service/
├── Dockerfile                      ← Node.js container image
├── package.json                    ← Node.js dependencies
└── src/index.js                    ← Placeholder Express app

backend/
└── Dockerfile                      ← Spring Boot container image (JRE 21 Alpine)

Makefile                            ← Shortcut commands (make up, make dev, etc.)
```

---

## 1.3 Health Endpoint + Network Detection

### What was asked (1.3)

> GET /api/v1/public/health returns {status, services: {postgres,redis,minio,ollama}, networkTrust: REMOTE/HOME/LOCALHOST}. NetworkUtils class reads X-Real-IP/X-Forwarded-For: 127.0.0.0/8 -> LOCALHOST, 192.168.0.0/16 or 10.66.66.0/24 -> HOME, else -> REMOTE. Frontend: Hello Nexus page shows service health + network trust badge.

### What this prompt does and why it matters

This is the **first real feature** after the scaffold. It does three things:

1. **Service health checking** — A public API endpoint that pings PostgreSQL, Redis, MinIO, and Ollama and reports which are alive. This tells you instantly if your Docker stack is healthy without checking each container manually.

2. **Network trust detection** — Every HTTP request is classified as LOCALHOST, HOME, or REMOTE based on the client's IP address. This is the foundation of Nexus's security model: Vault and Console are HOME-only, everything else works remotely.

3. **Frontend health dashboard** — The Hello Nexus page becomes functional: it calls the health API, shows each service's status with green/red indicators, and displays a badge showing your network trust tier.

**Why this matters:** This is a "vertical slice" — it exercises every layer of the stack at once:
- Nginx sets `X-Real-IP` → Spring Boot reads it via `NetworkUtils`
- Spring Boot connects to PostgreSQL/Redis → `ServiceHealthChecker` verifies
- Spring Boot calls MinIO/Ollama via HTTP → `RestTemplate` with timeout
- Frontend calls backend API → Vite proxy or Nginx forwards
- Response uses `ApiResponse<T>` wrapper → consistent format verified

If this endpoint works correctly from localhost, WiFi, and Cloudflare Tunnel, the entire infrastructure is validated.

### NetworkTrust enum

Location: `backend/src/main/java/dev/nexus/shared/security/NetworkTrust.java`

```java
public enum NetworkTrust {
    LOCALHOST,   // 127.0.0.0/8 — server itself, direct DB access
    HOME,        // 192.168.0.0/16, 10.66.66.0/24 — WiFi or WireGuard VPN
    REMOTE       // Everything else — via Cloudflare Tunnel
}
```

A simple three-value enum representing Nexus's trust tiers from `.cursorrules`. The tier determines what you can access:

| Tier | How you connect | What you get |
|---|---|---|
| LOCALHOST | Directly on the server | Everything + direct DB/Docker |
| HOME | WiFi or WireGuard VPN | Everything including Vault + Console |
| REMOTE | Cloudflare Tunnel | Everything EXCEPT Vault + Console |

### NetworkUtils — IP to trust tier

Location: `backend/src/main/java/dev/nexus/shared/security/NetworkUtils.java`

This is the core of network detection. It does two things:

**1. Extract the real client IP from the request**

When a request arrives at Spring Boot, it's been through multiple proxies:
```
Client → Cloudflare → Nginx → Spring Boot
```

Each proxy adds the original client's IP to headers. `NetworkUtils.extractClientIp()` reads them in priority order:

1. `X-Real-IP` — Set by Nginx (`proxy_set_header X-Real-IP $remote_addr`). Most reliable because Nginx is trusted.
2. `X-Forwarded-For` — A comma-separated list of IPs. The first entry is the original client. Used as fallback.
3. `request.getRemoteAddr()` — The raw TCP connection source. In Docker, this is usually the Nginx container's IP (172.x.x.x), not the real client. Used only as last resort.

**2. Match the IP against CIDR ranges**

The inner `CidrRange` class parses CIDR notation (like `192.168.0.0/16`) and checks if an IP falls within it:

- Parse `192.168.0.0/16` → network address `192.168.0.0`, mask `255.255.0.0`
- To check `192.168.1.50`: apply mask to both IPs, compare the results
- `192.168.1.50 & 255.255.0.0 = 192.168.0.0` — matches! → HOME

The matching logic:
- `127.0.0.0/8` (or IPv6 `::1`) → **LOCALHOST**
- Any configured home subnet → **HOME**
- Everything else → **REMOTE**

Home subnets are configured in `application.yml` under `nexus.security.home-subnets` and loaded via `NexusSecurityProperties`, so you can add more ranges without changing code.

### NexusSecurityProperties — externalized config

Location: `backend/src/main/java/dev/nexus/shared/config/NexusSecurityProperties.java`

```java
@Data
@ConfigurationProperties(prefix = "nexus.security")
public class NexusSecurityProperties {
    private String jwtSecret = "change-me-in-production";
    private long jwtExpirationMs = 86400000;
    private List<String> homeSubnets = List.of("192.168.0.0/16", "10.66.66.0/24");
}
```

**What is `@ConfigurationProperties`?** It's Spring Boot's type-safe way to bind YAML/properties to a Java object. The `prefix = "nexus.security"` means Spring reads:

```yaml
nexus:
  security:
    jwt-secret: "..."
    jwt-expiration-ms: 86400000
    home-subnets:
      - 192.168.0.0/16
      - 10.66.66.0/24
```

...and populates the Java fields automatically. Kebab-case YAML (`jwt-secret`) maps to camelCase Java (`jwtSecret`). List items map to `List<String>`.

**Why not `@Value`?** `@Value("${nexus.security.jwt-secret}")` works for single values but can't bind lists cleanly, isn't refactor-safe, and scatters config access across many classes. `@ConfigurationProperties` centralizes all Nexus security config in one injectable object.

`@EnableConfigurationProperties(NexusSecurityProperties.class)` on `SecurityConfig` registers this class with Spring's container.

### SecurityConfig — Spring Security filter chain

Location: `backend/src/main/java/dev/nexus/shared/config/SecurityConfig.java`

```java
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
```

This is the first real Spring Security configuration. It establishes three rules:

**CSRF disabled** — CSRF (Cross-Site Request Forgery) protection uses cookies to prevent malicious sites from making requests on your behalf. Nexus uses JWT tokens (not cookies), so CSRF protection is unnecessary and would block legitimate API calls.

**Stateless sessions** — Spring Security won't create HTTP sessions. Every request must carry its own authentication (JWT in the `Authorization` header). This keeps the server stateless — any instance can handle any request without session affinity.

**Authorization rules:**
- `/api/v1/public/**` → **permitAll()** — The health endpoint (and future public endpoints) work without authentication
- `/actuator/**` → **permitAll()** — Health/metrics endpoints accessible without auth (Nginx restricts these to HOME IPs separately)
- Everything else → **authenticated()** — Returns 401 Unauthorized without a valid JWT. This is correct because we haven't built login yet — only the health endpoint needs to work right now.

### HealthController + ServiceHealthChecker

**HealthController** (`core/health/HealthController.java`):

```java
@RestController
@RequestMapping("/api/v1/public")
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<HealthResponse> health(HttpServletRequest request) {
        Map<String, String> services = healthChecker.checkAll();
        NetworkTrust trust = networkUtils.determineTrust(request);

        boolean allUp = services.values().stream().allMatch("UP"::equals);
        String status = allUp ? "UP" : "DEGRADED";

        return ApiResponse.success(HealthResponse.builder()
                .status(status)
                .services(services)
                .networkTrust(trust)
                .build());
    }
}
```

A single GET endpoint that:
1. Pings all 4 infrastructure services
2. Determines the caller's network trust tier
3. Returns everything wrapped in `ApiResponse`

The response looks like:
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "services": {
      "postgres": "UP",
      "redis": "UP",
      "minio": "UP",
      "ollama": "DOWN"
    },
    "networkTrust": "HOME"
  },
  "timestamp": "2026-03-12T12:00:00Z"
}
```

If any service is DOWN, overall status becomes "DEGRADED" instead of "UP".

**ServiceHealthChecker** (`core/health/ServiceHealthChecker.java`):

Each service is checked differently:

| Service | How it's checked | Why |
|---|---|---|
| PostgreSQL | `DataSource.getConnection()` + `SELECT 1` | JDBC connection from the pool. Verifies the DB is accepting queries. |
| Redis | `RedisConnectionFactory.getConnection().ping()` | Redis PING command. Returns "PONG" if alive. |
| MinIO | HTTP GET to `{minioUrl}/minio/health/live` | MinIO's built-in liveness endpoint. |
| Ollama | HTTP GET to `{ollamaUrl}/api/tags` | Lists available models. Works even when no model is loaded. |

Every check is wrapped in try/catch — if a service is unreachable (connection timeout, refused), it returns "DOWN" instead of crashing the entire health endpoint. The `RestTemplate` has 3-second timeouts so the endpoint doesn't hang if a service is slow to respond.

Service URLs are configurable via `application.yml` → env vars:
- `nexus.services.minio-url` → `${MINIO_ENDPOINT:http://localhost:9000}`
- `nexus.services.ollama-url` → `${OLLAMA_BASE_URL:http://localhost:11434}`

### NetworkSecurityFilter — now functional

Location: `backend/src/main/java/dev/nexus/shared/security/NetworkSecurityFilter.java`

Previously a pass-through placeholder, now it actually blocks REMOTE access to sensitive paths:

```java
if (isHomePath) {
    NetworkTrust trust = networkUtils.determineTrust(request);
    if (trust == NetworkTrust.REMOTE) {
        response.setStatus(403);
        objectMapper.writeValue(response.getWriter(),
            ApiResponse.error("This resource is only accessible from the home network"));
        return;
    }
}
```

**How it works:**
1. Every request passes through this filter (it extends `OncePerRequestFilter`)
2. Check if the request path starts with `/api/v1/vault` or `/api/v1/admin`
3. If yes, use `NetworkUtils` to determine trust tier
4. If REMOTE → return 403 with a JSON error body (using `ApiResponse` format)
5. If HOME or LOCALHOST → continue the filter chain normally

**Defense in depth:** This is the second layer of protection. Nginx already blocks `/grafana/` and `/n8n/` for remote IPs. This filter blocks `/api/v1/vault` and `/api/v1/admin` at the application level. Both layers must be bypassed to reach sensitive endpoints.

### Frontend health dashboard

Location: `frontend/src/modules/Home.tsx`

The Hello Nexus page now has two functional sections:

**Network Trust Badge** — A colored pill at the top showing your connection type:
- **Violet** for LOCALHOST
- **Emerald** for HOME (with WiFi icon)
- **Amber** for REMOTE (with globe icon)

**Service Health Card** — A glassmorphism card listing each service with:
- Service icon (Database, HardDrive, Server, Brain)
- Service name
- Green checkmark (UP) or red X (DOWN)
- A refresh button to re-check
- An overall status indicator at the bottom (pulsing green dot for UP, amber for DEGRADED)

**How it fetches data:**
```tsx
const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ['health'],
  queryFn: () => api.get('/public/health'),
  refetchInterval: 30_000,  // Auto-refresh every 30 seconds
})
```

React Query handles:
- Loading state (shows a spinner)
- Error state (shows "Backend unreachable" in a red card)
- Success state (renders the service list with animations)
- Auto-refresh every 30 seconds in the background

**New frontend files:**
- `services/api.ts` — Configured axios instance with `/api/v1` base URL. Response interceptor unwraps `res.data` so components get the `ApiResponse` directly.
- `types/health.ts` — TypeScript types for `HealthResponse`, `NetworkTrust`, `ServiceStatus`, and the generic `ApiResponse<T>`.

### Hands-on verification steps

These are manual steps to verify the infrastructure works end-to-end:

**HO-1: Router Port Forwarding** — Forward UDP port 51820 on your router to your server's local IP. This is the WireGuard VPN port — the ONLY port you forward. All web traffic goes through Cloudflare Tunnel (no port forwarding needed).

**HO-2: WireGuard Phone Setup** — Install the WireGuard app, then get the config:
```bash
docker exec nexus-wireguard cat /config/peer_admin-phone/peer_admin-phone.conf
```
Scan the QR code or paste the config. Your phone gets IP `10.66.66.2` on the VPN.

**HO-3: Verify Docker Stack** — Run `docker compose ps` and verify all containers are running. Test each service:
```bash
docker exec nexus-postgres pg_isready          # PostgreSQL
docker exec nexus-redis redis-cli ping          # Redis
curl http://localhost:9001                       # MinIO console
curl http://localhost:11434/api/tags            # Ollama
curl http://localhost:8080/api/v1/public/health  # Nexus API
```

**HO-4: Test Network Detection** — Three tests to verify trust tiers:
1. From the server itself → `curl localhost:8080/api/v1/public/health` → should show `LOCALHOST`
2. From phone on WiFi → open `http://192.168.x.x:8080/api/v1/public/health` → should show `HOME`
3. Via Cloudflare Tunnel → open `https://nexus.yourname.dev/api/v1/public/health` → should show `REMOTE`

If the trust tier is wrong, check that Nginx is setting `X-Real-IP` correctly in its proxy configuration.

### Files created/modified in 1.3

**New files:**
```
backend/src/main/java/dev/nexus/
├── shared/security/NetworkTrust.java         ← LOCALHOST/HOME/REMOTE enum
├── shared/security/NetworkUtils.java         ← IP extraction + CIDR matching
├── shared/config/NexusSecurityProperties.java ← @ConfigurationProperties for nexus.security.*
├── shared/config/SecurityConfig.java         ← Spring Security filter chain (public paths, stateless)
├── shared/config/AppConfig.java              ← RestTemplate bean with 3s timeout
├── core/health/HealthController.java         ← GET /api/v1/public/health
├── core/health/HealthResponse.java           ← {status, services, networkTrust}
└── core/health/ServiceHealthChecker.java     ← Pings postgres/redis/minio/ollama

frontend/src/
├── services/api.ts                           ← Axios instance with /api/v1 base
├── types/health.ts                           ← TypeScript types for health API
└── modules/Home.tsx                          ← Updated with health dashboard + trust badge
```

**Modified files:**
```
backend/src/main/java/dev/nexus/
└── shared/security/NetworkSecurityFilter.java ← Now actually blocks REMOTE from vault/admin

backend/src/main/resources/
└── application.yml                           ← Added nexus.services.minio-url and ollama-url
```

---

## Post-scaffold fix: JDK 21 auto-provisioning

### The problem

The machine has JDK 8, 11, and 17 installed but **not JDK 21**. The `build.gradle.kts` declares `JavaLanguageVersion.of(21)` via the toolchain feature. Without JDK 21 available, `./gradlew build` would fail with:

```
No matching toolchains found for requested specification:
{languageVersion=21, vendor=any, implementation=vendor-specific}
```

### The fix

Added the **Foojay Toolchain Resolver** plugin to `settings.gradle.kts`:

```kotlin
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.9.0"
}
```

**How it works step by step:**
1. Gradle starts and reads `build.gradle.kts` — sees `JavaLanguageVersion.of(21)`
2. Gradle scans all locally installed JDKs — finds 8, 11, 17. No 21.
3. Foojay plugin kicks in — queries `https://api.foojay.io/disco/v3.0/packages?jdk_version=21&operating_system=macos&architecture=aarch64`
4. Foojay returns a download URL for a matching JDK (e.g., Adoptium Temurin 21.0.x)
5. Gradle downloads the JDK tarball to `~/.gradle/jdks/`
6. Gradle extracts it and uses it for compilation/testing
7. On subsequent runs, the cached JDK is reused instantly

### Verification

```bash
cd backend
./gradlew compileJava
```

Output:
```
Welcome to Gradle 8.14.4!
Starting a Gradle Daemon...
> Task :compileJava
BUILD SUCCESSFUL in 31s
1 actionable task: 1 executed
```

**No manual Java installation needed.** The entire toolchain is self-managing.

---

## Final file tree

```
backend/
├── build.gradle.kts                          ← Build config with all dependencies
├── settings.gradle.kts                       ← Project name + Foojay toolchain resolver
├── Dockerfile                                ← JRE 21 Alpine container image
├── gradlew / gradlew.bat                     ← Gradle wrapper scripts
├── gradle/wrapper/
│   ├── gradle-wrapper.jar                    ← Wrapper bootstrap
│   └── gradle-wrapper.properties             ← Gradle 8.14.4 distribution URL
└── src/
    ├── main/
    │   ├── java/dev/nexus/
    │   │   ├── NexusApplication.java         ← Spring Boot entry point
    │   │   ├── core/
    │   │   │   ├── package-info.java
    │   │   │   └── health/
    │   │   │       ├── HealthController.java     ← GET /api/v1/public/health
    │   │   │       ├── HealthResponse.java       ← {status, services, networkTrust}
    │   │   │       └── ServiceHealthChecker.java ← Pings 4 infrastructure services
    │   │   ├── cortex/package-info.java
    │   │   ├── docsense/package-info.java
    │   │   ├── medpulse/package-info.java
    │   │   ├── ledger/package-info.java
    │   │   ├── timeline/package-info.java
    │   │   ├── thread/package-info.java
    │   │   ├── vault/package-info.java
    │   │   ├── gallery/package-info.java
    │   │   ├── atlas/package-info.java
    │   │   ├── console/package-info.java
    │   │   ├── spaces/package-info.java
    │   │   └── shared/
    │   │       ├── config/
    │   │       │   ├── package-info.java
    │   │       │   ├── AppConfig.java            ← RestTemplate bean
    │   │       │   ├── NexusSecurityProperties.java ← nexus.security.* config binding
    │   │       │   └── SecurityConfig.java       ← Spring Security filter chain
    │   │       ├── events/package-info.java
    │   │       ├── dto/ApiResponse.java          ← Unified response wrapper
    │   │       ├── exception/GlobalExceptionHandler.java
    │   │       └── security/
    │   │           ├── NetworkTrust.java          ← LOCALHOST/HOME/REMOTE enum
    │   │           ├── NetworkUtils.java          ← IP extraction + CIDR matching
    │   │           └── NetworkSecurityFilter.java ← Blocks REMOTE from vault/admin
    │   └── resources/
    │       └── application.yml               ← App config (DB, Redis, JWT, subnets)
    └── test/
        └── java/dev/nexus/
            └── NexusApplicationTests.java

frontend/
├── package.json                              ← All npm dependencies
├── vite.config.ts                            ← Vite + Tailwind + proxy + path alias
├── tsconfig.json / tsconfig.app.json         ← TypeScript config with @/ alias
└── src/
    ├── App.tsx                               ← Router + React Query provider
    ├── main.tsx                              ← ReactDOM entry
    ├── index.css                             ← Tailwind v4 + design system tokens
    ├── modules/Home.tsx                      ← Health dashboard + trust badge
    ├── services/api.ts                       ← Axios instance with /api/v1 base
    ├── types/health.ts                       ← HealthResponse, NetworkTrust types
    ├── components/shared/                    ← (empty, ready for UI components)
    ├── hooks/                                ← (empty, ready for custom hooks)
    ├── store/                                ← (empty, ready for Zustand stores)
    ├── theme/                                ← (empty, ready for theme logic)
    └── types/                                ← Shared TypeScript type definitions

docker/
├── docker-compose.yml                        ← 12 services + 1 init container
├── docker-compose.dev.yml                    ← Dev overrides (no nginx/tunnel/vpn)
├── .env.example                              ← Environment variable template
├── nginx/nginx.conf                          ← Reverse proxy routing
├── postgres/init.sql                         ← pgvector + schemas
└── grafana/provisioning/
    ├── datasources/datasource.yml            ← Grafana data source config
    └── dashboards/dashboard.yml              ← Grafana dashboard provider

cortex-service/
├── Dockerfile                                ← Python 3.12 slim
├── requirements.txt                          ← FastAPI, httpx, pgvector, etc.
└── main.py                                   ← Placeholder /cortex/status

thread-service/
├── Dockerfile                                ← Node.js 22 Alpine
├── package.json                              ← Express, Socket.io, ioredis, etc.
└── src/index.js                              ← Placeholder /health

Makefile                                      ← make up/down/dev/logs/fresh
```

---

## How to run

**Backend** (from project root):
```bash
cd backend
./gradlew bootRun
# First run downloads JDK 21 + all dependencies — may take a few minutes
# Requires PostgreSQL and Redis running (will fail at startup without them)
```

**Frontend** (from project root):
```bash
cd frontend
npm run dev
# Opens at http://localhost:5173
# API calls proxy to http://localhost:8080
```

**Frontend production build**:
```bash
cd frontend
npm run build
# Output in frontend/dist/ — served by Nginx in production
```

---

## Changelog

| Date | What changed |
|---|---|
| 2026-03-12 | **1.1** — Initial scaffold created: backend (Spring Boot 3.3.7, Java 21, Gradle) + frontend (React 19, Vite 7, Tailwind v4, TypeScript 5.9). JDK 21 auto-provisioning added via Foojay plugin. Backend compiles, frontend builds — both verified. |
| 2026-03-12 | **1.2** — Docker infrastructure: 12-service docker-compose.yml with mem_limit on every container, Nginx reverse proxy routing 3 backends, PostgreSQL with pgvector + 3 schemas, Redis with 64MB cap, MinIO with auto-created buckets, Ollama with 2min model unload, WireGuard VPN, Cloudflare Tunnel, optional n8n via profiles. Dockerfiles for all 3 app services. Makefile with dev/prod shortcuts. |
| 2026-03-12 | **1.3** — Health endpoint + network detection: GET /api/v1/public/health returns service statuses (postgres/redis/minio/ollama) and network trust tier (LOCALHOST/HOME/REMOTE). NetworkUtils with CIDR matching, SecurityConfig (CSRF disabled, stateless, public paths permitted), NetworkSecurityFilter now blocks REMOTE from vault/admin. Frontend shows health dashboard with trust badge. Backend compiles, frontend builds — verified. |
