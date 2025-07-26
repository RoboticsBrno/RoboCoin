# Deploying RoboCoin

This guide provides a comprehensive set of instructions to deploy the RoboCoin application on a fresh Linux server (e.g., Ubuntu 22.04). It covers everything from installing system dependencies to running the application.

## 1. Prerequisites: Server Setup

Before you can deploy the application, you need to prepare your server with the necessary software.

### 1.1. Update Your System

First, connect to your server via SSH and make sure all system packages are up-to-date.

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2. Install Node.js and npm

The application is built with Node.js. We recommend using Node Version Manager (nvm) to install Node.js, as it allows you to easily manage different Node versions.

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Source nvm to use it in the current session
source ~/.bashrc

# Install the latest Long-Term Support (LTS) version of Node.js
nvm install --lts
```

### 1.3. Install Git

Git is required to clone the application repository from version control.

```bash
sudo apt install git -y
```

### 1.4. Set Up a Production Database (MariaDB)

You need a database for the application to store user data, balances, etc.

```bash
# Install MariaDB server
sudo apt install mariadb-server -y

# Start and enable the MariaDB service
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Run the secure installation script to set the root password and secure your installation
sudo mysql_secure_installation
```

Now, log in to MariaDB to create a database and user for your application.

```bash
# Log in as the root user (you will be prompted for the password you just set)
sudo mysql -u root -p
```

Once logged in, run the following SQL commands:

```sql
-- Create the database
CREATE DATABASE robocoin;

-- Create a new user and set their password
CREATE USER 'robocoin_user'@'localhost' IDENTIFIED BY 'your_strong_password';

-- Grant all privileges on the new database to the user
GRANT ALL PRIVILEGES ON robocoin.* TO 'robocoin_user'@'localhost';

-- Apply the changes
FLUSH PRIVILEGES;

-- Exit the MariaDB prompt
EXIT;
```

**Note:** Remember to replace `'your_strong_password'` with a secure password.

## 2. Application Deployment

With the server set up, you can now deploy the application.

### 2.1. Clone the Repository

Clone the application code from its Git repository.

```bash
git clone git@github.com:RoboticsBrno/RoboCoin.git
cd robocoinv2
```

### 2.2. Configure Environment Variables

The application requires environment variables for the database connection and application secrets. A template is provided in the repository.

```bash
# Copy the example environment file
cp .env.example .env.local
```

Now, open the `.env.local` file with a text editor (e.g., `vim .env.local`) and fill in the required values:

-   `DATABASE_URL`: This is the connection string for the MariaDB database you just created. The format is:
    `mysql://robocoin_user:your_strong_password@localhost:3306/robocoin`

-   `NEXTAUTH_SECRET`: This is a secret key used to secure user sessions. You can generate a strong secret with the following command:
    ```bash
    openssl rand -base64 32
    ```
    Copy the output of this command into your `.env.local` file.

### 2.3. Run the Deployment Script

A deployment script (`deploy.sh`) is included to automate the installation, migration, and build process.

```bash
# First, make the script executable
chmod +x deploy.sh

# Then, run the script
./deploy.sh
```

The script will:
1.  Install all dependencies using `npm ci`.
2.  Run database migrations with `npx prisma migrate deploy`.
3.  Build the application for production with `npm run build`.
4.  Start the server with `npm start`.

Your terminal will be occupied by the running application. To stop the server, you can press `Ctrl+C`.

Your RoboCoin application is now deployed and running!
