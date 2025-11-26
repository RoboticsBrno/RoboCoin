# Robocoin App Features

This document provides a detailed overview of the features available in the Robocoin application. The application is a web-based platform for managing virtual economies within camps, with roles for global managers, camp-specific users, and administrators.

## 1. Global Features & Authentication

These features are available to all users before they enter a specific camp.

### 1.1. Manager Login

- **URL:** `/login`
- **Description:** A dedicated login page for global managers who oversee multiple camps.

### 1.2. Manager Signup

- **URL:** `/signup`
- **Description:** A signup page for new global managers. This is likely restricted to a specific set of users.

## 2. Manager-Specific Features

Once logged in, a global manager has access to tools for creating and managing camps.

### 2.1. Create Camp

- **URL:** `/(manager)/create-camp`
- **Description:** A form that allows managers to create a new camp. This involves providing details about the camp, which will then have its own unique URL and isolated environment.

### 2.2. Edit Camp

- **URL:** `/(manager)/edit-camp/[camp_url]`
- **Description:** After a camp is created, managers can modify its details through this page.

### 2.3. Add Co-Managers

- **URL:** `/(manager)/add-managers/[camp_url]`
- **Description:** Managers can grant managerial permissions for a specific camp to other users.

### 2.4. Manage Camp Users

- **URL:** `/(manager)/manage-users/[camp_url]`
- **Description:** A dashboard for managers to view and manage all users within a specific camp.

## 3. Camp-Specific Features

Each camp has its own dedicated space with features for participants (users), camp administrators (org), and camp managers. The camp is accessed through a unique URL: `/[camp_url]`.

### 3.1. Camp Authentication

- **Login:** `/[camp_url]/login` - A login page for users of a specific camp.
- **Signup:** `/[camp_url]/signup` - A signup page for new users to join a camp.

### 3.2. User Features

These pages are for the regular users/participants of a camp.

#### 3.2.1. User Dashboard/Home

- **URL:** `/[camp_url]`
- **Description:** The main landing page for a user after logging into a camp. It likely displays a summary of their balance, recent activities, and navigation to other features.

#### 3.2.2. Achievements

- **URL:** `/[camp_url]/(user)/achievements`
- **Description:** A page where users can view a list of all achievements they have earned within the camp.

#### 3.2.3. My Items (Inventory)

- **URL:** `/[camp_url]/(user)/items`
- **Description:** Displays all the virtual items that a user currently owns.

#### 3.2.4. Marketplace

- **Marketplace Home:** `/[camp_url]/(user)/marketplace`
    - **Description:** The central hub for the marketplace, where users can see items listed for sale by other users.
- **Sell an Item:** `/[camp_url]/(user)/marketplace/add`
    - **Description:** A form for users to list one of their own items for sale on the marketplace.
- **View Offers:** `/[camp_url]/(user)/marketplace/offers`
    - **Description:** A page to view offers made on items.

#### 3.2.5. Transaction History

- **URL:** `/[camp_url]/(user)/transactions`
- **Description:** A detailed log of all the user's past transactions, including transfers, purchases, and earnings.

#### 3.2.6. Transfer

- **URL:** `/[camp_url]/(user)/transfer`
- **Description:** A form that allows a user to transfer virtual currency to another user within the same camp.

### 3.3. Camp Organization/Admin Features

These features are for camp-level administrators, who are responsible for managing the camp's economy and user engagement.

#### 3.3.1. Achievement Table

- **URL:** `/[camp_url]/org/achievement-table`
- **Description:** A comprehensive table view of all available achievements in the camp, possibly showing which users have earned them.

#### 3.3.2. Manage Achievements

- **Achievements Dashboard:** `/[camp_url]/org/achievements`
    - **Description:** The main page for managing camp achievements.
- **Create New Achievement:** `/[camp_url]/org/achievements/new`
    - **Description:** A form for creating new achievements that can be earned by users.
- **Grant Achievement to User:** `/[camp_url]/org/achievements/to-user`
    - **Description:** A tool for manually awarding a specific achievement to a user.

### 3.4. High-Level Camp Admin Features

These features are for administrators with higher privileges within a camp.

#### 3.4.1. User Management

- **Manage Users Dashboard:** `/[camp_url]/admin/manage-users`
    - **Description:** A powerful dashboard for managing all users in the camp.
- **Actions:**
    - **Create User:** `.../new`
    - **Edit User:** `.../edit`
    - **Delete User:** `.../delete`

## 4. Technical Features & Infrastructure

### 4.1. API Layer

The application uses a comprehensive REST API built with Next.js API Routes to handle all backend logic. Key endpoints include:

- `api/auth`: User authentication.
- `api/camps`: Camp information.
- `api/create-camp`: Camp creation.
- `api/manager`: Endpoints for manager actions.
- `api/achievements`, `api/balance`, `api/inventory`, `api/items`, `api/marketplace`, `api/transactions`, `api/transfer`: Endpoints for core user and economic activities.

### 4.2. API Documentation

- **URL:** `/api-docs`
- **Description:** The application includes self-hosted Swagger/OpenAPI documentation for its API, making it easy for developers to understand and interact with the available endpoints.

### 4.3. Role-Based Access Control (RBAC)

- The application has a clear role-based system, enforced through middleware and frontend providers (`RoleProvider.tsx`).
- The roles appear to be:
    - **Global Manager:** Manages camps.
    - **Camp User:** Participates in a camp's economy.
    - **Camp Org/Admin:** Manages a specific camp's settings and users.

### 4.4. Database

- **Prisma:** The application uses Prisma as its Object-Relational Mapper (ORM) to interact with the database, defined in `prisma/schema.prisma`. This provides a type-safe way to manage data.

### 4.5. Frontend Components

The UI is built with React and Next.js, using a set of reusable components found in `src/components/`. This includes:

- **Forms:** A suite of standardized form components (`FormInput`, `FormSelect`, etc.) for consistent user input.
- **Cards:** `Card.tsx` and `MenuCard.tsx` for displaying information in a structured way.
- **UI Elements:** `Button`, `Header`, `Loader`, `PageTitle`, and `Toast` for a consistent user experience.
