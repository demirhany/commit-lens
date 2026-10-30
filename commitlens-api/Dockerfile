# Build Stage
FROM eclipse-temurin:21.0.1_12-jdk-alpine AS builder
WORKDIR /app

# Copy maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B

# Copy source code and build
COPY src src
RUN ./mvnw clean package -DskipTests -Dcheckstyle.skip=true

# Run Stage
FROM eclipse-temurin:21.0.1_12-jre-alpine
WORKDIR /app

# Create non-root user
RUN adduser -D -u 1001 commitlens

# Copy built JAR
COPY --from=builder /app/target/*.jar app.jar

# Optimize JVM for containers and run as non-root user
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
USER commitlens

EXPOSE 8100
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
