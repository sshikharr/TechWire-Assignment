# TechWire Assignment
A full-stack application for managing and displaying product catalog information with CSV import functionality.

## Prerequisites
- Node.js 
- PostgreSQL (via NeonDB)
- npm (comes with Node.js)

## Backend Setup

1. Clone the Repository
```
git clone https://github.com/sshikharr/TechWire-Assignment
cd TechWire-Assignment/server
```
2. Install dependencies
```
npm install
```
3. Configure Database
- Sign up for a NeonDB account (https://neon.tech) if not using a local PostgreSQL instance
- Create a new database and obtain the connection string
- Create a .env file in the server/ directory:
```
DATABASE_URL=postgresql://neondb_owner:...
```
4. Initialize Prisma
```
npx prisma migrate dev --name init
```
5. Start the server
```
npm start
```

- Note: Sometimes due to long connection time with the neondb, the server start fails. Just restart the server and it works.

## Frontend Setup
1. Navigate to the client folder
```
cd ../client
```
2. Install the dependencies
```
npm install
```
3. Run the frontend
```
npm run dev
```

- Note: The import of the CSV might takes 5-10 seconds due to database calls.