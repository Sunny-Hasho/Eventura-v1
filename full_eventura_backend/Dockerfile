# syntax=docker/dockerfile:1
# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
COPY settings.xml .
# Skip tests for faster build
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests -s settings.xml -Dmaven.wagon.http.retryHandler.count=3

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/target/eventura-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
