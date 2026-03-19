// =============================================================================
// build.gradle.kts — The instruction manual for building this project.
// Gradle reads this file every time you run ./gradlew <task>.
// It tells Gradle: what libraries to download, how to compile, how to run,
// and how to package the app into a deployable JAR.
// =============================================================================

plugins {
    java                                                          // Unlocks: compileJava, test, jar tasks
    id("org.springframework.boot") version "3.3.7"              // Unlocks: bootRun, bootJar tasks
    id("io.spring.dependency-management") version "1.1.7"       // Handles version resolution for Spring libs
}

// NOTE: Without plugins, Gradle is essentially a blank slate.
// Each plugin registers new tasks and configuration options.
// `spring-boot` plugin is what makes `./gradlew bootRun` a valid command.

group = "dev.nexus"          // Your org namespace (reverse-domain convention)
version = "0.0.1-SNAPSHOT"  // SNAPSHOT = in-development, not a stable release

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21) // Compile & run with Java 21 LTS
        // Gradle will auto-download JDK 21 if it's not found on the machine.
        // Java 21 gives us: virtual threads (Project Loom), pattern matching, record patterns.
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
        // Annotation processors (Lombok, MapStruct) run during compilation to GENERATE code,
        // then disappear — they are NOT bundled into the final JAR.
        // This line makes compileOnly dependencies available to the annotation processor phase.
    }
}

repositories {
    mavenCentral()
    // Maven Central is the main public registry for JVM libraries — like npm but for Java.
    // When Gradle sees a dependency it doesn't have cached, it downloads it from here.
    // All downloaded JARs are cached locally at: ~/.gradle/caches/
}

// Version variables — pin once here, reference everywhere below.
// Change a version in ONE place instead of hunting through the file.
val mapstructVersion = "1.6.3"
val jjwtVersion = "0.12.6"

dependencies {

    // =========================================================================
    // SPRING BOOT STARTERS
    // Each starter = a curated bundle of libraries + auto-configuration.
    // Spring Boot reads your classpath and wires everything up automatically.
    // You don't manually instantiate Tomcat, configure Jackson, or set up
    // Hibernate — Boot detects the starters and does it for you.
    // =========================================================================

    implementation("org.springframework.boot:spring-boot-starter-web")
    // Bundles: embedded Tomcat (your HTTP server) + Spring MVC (routing/controllers)
    // + Jackson (Java <-> JSON serialization).
    // This is what makes @RestController, @GetMapping, @RequestBody etc. work.

    implementation("org.springframework.boot:spring-boot-starter-security")
    // Bundles: Spring Security filter chain, password encoding (BCrypt),
    // session management, CSRF protection, and role-based access control.
    // The moment this is on the classpath, ALL endpoints require auth by default.
    // You'll configure exceptions (public routes, JWT filter) in a SecurityConfig class.

    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    // Bundles: Hibernate ORM + Spring Data + HikariCP connection pool.
    // Hibernate maps your @Entity classes to database tables automatically.
    // Spring Data gives you repository interfaces — you define the interface,
    // Spring generates the SQL implementation:
    //   interface UserRepository : JpaRepository<User, Long>
    //   fun findByEmail(email: String): User?  ← Spring writes the SQL for you

    implementation("org.springframework.boot:spring-boot-starter-websocket")
    // Bundles: Spring WebSocket + STOMP messaging protocol support.
    // Enables persistent, bidirectional connections between server and browser.
    // Used for: live chat, real-time notifications, collaborative editing.
    // HTTP is request-response (client always initiates).
    // WebSocket is a persistent tunnel (either side can send at any time).

    implementation("org.springframework.boot:spring-boot-starter-actuator")
    // Exposes production-ready monitoring endpoints out of the box:
    //   GET /actuator/health  → { status: "UP" } — used by load balancers
    //   GET /actuator/metrics → JVM memory, CPU, request counts
    //   GET /actuator/info    → build version, git commit hash
    // Zero code required — just having this dependency enables the endpoints.

    implementation("org.springframework.boot:spring-boot-starter-validation")
    // Adds Hibernate Validator (JSR-380 implementation).
    // Lets you annotate DTOs with constraints:
    //   @NotBlank, @Email, @Size(min=8, max=100), @Pattern(regexp="...")
    // Pair with @Valid on controller params to auto-validate incoming request bodies.
    // Validation errors automatically return a 400 Bad Request with field details.

    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    // Bundles: Lettuce (async Redis client) + Spring Data Redis.
    // Redis is an in-memory key-value store — extremely fast (sub-millisecond reads).
    // Used in this project for:
    //   - Caching expensive DB queries
    //   - Storing JWT refresh tokens (with TTL/expiry)
    //   - Rate limiting (increment a counter per user per minute)
    //   - WebSocket pub/sub (broadcast messages across server instances)

    // =========================================================================
    // DATABASE DRIVER
    // =========================================================================

    runtimeOnly("org.postgresql:postgresql")
    // The PostgreSQL JDBC driver — the low-level wire protocol connector.
    // `runtimeOnly` because you NEVER import Postgres classes directly in your code.
    // Your code talks to Hibernate's abstractions; Hibernate talks to this driver;
    // this driver talks to the actual Postgres database over the network.
    // Swapping databases (e.g., to MySQL) = swap this one line + update application.yml.

    // =========================================================================
    // LOMBOK — Compile-time Java boilerplate eliminator
    // =========================================================================

    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    // `compileOnly` = present during compilation, NOT in the final JAR (it's done its job by then).
    // `annotationProcessor` = runs Lombok's processor during the javac compilation phase.
    //
    // What Lombok generates for you at compile time:
    //   @Getter / @Setter      → generates getters and setters for all fields
    //   @Data                  → @Getter + @Setter + @ToString + @EqualsAndHashCode
    //   @Builder               → generates a builder pattern (User.builder().name("x").build())
    //   @RequiredArgsConstructor → constructor for all `final` fields (used with Spring DI)
    //   @NoArgsConstructor     → empty constructor (required by JPA)
    //   @Slf4j                 → injects `private static final Logger log = ...`
    //                            so you can just write: log.info("something happened")
    //
    // Without Lombok, a simple User entity would need ~60 lines of getters/setters/constructors.
    // With Lombok, 3 annotations handle it all.

    // =========================================================================
    // MAPSTRUCT — Compile-time object mapper
    // =========================================================================

    implementation("org.mapstruct:mapstruct:$mapstructVersion")
    annotationProcessor("org.mapstruct:mapstruct-processor:$mapstructVersion")
    // MapStruct solves a universal backend problem:
    // Your @Entity (DB model) and your DTO (API response) are DIFFERENT classes.
    // You don't want to expose raw DB entities via your API (security + coupling).
    //
    // You define a mapper interface:
    //   @Mapper(componentModel = "spring")
    //   interface UserMapper {
    //       UserResponseDTO toDTO(User user)
    //       User toEntity(UserCreateDTO dto)
    //   }
    //
    // MapStruct's annotation processor reads this at compile time and generates:
    //   UserResponseDTOImpl { dto.setName(user.getName()); dto.setEmail(...); ... }
    //
    // Unlike reflection-based mappers (ModelMapper), MapStruct generates
    // plain Java code — zero runtime overhead, full type safety, compile-time errors
    // if fields don't match instead of silent runtime failures.

    annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")
    // CRITICAL ordering fix for using Lombok + MapStruct together.
    //
    // The problem: Both run as annotation processors in the same compilation phase.
    // MapStruct needs to call getters/setters to generate mappers.
    // Lombok generates those getters/setters.
    // If MapStruct runs BEFORE Lombok, it sees no getters → generates broken code.
    //
    // This binding artifact tells the compiler: run Lombok first, THEN MapStruct.
    // Without this line, you get cryptic "no property named X" errors at compile time.

    // =========================================================================
    // JJWT — JSON Web Token library
    // =========================================================================

    implementation("io.jsonwebtoken:jjwt-api:$jjwtVersion")
    // The public-facing API — the only JJWT classes you'll ever import in your code:
    //   Jwts.builder()           → create and sign a new JWT
    //   Jwts.parser()            → verify and parse an incoming JWT
    //   Claims                   → the payload (userId, roles, expiry) extracted from a token
    //
    // JWT flow in this app:
    //   1. User logs in with username/password
    //   2. Server validates credentials, creates JWT signed with a secret key
    //   3. Client stores JWT, sends it in every request: Authorization: Bearer <token>
    //   4. Server verifies signature on every request — no DB lookup needed for auth

    runtimeOnly("io.jsonwebtoken:jjwt-impl:$jjwtVersion")
    // The actual implementation of jjwt-api interfaces.
    // `runtimeOnly` — you never import these classes. They're loaded automatically
    // by Java's ServiceLoader mechanism at runtime. This is intentional API design:
    // your code is decoupled from the implementation details.

    runtimeOnly("io.jsonwebtoken:jjwt-jackson:$jjwtVersion")
    // Jackson integration for JJWT — handles serializing JWT claims (the payload)
    // to/from JSON. Since Jackson is already on the classpath via spring-boot-starter-web,
    // this just wires JJWT to use it.

    // =========================================================================
    // TESTING
    // =========================================================================

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    // The all-in-one testing bundle. Includes:
    //   JUnit 5          → @Test, @BeforeEach, @ParameterizedTest
    //   Mockito          → mock dependencies, verify interactions
    //   AssertJ          → fluent assertions: assertThat(result).isEqualTo(expected)
    //   @SpringBootTest  → loads the full application context for integration tests
    //   @WebMvcTest      → loads only the web layer (faster, for controller tests)
    //   MockMvc          → simulate HTTP requests without a running server

    testImplementation("org.springframework.security:spring-security-test")
    // Adds Security-specific test helpers:
    //   @WithMockUser(username="test", roles=["ADMIN"])  → simulate an authenticated user
    //   SecurityMockMvcRequestPostProcessors              → attach JWT/auth to MockMvc requests
    // Without this, every controller test would return 401 Unauthorized.

    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    // The JUnit 5 engine that actually discovers and runs @Test methods.
    // `testRuntimeOnly` = only needed when executing tests, not when compiling them.
}

tasks.withType<Test> {
    useJUnitPlatform()
    // Tells Gradle to use JUnit Platform (JUnit 5) as the test runner.
    // Without this line, Gradle defaults to JUnit 4 and won't find your @Test methods.
    // JUnit Platform is the launcher layer; JUnit Jupiter is the JUnit 5 API on top of it.
}


// =============================================================================
// HOW THIS FILE IS EXECUTED
// =============================================================================
//
// You never run `gradle` directly. Always use the wrapper:
//
//   ./gradlew <task>
//
// The wrapper (gradlew shell script) reads gradle/wrapper/gradle-wrapper.properties,
// downloads the exact pinned Gradle version if not cached, then executes your task.
// This guarantees every developer and CI server uses the identical Gradle version.
//
// COMMON TASKS:
//   ./gradlew bootRun          Start the Spring Boot app locally (port 8080 by default)
//   ./gradlew build            Compile + test + package into a JAR (full pipeline)
//   ./gradlew test             Run all tests in src/test/
//   ./gradlew bootJar          Package into a fat/uber JAR for deployment
//   ./gradlew clean            Delete the build/ output directory
//   ./gradlew dependencies     Print the full dependency tree (see what's actually downloaded)
//
// =============================================================================
// FULL BUILD LIFECYCLE (what ./gradlew build actually does, in order)
// =============================================================================
//
//  1. CONFIGURE
//     Gradle reads this file. Evaluates plugins, dependencies, task config.
//
//  2. DOWNLOAD
//     Checks ~/.gradle/caches/ for each dependency.
//     Any missing JARs are fetched from mavenCentral().
//     You asked for 9 starters — Gradle actually downloads ~150 JARs
//     because each library has its own transitive dependencies.
//
//  3. ANNOTATION PROCESSING (runs before javac)
//     Lombok scans your source files for @Data, @Builder, @Slf4j etc.
//       → Generates getter/setter/constructor/logger source files
//     MapStruct scans for @Mapper interfaces (after Lombok, per the binding above)
//       → Generates concrete mapper implementation classes
//     All generated files land in: build/generated/sources/
//
//  4. COMPILE
//     javac compiles your source files + all Lombok/MapStruct generated files.
//     Compiled .class files go to: build/classes/java/main/
//
//  5. TEST
//     Compiles test sources, runs all @Test methods.
//     Fails the entire build if any test fails.
//     HTML report generated at: build/reports/tests/test/index.html
//
//  6. PACKAGE
//     The `bootJar` task (from spring-boot plugin) packages:
//       - Your compiled .class files
//       - ALL ~150 dependency JARs
//       into ONE self-contained fat JAR.
//     Output: build/libs/nexus-0.0.1-SNAPSHOT.jar  (~50-80 MB typically)
//
//  7. DONE
//     Deploy that single JAR anywhere Java 21 is installed:
//       java -jar build/libs/nexus-0.0.1-SNAPSHOT.jar
//     It contains your code + Tomcat + all libraries. No app server needed.
//
// =============================================================================
// THE build/ DIRECTORY (generated output — never commit to git)
// =============================================================================
//
//  build/
//  ├── classes/          ← compiled .class bytecode files
//  ├── generated/        ← Lombok + MapStruct generated source files
//  ├── libs/
//  │   └── nexus-0.0.1-SNAPSHOT.jar  ← your deployable application
//  ├── reports/
//  │   └── tests/index.html          ← open in browser to see test results
//  └── tmp/              ← intermediate build files
//
//  This entire folder is in .gitignore.
//  `./gradlew clean` deletes it. `./gradlew build` recreates it from scratch.
//
// =============================================================================