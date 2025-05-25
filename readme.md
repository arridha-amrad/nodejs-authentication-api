# 🔐 Authentication API

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-FF7F50?style=flat&logo=express&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-00BFFF?style=flat&logo=docker&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-DC143C?style=flat&logo=jest&logoColor=white) ![Swagger](https://img.shields.io/badge/swagger-47A248?style=flat&logo=swagger&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-9ACD32?style=flat&logo=json-web-tokens&logoColor=white) ![OAuth2](https://img.shields.io/badge/OAuth-FFD700?style=OAuth2&logo=oauth&logoColor=white) [![Nodemailer](https://img.shields.io/badge/Nodemailer-47A248?style=flat&logo=gmail&logoColor=white)](https://nodemailer.com/about/)

_This is a robust Authentication API supporting multiple login methods: Credentials (email/password), Google, and GitHub OAuth. It includes JWT token rotation, has been tested with Jest, and comes with Swagger documentation._

---

### 🚀 Features

- SignUp
- Email Verification
- Resend Verification Code
- Login (credentials)
- Get Auth User
- Refresh Token (with token rotation)
- Logout
- Forgot Password
- Reset Password
- Google OAuth
- GitHub OAuth

### 🌐 .env.dev | .env.test

provide these files at your project root

```
DB_URI=
CLIENT_BASE_URL=
BASE_URL=
API_VERSION=
PORT=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_USER=
JWT_SECRET=your_jwt_secret
```

### 🔑 How to Generate JWT_SECRET

```
openssl rand -base64 64
```

### 📦 Installation

```
git clone https://github.com/arridha-amrad/nodejs-authentication-api.git
cd nodejs-authentication-api
npm install
```

### 🧪 Running Tests

This project includes unit tests and integration tests (which require a running MongoDB instance). Make sure your MongoDB service is running locally or available via the DB_URI in your .env.test file.

```
npm run test
```

### 📚 API Documentation

```
http://localhost:5000/api/v1/docs
```
