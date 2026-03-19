plugins {
	id("org.gradle.toolchains.foojay-resolver-convention") version "0.9.0"
}

rootProject.name = "nexus"

// 3. Foojay plugin queries the Foojay Disco API → finds a matching JDK (Temurin) for your OS/arch
// 4. Downloads it to `~/.gradle/jdks/` → uses it for compilation
// 5. Subsequent runs reuse the cached JDK instantly Without this plugin, you'd need to install JDK 21 manually.