# Plastik-HB

Plastik-HB is a modern web application for managing product catalogs, banners, homepage content, categories, and contact information for the Plastik HB business.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
  - [Running Tests](#running-tests)
- [API Endpoints](#api-endpoints)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Secure Admin Authentication**
- **Product Management**: Create, Read, Update, Delete (CRUD)
- **Category Management**
- **Banner Management**
- **Homepage Editing**: Achievements, Featured Products
- **Contact Information Management**
- **File/Image Uploads**
- **Analytics Dashboard**

---

## Tech Stack

- **Backend**: Node.js, Express, Sequelize, PostgreSQL
- **Frontend**: Vue 3, Vuetify (see [`Plastik-HB-FE`](./Plastik-HB-FE) folder)
- **Testing**: Jest

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) & npm
- [PostgreSQL](https://www.postgresql.org/)

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/foxroot/plastik-hb.git
   cd plastik-hb
   ```

2. **Install backend dependencies:**

   ```sh
   cd Plastik-HB-BE
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your database credentials.

4. **Run database migrations:**
   ```sh
   npm run migrate-up
   ```

### Running the App

- **Backend (Development):**
  ```sh
  cd Plastik-HB-BE
  npx tsx app.ts
  ```
- **Frontend (Development):**
  ```sh
  cd Plastik-HB-FE
  npm install
  npm run dev
  ```
- **Backend (Production):**
  ```sh
  cd Plastik-HB-BE
  npm run prod
  ```
  **Backend (Production):**
  ```sh
  cd Plastik-HB-FE
  npm run prod
  ```

### Running Tests

- **Run all tests:**
  ```sh
  npm test
  ```
- **Run coverage:**
  ```sh
  npm run test:coverage
  ```
- **Run only service tests:**
  ```sh
  npx jest __tests__/services
  ```

---

## API Endpoints

| Endpoint                  | Description              |
| ------------------------- | ------------------------ |
| `/api/authentication`     | Admin login              |
| `/api/products`           | Product CRUD             |
| `/api/categories`         | Category CRUD            |
| `/api/pages/homepage`     | Homepage management      |
| `/api/pages/tentang-kami` | About Us page management |
| `/api/contact`            | Contact info             |
| `/api/uploads`            | File/image uploads       |
| `/api/analytics`          | Analytics data           |

---

## Folder Structure

```
Plastik-HB/
├── Plastik-HB-BE/      # Backend (Express, Sequelize)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── __tests__/
│   └── app.ts
├── Plastik-HB-FE/      # Frontend (Vue 3, Vuetify)
│   └── src/
└── README.md
```

---

## Contributing

Contributions are welcome! Please follow [Conventional Commits](https://www.conventionalcommits.org/) and submit pull requests with clear descriptions.

---

> **Security Note:**  
> Always keep dependencies up-to-date and review authentication logic for vulnerabilities. Consider using [Helmet](https://helmetjs.github.io/) for Express and [OWASP guidelines](https://owasp.org/www-project-top-ten/) for
