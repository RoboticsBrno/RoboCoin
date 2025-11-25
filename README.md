# Robocoin V3

Robocoin V3 is a versatile web application designed for creating and managing community-based virtual economies. Built with Next.js and Prisma, it provides a robust platform for handling virtual currencies, user inventories, and marketplaces within specific groups or events, referred to as "camps".

## Key Features

- **Multi-Camp Architecture:** Create isolated environments ("camps"), each with its own user base, currency, and marketplace.
- **Role-Based Access Control:**
    - **Managers:** Can create new camps and assign camp managers.
    - **Admins:** Manage users, items, and settings within a specific camp.
    - **Users:** Can own currency, trade items, and participate in the camp's economy.
- **Virtual Currency System:** Full support for user balances, direct user-to-user transfers, and transaction logging.
- **Item Marketplace:** An in-camp marketplace where users can list, buy, and sell virtual items.
- **User Inventories:** Users have a personal inventory to manage the items they own.
- **Achievement System:** Award achievements to users for reaching milestones or completing tasks.
- **REST API:** A comprehensive API for programmatic interaction with the application's resources.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [MySQL](https://www.mysql.com/) / [MariaDB](https://mariadb.org/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **API Documentation:** [Swagger UI](https://swagger.io/tools/swagger-ui/)
- **Data Fetching:** [SWR](https://swr.vercel.app/)
- **Form Management:** [React Hook Form](https://react-hook-form.com/)
- **Schema Validation:** [Zod](https://zod.dev/)

## Getting Started

Follow these instructions to get a local development environment up and running.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20.x or later)
- [npm](https://www.npmjs.com/) (v10.x or later)
- A running MySQL or MariaDB instance.

### 1. Clone the Repository

```bash
git clone https://github.com/RoboticsBrno/RoboCoin.git
cd RoboCoin
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file to create your local configuration:

```bash
cp .example-env .env
```

Now, open `.env` and configure the following variables:

- `DATABASE_URL`: Your MySQL/MariaDB connection string.
    - **Format:** `mysql://USER:PASSWORD@HOST:PORT/DATABASE`
- `NEXTAUTH_SECRET`: A random string used to hash tokens. Generate one with:
    ```bash
    openssl rand -base64 32
    ```
- `NEXTAUTH_URL`: The full URL of your development server.
    - **Example:** `http://localhost:3000`

### 4. Run Database Migrations

Apply the database schema and generate the Prisma Client:

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production-ready build of the application.
- `npm run start`: Starts the production server (requires a build first).
- `npm run lint`: Lints the codebase using ESLint.

## Code Formatting

This project uses Prettier for code formatting. A shell script is provided for convenience.

```bash
./format.sh
```

## API Documentation

The application automatically generates API documentation from the backend routes. Once the development server is running, you can access the Swagger UI at [/api-docs](http://localhost:3000/api-docs).

## Deployment

For detailed instructions on deploying the application to a production environment (e.g., a Linux server with MariaDB), please refer to the [DEPLOY.md](DEPLOY.md) guide.
