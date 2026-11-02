# CommitLens - Production Deployment Guide

This directory allows you to quickly deploy and run CommitLens without cloning or building the source code, using official pre-built images from GitHub Container Registry (GHCR).

## Contents

- `docker-compose.prod.yml`: Docker Compose file containing PostgreSQL 16, Redis, CommitLens Backend (API), and CommitLens Frontend services.
- `.env.template`: Environment variables template.

## Quick Start

### 1. Configure Environment Variables

Copy `.env.template` to `.env`:

```bash
cp .env.template .env
```

Open `.env` and configure your settings, especially the database password (`POSTGRES_PASSWORD`) and optional integration tokens (GitHub, Bitbucket, Jira).

### 2. Start the Containers

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 3. Verify Services

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

### 4. Access the Application

- **Frontend (Web UI)**: [http://localhost:3000](http://localhost:3000)
- **Backend (API)**: [http://localhost:8100](http://localhost:8100)

### 5. Stopping the Services

To stop running containers:
```bash
docker compose -f docker-compose.prod.yml down
```

To stop containers and remove persistent database and cache volumes:
```bash
docker compose -f docker-compose.prod.yml down -v
```
