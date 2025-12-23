# Aharam Tuition Management System

## Project Overview
A web-based Tuition Management System for **Aharam High Standard College** with a Tamil user interface.
- **Frontend**: Next.js 14, Tailwind CSS, Green Theme.
- **Backend**: Spring Boot 3, PostgreSQL, JWT Security.

## Prerequisites
- **Node.js**: v18 or higher.
- **Java**: JDK 17 or higher.
- **PostgreSQL**: Running locally on port 5432.
  - Database Name: `aharam_db`
  - Username: `postgres`
  - Password: `password` (Update `backend/src/main/resources/application.properties` if different)

## Getting Started

### 1. Database Setup
Create the database in PostgreSQL:
```sql
CREATE DATABASE aharam_db;
```

### 2. Backend Setup
Navigate to the backend directory and run the application:
```bash
cd backend
./mvnw spring-boot:run
```
The backend will run on `http://localhost:8080`.
The default Super Admin credentials are:
- **Username**: `admin`
- **Password**: `password`

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:3000`.

## Features Implemented
- **Landing Page**: Animations, Vision/Mission, Course links.
- **Login Page**: Role-based login UI.
- **Dashboard**: Placeholder for authenticated users.
- **Theme**: Premium Green colors with Tamil fonts.
