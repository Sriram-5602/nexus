FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY build/libs/nexus-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
