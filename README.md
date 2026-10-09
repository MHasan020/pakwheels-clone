# GaadiLife - Car Marketplace

A full-stack car marketplace web app. Sellers post car ads, admins review them, and buyers browse, save favorites and message sellers. It also has an AI chatbot that answers questions about the website and car buying.

This is a portfolio / practice project.

## Features

- **Three roles:** Buyer, Seller and Admin, each with different permissions (enforced in both the UI and the backend)
- **Browse and search:** search by keyword and filter by brand, city and price range
- **Sellers:** post ads with details and photos, edit ads, add or delete photos, and track the status of each ad (pending, approved, rejected) in "My Ads"
- **Admin panel:** approve or reject new ads, remove approved ads, and see all users with their roles
- **Favorites and messages:** buyers can save cars and chat with sellers
- **Authentication:** register, login with JWT tokens, forgot / reset password (one-time link that expires in 30 minutes), show / hide password
- **AI chatbot:** a floating chat assistant (Google Gemini API) that only answers car and website questions, available to logged-in users
- **Welcome page:** new users choose whether they are a Buyer or a Seller before registering

## Tech Stack

| Part | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Python, FastAPI, Uvicorn, SQLAlchemy, Pydantic |
| Auth and security | JWT (python-jose), password hashing (passlib + bcrypt), role checks, CORS |
| Database | MySQL (PyMySQL) |
| AI | Google Gemini API (REST) |

## Project Structure

```
pakwheels_clone/
  pakwheels-backend/
    app/
      core/        security: JWT and password hashing
      models/      SQLAlchemy models
      routers/     auth, cars, meta, admin, messages, chat
      schemas/     Pydantic schemas
      uploads/     uploaded car images (not tracked by Git)
      database.py  database connection
      main.py      FastAPI app
    .env.example   example environment variables
    requirements.txt
  pakwheels-frontend/
    src/
      components/  Navbar, PasswordInput, ChatWidget
      pages/       Home, Login, Register, PostAd, EditAd, MyAds, AdminPanel, ...
      services/    api.js (Axios setup)
      App.jsx      routes
```

## Getting Started

### Prerequisites

- Python 3.10 or newer
- Node.js (current LTS)
- MySQL

### 1. Database

Create the database, then import the table structure and the starter data (cities, brands and car models):

```
mysql -u root -p -e "CREATE DATABASE pakwheels_clone"
mysql -u root -p pakwheels_clone < database/schema.sql
mysql -u root -p pakwheels_clone < database/seed.sql
```

On Windows, run these in Command Prompt (PowerShell does not support the `<` redirection), or open `database/schema.sql` and `database/seed.sql` in MySQL Workbench and run them one after the other.

### 2. Backend

```
cd pakwheels-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `pakwheels-backend` (use `.env.example` as a guide):

```
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.8-flash
SECRET_KEY=a-long-random-secret
DATABASE_URL=mysql+pymysql://root:your-password@localhost:3306/pakwheels_clone
```

If your MySQL password has special characters, URL-encode them (for example `@` becomes `%40`).

Run the server:

```
uvicorn app.main:app --reload
```

The API runs at http://localhost:8000 and the interactive API docs are at http://localhost:8000/docs.

### 3. Frontend

```
cd pakwheels-frontend
npm install
npm run dev
```

The app runs at http://localhost:5173. The backend address is set in `src/services/api.js`.

### 4. Create an admin user

Admins cannot be created from the registration form (on purpose). Register a normal account, then run this in MySQL:

```
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Log out and log in again to see the Admin panel.

## Main API Endpoints

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Cars | `GET /cars/`, `POST /cars/`, `GET /cars/{id}`, `PUT /cars/{id}`, `DELETE /cars/{id}`, `GET /cars/my/ads`, `GET /cars/my/favorites` |
| Images and favorites | `POST /cars/{id}/images/upload`, `GET /cars/{id}/images`, `DELETE /cars/images/{image_id}`, `POST` and `DELETE /cars/{id}/favorite` |
| Admin | `GET /admin/pending`, `GET /admin/approved`, `GET /admin/users`, `PUT /admin/cars/{id}/approve`, `PUT /admin/cars/{id}/reject` |
| Messages | `POST /messages/`, `GET /messages/inbox`, `GET /messages/car/{car_id}/with/{other_user_id}` |
| Chatbot | `POST /chat/` |
| Meta | `GET /cities`, `GET /brands`, `GET /brands/{id}/models` |

## Screenshots
![Home page](docs/screenshots/home.png)

![Admin panel](docs/screenshots/admin.png)

![Chatbot](docs/screenshots/chatbot.png)

## Notes and Limitations

- The password reset link is printed in the backend console. Sending real emails is not implemented yet.
- Uploaded images are stored on the local disk (`app/uploads`).
- The chatbot uses the Gemini free tier, which has rate limits and may be busy at times.
- The app is not deployed yet and is intended as a demo.

## Author

Built by Muhammad Hasan as a full-stack practice project.