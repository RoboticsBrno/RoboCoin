# Robocoin App Features - Detailed View

This document provides a highly detailed walkthrough of the features available in the Robocoin application, structured from the perspective of a user interacting with the system. It covers forms, inputs, and expected user flows.

## 1. Global Features & Authentication

These features are available to all users who are managers before they enter a specific camp. They are primarily for "Managers" who oversee the creation and management of multiple camps.

### 1.1. Manager Login

- **URL:** `/login`
- **Purpose:** To allow existing Managers to authenticate and access their dashboard.
- **User Flow:** A user navigates to the `/login` page and is presented with a login form.

#### Login Form (`/login`)

- **Title:** "Přihlášení k manažerskému účtu" (Manager Account Login)
- **Subtitle:** "Vítejte zpět! Zadejte prosím své údaje." (Welcome back! Please enter your details.)
- **Form Inputs:**
    - **Přihlašovací jméno (Login):** A text input field for the manager's unique login name.
        - `id`: `login`
        - `name`: `login`
        - `type`: `text`
        - `autoComplete`: `login`
    - **Heslo (Password):** A password input field for the manager's password.
        - `id`: `password`
        - `name`: `password`
        - `type`: `password`
        - `autoComplete`: `current-password`
- **Actions:**
    - **Submit Button:** "Přihlásit se" (Log In). On success, the user is redirected to the main dashboard (`/`).
    - **Link to Signup:** A link with the text "Zaregistrujte se" (Sign up) directs the user to the `/signup` page.
- **Error Handling:** The form displays specific error messages for incorrect username, incorrect password, or if the user is not a manager.

### 1.2. Manager Signup

- **URL:** `/signup`
- **Purpose:** To allow new Global Managers to create an account.
- **User Flow:** A new manager navigates to the `/signup` page and fills out the registration form.

#### Signup Form (`/signup`)

- **Title:** "Vytvořit manažerský účet" (Create Manager Account)
- **Subtitle:** "Připojte se k nám! Pro začátek prosím vyplňte své údaje." (Join us! Please fill in your details to get started.)
- **Form Inputs:**
    - **Přihlašovací jméno (Login):** A text input for the desired unique login name.
        - `id`: `login`
        - `name`: `login`
        - `type`: `text`
    - **Jméno (Name):** A text input for the manager's full name.
        - `id`: `name`
        - `name`: `name`
        - `type`: `text`
    - **Heslo (Password):** A password input for the new account. Must be at least 6 characters long.
        - `id`: `password`
        - `name`: `password`
        - `type`: `password`
        - `autoComplete`: `new-password`
- **Actions:**
    - **Submit Button:** "Zaregistrovat se" (Sign Up). On successful registration and subsequent login, the user is redirected to the main dashboard (`/`).
    - **Link to Login:** A link with the text "Přihlásit se" (Log In) directs the user back to the `/login` page.
- **Error Handling:** Shows a toast notification if the registration fails (e.g., if the login name is already taken).

## 2. Manager-Specific Features

Once a Manager is logged in, they gain access to tools for creating and managing their camps.

### 2.1. Manager Dashboard

- **URL:** `/` (root)
- **Purpose:** The main landing page for a logged-in Global Manager. It provides a quick way to create a new camp and an overview of all existing camps they manage.
- **Content:**
    - A prominent "Menu Card" for "Vytvořit nový tábor" (Create New Camp) that links to the `/create-camp` page.
    - A section titled "Vaše tábory" (Your Camps) that lists all camps associated with the manager.
- **Camp Card Actions:** For each camp listed, the following actions are available as buttons:
    - **Přejít na tábor (Go to Camp):** Navigates to the camp's specific dashboard (`/[camp_url]`).
    - **Upravit tábor (Edit Camp):** Links to the camp's edit page (`/edit-camp/[camp_url]`).
    - **Přidat manažery (Add Managers):** Links to the co-manager assignment page (`/add-managers/[camp_url]`).
    - **Spravovat uživatele (Manage Users):** Links to the user assignment page (`/manage-users/[camp_url]`).

### 2.2. Create Camp

- **URL:** `/(manager)/create-camp`
- **Purpose:** Allows a manager to create a new, isolated camp environment.
- **User Flow:** The manager navigates to the create camp page and fills out a form with the camp's details.

#### Create Camp Form (`/create-camp`)

- **Title:** "Vytvořit nový tábor" (Create New Camp)
- **Subtitle:** "Vyplňte prosím podrobnosti pro vytvoření tábora." (Please fill in the details to create a camp.)
- **Form Inputs:**
    - **Název tábora (Camp Name):** A text input for the official name of the camp.
        - `id`: `name`
        - `name`: `name`
        - `type`: `text`
    - **URL tábora (Camp URL):** A text input that defines the unique URL segment for the camp (e.g., "my-summer-camp").
        - `id`: `name_url`
        - `name`: `name_url`
        - `type`: `text`
    - **Popis (Description):** An optional text input for a short description of the camp.
        - `id`: `description`
        - `name`: `description`
        - `type`: `text`
    - **Měna (Currency):** An optional text input for the three-letter code of the camp's virtual currency (e.g., "TCK", "PTS").
        - `id`: `currency`
        - `name`: `currency`
        - `type`: `text`
- **Actions:**
    - **Submit Button:** "Vytvořit tábor" (Create Camp). On success, the page redirects to the manager's dashboard (`/`).
- **Error Handling:** Shows a toast notification if camp creation fails (e.g., if the URL is not unique).

### 2.3. Edit Camp

- **URL:** `/(manager)/edit-camp/[camp_url]`
- **Purpose:** Allows a manager to modify the details of an existing camp.
- **User Flow:** The manager selects a camp to edit and is taken to this form, which is pre-filled with the camp's current data.

#### Edit Camp Form (`/edit-camp/[camp_url]`)

- **Title:** "Upravit tábor" (Edit Camp)
- **Subtitle:** "Vyplňte prosím podrobnosti pro úpravu tábora." (Please fill in the details to edit the camp.)
- **Form Inputs:**
    - The form contains the exact same inputs as the "Create Camp" form, allowing the manager to change the name, URL, description, and currency.
        - **Název tábora (Camp Name)**
        - **URL tábora (Camp URL)**
        - **Popis (Description)**
        - **Měna (Currency)**
- **Actions:**
    - **Submit Button:** "Upravit tábor" (Edit Camp). On success, a success toast is shown.
- **Error Handling:** A toast notification appears if the update fails.

### 2.4. Add Co-Managers

- **URL:** `/(manager)/add-managers/[camp_url]`
- **Purpose:** To grant or revoke camp management permissions to other Global Managers for a specific camp.
- **User Flow:** The manager selects a camp and navigates to the "Manage Managers" page. They are presented with a list of all Global Managers in the system.

#### Manage Managers Form (`/add-managers/[camp_url]`)

- **Title:** "Spravovat manažery tábora" (Manage Camp Managers)
- **Subtitle:** "Vyberte uživatele, kterým chcete udělit oprávnění manažera pro tento tábor." (Select users to whom you want to grant manager permissions for this camp.)
- **Form Inputs:**
    - **User Checkbox Group:** A list of checkboxes, one for each registered Global Manager.
        - Each checkbox is labeled with the manager's name and login (e.g., "John Doe (johndoe)").
        - The manager who is currently logged in has their own checkbox checked and disabled, as they cannot remove themselves.
        - `name`: `selectedUsers`
- **Actions:**
    - **SubmitButton:** "Aktualizovat manažery" (Update Managers). This action saves the new set of managers for the camp.
- **Data Loading:** The form fetches a list of all managers and pre-selects those already assigned to the current camp.

### 2.5. Manager: Assign Users to Camp

- **URL:** `/(manager)/manage-users/[camp_url]`
- **Purpose:** Allows a Global Manager to assign existing global users to a specific camp. This is distinct from the in-camp user management performed by camp admins.
- **User Flow:** The manager is presented with a list of all users in the system and can check which ones should be members of the specified camp.
- **Form Inputs:**
    - **User Checkbox Group:** A list of all users in the system (excluding the current manager). Each checkbox includes the user's name and login.
- **Actions:**
    - **Submit Button:** "Přiřadit vybrané uživatele" (Assign Selected Users).

## 3. Camp-Specific Features

Each camp has its own dedicated space with features for participants (users), camp administrators (org), and camp managers. The camp is accessed through a unique URL: `/[camp_url]`.

### 3.1. Camp Authentication

- **Login:** `/[camp_url]/login` - A login page for users of a specific camp.
- **Signup:** `/[camp_url]/signup` - A signup page for new users to join a camp.

#### Camp Login Form (`/[camp_url]/login`)

- **Title:** "Přihlásit se k účtu" (Log in to account)
- **Subtitle:** "Vítejte zpět! Zadejte prosím své údaje." (Welcome back! Please enter your details.)
- **Form Inputs:**
    - **Přihlašovací jméno (Login):** A text input for the user's login name.
    - **Heslo (Password):** A password input for the user's password.
- **Actions:**
    - **Submit Button:** "Přihlásit se" (Log In). On success, the user is redirected to the camp dashboard (`/[camp_url]`).
    - **Link to Signup:** "Zaregistrujte se" (Sign up) link to `/[camp_url]/signup`.

#### Camp Signup Form (`/[camp_url]/signup`)

- **Note:** This page appears to be incorrectly reusing the Manager signup form.
- **Title:** "Vytvořit manažerský účet" (Create Manager Account)
- **Form Inputs:**
    - **Přihlašovací jméno (Login)**
    - **Jméno (Name)**
    - **Heslo (Password)**
- **Actions:**
    - **Submit Button:** "Zaregistrovat se" (Sign up).

### 3.2. User Features

These pages are for the regular users/participants of a camp, available after logging into a specific camp.

#### 3.2.1. User Dashboard/Home

- **URL:** `/[camp_url]`
- **Purpose:** The main landing page for a user after logging into a camp. It serves as a menu to navigate to other features.
- **Content:** The page displays a grid of "Menu Cards". The cards displayed depend on the user's role (regular user, `is_org`, `is_admin`).
- **User-Visible Cards:**
    - **Úspěchy (Achievements):** Links to the user's achievements page.
    - **Tržiště (Marketplace):** Links to the camp's marketplace.
    - **Poslat peníze (Send Money):** Links to the transfer page.
    - **Transakce (Transactions):** Links to the user's transaction history.
    - **Vaše předměty (Your Items):** Links to the user's inventory.

#### 3.2.2. Achievements

- **URL:** `/[camp_url]/(user)/achievements`
- **Purpose:** A page where users can view a list of all achievements they have earned within the camp.
- **Content:**
    - **Title:** "Vaše úspěchy" (Your Achievements).
    - The page displays a collection of cards, where each card represents an earned achievement.
    - **Achievement Card:**
        - **Title:** The name of the achievement. If a user has more than one of the same achievement, a counter is shown (e.g., "Dobrý skutek (3x)").
        - **Description:** A brief description of the achievement.
        - **Value:** The virtual currency value associated with the achievement (e.g., "Hodnota: 10.00").
- **Data Loading:** Fetches and displays all achievements owned by the logged-in user.

#### 3.2.3. My Items (Inventory)

- **URL:** `/[camp_url]/(user)/items`
- **Purpose:** Displays all the virtual items that a user currently owns (excluding achievements).
- **Content:**
    - **Title:** "Vaše předměty" (Your Items).
    - The page displays a grid of items.
    - **Item Card:**
        - **Title:** The name of the item.
        - **Description:** A description of the item.
        - **Price:** The base price of the item.
- **Data Loading:** Fetches all items from the user's inventory.

#### 3.2.4. Marketplace

- **URL:** `/[camp_url]/(user)/marketplace`
- **Purpose:** The central hub for the marketplace, where users can see items listed for sale and navigate to other marketplace actions.
- **Content:**
    - **Title:** "Tržiště" (Marketplace).
    - **Action Cards:**
        - **Nabídnout předmět (Offer Item):** Links to the "Sell an Item" page.
        - **Zobrazit vaše nabídky (View Your Offers):** Links to the "View Offers" page.
    - **Items List:** Below the action cards, a grid displays all items currently for sale by other users. Each item card shows its title, description, price, and the name of the seller.

##### Sell an Item (`/[camp_url]/(user)/marketplace/add`)

- **Purpose:** Allows a user to list one of their own items for sale on the marketplace.
- **User Flow:** The user fills out a form to specify the item's details and price.
- **Title:** "Přidat předmět" (Add Item)
- **Subtitle:** "Vyplňte níže uvedený formulář pro přidání nového předmětu." (Fill in the form below to add a new item.)
- **Form Inputs:**
    - **Název (Title):** Text input for the item's title. (`name`: `title`, `required`)
    - **Popis (Description):** Textarea input for an optional description of the item. (`name`: `description`)
    - **Cena (Price):** Number input for the item's price. (`name`: `price`, `type`: `number`, `required`). Must be a non-negative number.
- **Actions:**
    - **Submit Button:** "Přidat předmět" (Add Item). On success, a toast message confirms the item creation.

##### View Offers (`/[camp_url]/(user)/marketplace/offers`)

- **Purpose:** Allows a user to view the status of their items listed on the marketplace.

- **Content:**
    - **Title:** "Your Offers"
    - The page displays offers in three sections:
        - **Offers still up:** Items currently for sale. Each has a "Remove" button.
        - **Sold Offers:** Items that have been sold.
        - **Offers down from Marketplace:** Items that have been removed from sale. Each has an "Add" button to relist it.
- **Item Card Actions:**
    - **Remove:** Removes the item from active marketplace listings.
    - **Add:** Relists the item on the marketplace.

##### Marketplace Item Page (`/[camp_url]/(user)/marketplace/item/[id]`)

- **Purpose:** To display the details of a single item for sale on the marketplace and allow users to purchase it.
- **Content:**
    - **Title:** The item's title.
    - **Details:** Displays the item's description, price, and the owner's name.
- **Actions:**
    - **Buy Now Button:** If the user is not the owner and can afford the item, a "Buy Now" button is displayed. Clicking it initiates the purchase. The button is disabled if the user's balance is too low.

### 3.3. Camp Organizer/Admin Features

These features are for camp-level organizers (`is_org`), who are responsible for managing the camp's economy and user engagement. They are accessible from the main camp dashboard.

#### 3.3.1. Achievement Table

- **URL:** `/[camp_url]/org/achievement-table`
- **Purpose:** A powerful tool for bulk-managing which users have been awarded which achievements (or items).
- **User Flow:** The administrator is presented with a large table where rows represent users and columns represent achievements/items. They can check or uncheck boxes to grant or revoke items in bulk.
- **Content:**
    - **Title:** "Tabulka úspěchů" (Achievement Table).
    - **The Table:** A matrix of checkboxes where rows are users and columns are items.
- **Actions:**
    - **Cell Interaction:** Toggling a checkbox grants or revokes an item for a user.
    - **Header/Row Controls:** Buttons to select/deselect all for a given user or item.
    - **Global Controls:** "Select All", "Deselect All", and "Revert" changes.
    - **Submit Button:** "Uložit změny" (Save Changes).

#### 3.3.2. Manage Achievements

- **URL:** `/[camp_url]/org/achievements`
- **Purpose:** A navigation page for managing camp achievements.
- **Content:** This page provides links to more specific actions.
- **Action Cards:**
    - **Vytvořit nový úspěch (Create New Achievement):** Links to `.../new`.
    - **Udělit úspěchy uživateli (Grant Achievements to User):** Links to `.../to-user`.
    - **Přiřadit uživatele k úspěchu (Assign Users to Achievement):** Links to `.../to-achievement`.

##### Create New Achievement (`.../org/achievements/new`)

- **Purpose:** To define a new achievement that can be awarded to users.
- **Form Inputs:**
    - **Title:** The name of the achievement (e.g., "First Place in Hackathon"). `required`
    - **Description:** An optional text description.
    - **Value:** An optional numerical value/price for the achievement.
- **Action:**
    - **Submit Button:** "Create Achievement".

##### Grant Achievements to User (`.../org/achievements/to-user`)

- **Purpose:** To grant or revoke multiple achievements for a single user.
- **User Flow:** The admin first selects a user from a dropdown. The form then loads all available achievements, with checkboxes indicating which ones the selected user currently possesses.
- **Form Inputs:**
    - **User:** A dropdown list of all camp users. `required`
    - **Achievements:** A list of checkboxes, one for each achievement in the camp.
- **Action:**
    - **Submit Button:** "Update Achievements".

##### Assign Users to Achievement (`.../org/achievements/to-achievement`)

- **Purpose:** To grant or revoke a single achievement for multiple users at once.
- **User Flow:** The admin first selects an achievement from a dropdown. The form then loads all camp users, with checkboxes indicating which users currently have that achievement.
- **Form Inputs:**
    - **Achievement:** A dropdown list of all available achievements. `required`
    - **Users:** A list of checkboxes, one for each user in the camp.
- **Action:**
    - **Submit Button:** "Update Owners".

### 3.4. High-Level Camp Admin Features

These features are for administrators with higher privileges (`is_admin`) within a camp.

#### 3.4.1. User Management

- **URL:** `/[camp_url]/admin/manage-users`
- **Purpose:** A navigation page for managing user accounts within the camp.
- **Content:** This page provides links to user management actions.
- **Action Cards:**
    - **Vytvořit nového uživatele (Create New User):** Links to `.../new`.
    - **Upravit stávajícího uživatele (Edit Existing User):** Links to `.../edit`.
    - **Smazat uživatele (Delete User):** Links to `.../delete`.

##### Create New User (`.../admin/manage-users/new`)

- **Purpose:** To create a new user account within the camp.
- **Form Inputs:**
    - **Login:** The user's unique login name. `required`
    - **Name:** The user's display name. `required`
    - **Password:** The user's password (min 6 characters). `required`
    - **Is Org:** Checkbox to grant organization-level (`is_org`) permissions.
    - **Is Admin:** Checkbox to grant admin-level (`is_admin`) permissions.
- **Action:**
    - **Submit Button:** "Create User".

##### Edit Existing User (`.../admin/manage-users/edit`)

- **Purpose:** To modify the details and roles of an existing user.
- **User Flow:** The admin selects a user from a dropdown list, which then populates a form with that user's current information.
- **Form Inputs:**
    - **User:** A dropdown list of all camp users to select from. `required`
    - **Login:** The user's login name.
    - **Name:** The user's display name.
    - **New Password:** An optional field to set a new password.
    - **Is Org:** Checkbox to manage `is_org` role.
    - **Is Admin:** Checkbox to manage `is_admin` role.
- **Action:**
    - **Submit Button:** "Save Changes".

##### Delete User (`.../admin/manage-users/delete`)

- **Purpose:** To remove a user from the camp.
- **User Flow:** The admin selects a user from a dropdown menu to target them for deletion.
- **Form Inputs:**
    - **User:** A dropdown list of all camp users. The currently logged-in admin is excluded from this list. `required`
- **Action:**
    - **Submit Button:** "Delete User". This action is styled in red to indicate a destructive operation.

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

## 5. General UI Structure

The application maintains a consistent structure defined in the root layout (`src/app/layout.tsx`).

- **Global Header:** A persistent `Header` component is displayed at the top of all pages, likely containing the main application title, navigation, and user/balance information.
- **Back Button:** A `ConditionalBackButton` component is present, which provides a navigation button to go back to the previous page where appropriate.
- **Camp-Specific Roles:** The layout for individual camps (`src/app/[camp_url]/layout.tsx`) contains logic to dynamically update the user's session with their specific roles for that camp (e.g., `is_admin`, `is_org`). This allows the UI throughout the camp to adapt and show the correct controls for that user's permission level.

## 6. Other Pages

### 6.1. API Documentation

- **URL:** `/api-docs`
- **Purpose:** To provide developers with interactive documentation for the application's backend REST API.
- **Implementation:** The page uses the `swagger-ui-react` library to render a standard, full-featured Swagger UI interface based on an OpenAPI specification generated by the backend.

### 6.2. Unauthorized Access

- **URL:** `/unauthorized`
- **Purpose:** A simple, static page that is displayed whenever a user attempts to access a resource or page for which they do not have the required permissions.
- **Content:** Displays a "Neoprávněný přístup" (Unauthorized Access) error message.
