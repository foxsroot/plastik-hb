# Plastik-HB

Plastik-HB is a web application for managing product catalogs, banners, homepage content, categories, and contact information for the Plastik HB business.

## Features

- **Admin Authentication**
- **Product CRUD** (Create, Read, Update, Delete)
- **Category CRUD**
- **Banner Management**
- **Homepage Editing** (Achievements, Featured Products)
- **Contact Information Management**
- **File/Image Uploads**
- **Analytics Dashboard**

## Tech Stack

- **Backend:** Node.js, Express, Sequelize, PostgreSQL
- **Frontend:** Vuetify (see `Plastik-HB-FE` folder)
- **Testing:** Jest

## Getting Started

### Prerequisites

- Node.js & npm
- PostgreSQL

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/foxroot/plastik-hb.git
    cd plastik-hb
    ```

2. Install dependencies:
    ```sh
    cd Plastik-HB-BE
    npm install
    ```

3. Configure environment variables:
    - Copy `.env.example` to `.env` and fill in your database credentials.

4. Run database migrations:
    ```sh
    npm run migrate-up
    ```

### Running the App

- **Backend Development:**
    ```sh
    cd Plastik-HB-BE
    npx tsx app.ts
    ```
- **Frontend Development:**
    ```sh
    cd Plastik-HB-FE
    npm run dev
    ```
- **Backend Production:**
    ```sh
    cd Plastik-HB-BE
    npm run prod
    npm 
    ```

### Running Tests

- Run all tests:
    ```sh
    npm test
    ```
- Run coverage:
    ```sh
    npm run test:coverage
    ```
- Run only service tests:
    ```sh
    npx jest __tests__/services
    ```

## API Endpoints

- `/api/authentication` - Admin login
- `/api/products` - Product CRUD
- `/api/categories` - Category CRUD
- `/api/pages/homepage` - Homepage management
- `/api/pages/tentang-kami` - About Us page management
- `/api/contact` - Contact info
- `/api/uploads` - File/image uploads
- `/api/analytics` - Analytics data

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
├── Plastik-HB-FE/      # Frontend (React)
│   └── src/
└── README.md
```

## License

MIT

---

**For more details, see the code and comments in
