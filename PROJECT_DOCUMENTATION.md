# Eventura - Project Documentation & Production Roadmap

## 1. Project Overview

**Eventura** appears to be a platform connecting Service Providers (for events) with Clients. It facilitates pitching, portfolios, reviews, and payments.

### Tech Stack

#### Backend (`full_eventura_backend`)
- **Framework**: Spring Boot 3.4.5 (Java 17)
- **Database**: MySQL (Hibernate/JPA)
- **Security**: Spring Security + JWT (Stateless)
- **Build Tool**: Maven
- **Key Dependencies**: Spring Web, Spring Data JPA, Lombok, Java Mail, JJWT.

#### Frontend (`full_eventura_frontend`)
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **UI Library**: Shadcn UI (based on Radix UI & Tailwind CSS)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios

---

## 2. Current Architecture Stats

### Key Data Models (Entities)
- **Users**: Admin, Client, Provider roles.
- **Service Providers**: Profiles linked to Users.
- **Portfolios**: Showcases of work.
- **Pitches**: Proposals sent to clients?
- **Reviews**: Feedback system.
- **Payments**: Transaction tracking.

### Code Structure
- **Backend**: Standard Layered Architecture (`Controller` -> `Service` -> `Repository`).
- **Frontend**: Feature-based organization (`components`, `pages`, `services`, `hooks`).

---

## 3. Production Readiness Assessment

This is a strong "First Year" project. The code structure is clean, modern libraries are used (Shadcn, React Query), and the backend follows standard conventions. However, several critical gaps exist that prevent it from being "Production Ready".

### 🟢 Critical Issues (Fixed)

1.  **JWT Secret Key Instability**
    - **Status**: ✅ **Fixed**.
    - **Solution**: Moved secret to `application.properties` with environment variable overrides. `JwtConfig` now correctly reads this persistent value.

2.  **Hardcoded Credentials**
    - **Status**: ✅ **Fixed**.
    - **Solution**: Database credentials now use environment variables (`${DB_USERNAME}`) with safe defaults for local dev.

3.  **Missing API Documentation**
    - **Status**: ✅ **Fixed**.
    - **Solution**: Added `springdoc-openapi-starter-webmvc-ui`. Docs available at `/swagger-ui/index.html` when running.

4.  **No Docker Configuration**
    - **Status**: ✅ **Fixed**.
    - **Solution**: Added `Dockerfile` and `docker-compose.yml`.

### 🟡 Improvement Areas (Should Fix)

1.  **Testing**:
    - **Current State**: Dependencies exist (`spring-boot-starter-test`), but test coverage is likely near zero.
    - **Fix**: Add Unit Tests for Services and Integration Tests for Controllers.

2.  **Error Handling**:
    - **Current State**: Basic `GlobalExceptionHandler` exists (good!).
    - **Fix**: Ensure meaningful error codes (not just 500 or 400) are returned to the frontend for better UI feedback.

3.  **CORS Configuration**:
    - **Current State**: `application.properties` has commented out CORS config.
    - **Fix**: Ensure CORS is strictly defined for the production domain, not just `*` or `localhost`.

---

## 5. Operations & Configuration Guides

### How to Change the Sender Email (Gmail)

To change the email address that sends notifications (`sunny@eventura.com` / `sanixu.hasho@gmail.com`), you cannot use your regular Gmail password. You must use an **App Password**.

**Step 1: Prepare your Google Account**
1.  Go to your [Google Account Security Page](https://myaccount.google.com/security).
2.  Enable **2-Step Verification** (if not already enabled).
3.  Search for **"App passwords"** in the search bar at the top (or look under "2-Step Verification").

**Step 2: Generate Password**
1.  Select **App**: "Mail".
2.  Select **Device**: "Other (Custom name)" -> Name it "Eventura".
3.  Click **Generate**.
4.  Google will give you a 16-character code (e.g., `irhk ltjd mahj jyav`). **Copy this.**

**Step 3: Update Eventura**
Open `full_eventura_backend/src/main/resources/application.properties` and update these lines:

```properties
spring.mail.username=YOUR_NEW_EMAIL@gmail.com
spring.mail.password=YOUR_16_CHAR_APP_PASSWORD
```

*Note: If using Docker, update these values in `docker-compose.yml` instead.*

### Using a Custom Domain Email (e.g., support@myeventura.com)

If you buy a domain, you will need an **Email Hosting Provider** (like Google Workspace, Zoho Mail, Outlook, or your registrar's cPanel).

**1. Get SMTP Details**
Login to your email provider's settings and look for "SMTP Settings". You need:
*   **SMTP Host**: e.g., `smtp.office365.com` or `smtp.zoho.com`
*   **SMTP Port**: Usually `587` (TLS) or `465` (SSL)
*   **Username**: Your full email (e.g., `support@myeventura.com`)
*   **Password**: Your email password (or App Password)

**2. Update Configuration**
Update `application.properties` with your provider's details:

```properties
# Example for Zoho Mail
spring.mail.host=smtp.zoho.com
spring.mail.port=587
spring.mail.username=support@myeventura.com
spring.mail.password=YOUR_PASSWORD
```

**Common SMTP Providers:**
*   **Outlook/Office365**: `smtp.office365.com` (Port 587)
*   **Zoho Mail**: `smtp.zoho.com` (Port 587)
*   **Google Workspace**: `smtp.gmail.com` (Port 587) - requires "Less Secure Apps" or App Password.

### How to Create an Admin User

By default, the registration page only allows creating **Client** or **Provider** accounts. To create an **Admin**:

1.  **Register a new account** (e.g., `myadmin@eventura.com`) as a Client.
2.  **Access the Database** (using MySQL Workbench, DBeaver, or command line).
3.  **Run this SQL command**:

```sql
UPDATE Users 
SET role = 'ADMIN' 
WHERE email = 'myadmin@eventura.com';
```

4.  **Log out and Log back in**. You will now have Admin privileges.

---

## 4. Implementation Plan (How to reach Production Level)

### Step 1: Secure Configuration
1.  **Modify `application.properties`**:
    ```properties
    spring.datasource.username=${DB_USER}
    spring.datasource.password=${DB_PASSWORD}
    jwt.secret=${JWT_SECRET}
    ```
2.  **Update `JwtConfig.java`**:
    Inject the secret from properties instead of generating a random one.

### Step 2: Add API Documentation
1.  Add dependency to `pom.xml`:
    ```xml
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.3.0</version>
    </dependency>
    ```
2.  Access docs at `http://localhost:8080/swagger-ui/index.html`.

### Step 3: Containerization (Docker)
Create a `docker-compose.yml` in the root:
```yaml
version: '3.8'
services:
  mysqldb:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: EVENTURA
    ports:
      - "3307:3306"
  backend:
    build: ./full_eventura_backend
    ports:
      - "8080:8080"
    environment:
      DB_USER: root
      DB_PASSWORD: root
      JWT_SECRET: verysecretkey_at_least_64_bytes_long
    depends_on:
      - mysqldb
```

### Step 4: Testing
Run `mvn test` and aim for at least 50% coverage on critical services (Payment, Auth).
