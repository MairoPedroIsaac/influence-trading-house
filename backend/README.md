# 🧠 Influence Trading House Backend

Welcome to the backend repository for the **Influence Trading House Website**. This project serves as the backbone for managing data, handling business logic, and providing APIs for the frontend application.

Powering the future of AI-driven trading with **InfluenceX AI**

---

## 🛠️ Tech Stack

| Component          | Technology           |
|--------------------|----------------------|
| Core Framework     | Express.js           |
| Database           | PostgreSQL           |
| ORM                | Prisma               |
| Authentication     | JWT                  |
| AI Integration     | InfluenceX AI v1.0   |

---

## Features

- RESTful API for seamless communication with the frontend.
- Secure authentication and authorization mechanisms.
- Scalable architecture for handling high traffic.
- Database integration for efficient data storage and retrieval.
- Comprehensive error handling and logging.
- Automated trade simulation.
- Real-time profit calculation.
- Status transition management.
- MT5-compatible infrastructure (coming soon).
- AI model hooks for decision logic.

---

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) or any other database used in the project

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/influence-trading-house-backend.git
cd influence-trading-house-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up the Database
```bash
npx prisma migrate dev --name init
```

### 4. Set Up Environment Variables

Create a `.env` file in the root directory and configure the required variables:

```env
PORT=5000
DATABASE_URL=your-database-url
JWT_SECRET=your-secret-key
```

### 5. Start the Development Server
```bash
npm run dev
```

---

## 📂 Project Structure

```plaintext
backend/
├── prisma/              # Prisma schema & migrations
├── src/
│   ├── controllers/     # Route logic
│   ├── middleware/      # Auth, error handlers
│   ├── models/          # Prisma models
│   ├── routes/          # API routes
│   └── utils/           # Helpers, validators
├── .env
├── index.js
├── package.json
└── README.md
```

---
## API Documentation

Detailed API documentation is available in the [API Docs](./API_DOCS.md).

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push the branch.
4. Submit a pull request.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Contact

For inquiries or support, please contact:
- **Email**: support@influencetradinghouse.com
- **Website**: [Influence Trading House](https://www.influencetradinghouse.com)