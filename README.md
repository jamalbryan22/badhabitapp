# BadHabitApp

## Project Description
BadHabitApp is a web application designed to help users track and manage their habits. The application utilizes a C# backend with Entity Framework for database management and an Angular frontend for the user interface.

## Features
- User authentication and authorization
- Habit tracking and management
- Customizable habit settings
- Data visualization for habit tracking

## Installation

### Prerequisites
- **SQL Server Express**: Ensure it is installed and running on your local machine.
- **.NET Core SDK**: Required for building and running the backend.
- **Node.js and npm**: Required for building and running the frontend.

### Configuration
1. **Copy and Modify Configuration File**:
    - Copy `appsettings.json.example` to `appsettings.json` in the `BadHabitApp` directory.
    - Modify the `Jwt` key field in `appsettings.json` to a secure and long key.

### Database Setup
- **Entity Framework Migrations**: This project uses EF migrations to manage the database schema.
    - Run the following commands to apply the migrations and set up your database:
      ```sh
      dotnet ef database update
      ```

### Installing Project Dependencies
- Navigate to the project directory and run the following command to restore dependencies:
  ```sh
  dotnet restore
  ```