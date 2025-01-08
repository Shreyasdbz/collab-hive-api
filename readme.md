
# CollabHive API

The backend API for the [CollabHive](https://collabhive.dev) platform, enabling project discovery and collaboration for developers, designers, and product managers. This repository handles core backend functionalities, including user profiles, projects, and collaborations.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Folder Structure](#general-folder-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Overview

CollabHive is a platform where users can:
- Discover and join collaborative projects.
- Create projects and invite others to participate.
- Manage profiles and track collaboration activities.

This API is built with:
- **Node.js** and **Express** for the backend.
- **TypeScript** for type safety.
- **Prisma** for ORM.
- **Supabase** for database and authentication.

The corresponding web client repository can be found [here](https://github.com/Shreyasdbz/collab-hive-web-client).

## Features

- **Profiles**: Manage user profiles, including links and bio.
- **Projects**: Search, create, and manage collaborative projects.
- **Collaborations**: Handle collaboration requests and manage project memberships.
- **Versioning**: Organized into API versions for maintainability.

## General Folder Structure

```
src/
├── api/
│   ├── v0/
│   ├── v1/
│   │   ├── auth/
│   │   ├── collaboration/
│   │   ├── profiles/
│   │   └── projects/
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.dtos.ts
│   │   │   ├── projects.routes.ts
│   │   │   └── projects.service.ts
│   │   └── v0.routes.ts
├── config/
├── middlewares/
├── models/
├── scripts/
├── utils/
├── app.ts
└── index.ts
```

### Key Folders
- **`api/v1`**: Contains version 1 endpoints for profiles, projects, and collaboration.
- **`middlewares`**: Middleware for authentication, validation, etc.
- **`utils`**: Utility functions for logging, error handling, and more.

## Getting Started

### Prerequisites
- **Node.js** (v16+)
- **Yarn** package manager
- Supabase account for database and authentication setup

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-repo>/collabhive-api.git
   cd collabhive-api
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Refer to `.env.example` for required variables.

4. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

### Running the Application

- Start the development server:
  ```bash
  yarn dev
  ```

- Build for production:
  ```bash
  yarn build
  yarn start
  ```

## API Endpoints

Detailed API documentation is available in the [`API.md`](./API.md) file. Below are some key endpoints:

### Profiles
- `GET /api/v1/profiles/:userId`: Get a user's profile.
- `PUT /api/v1/profiles`: Update profile details.
- `POST /api/v1/profiles/links`: Add a new profile link.
- `DELETE /api/v1/profiles/links/:linkId`: Delete a profile link.

### Projects
- `GET /api/v1/projects`: Search for projects.
- `GET /api/v1/projects/:projectId`: Get project details.

### Collaboration
- `GET /api/v1/collaboration/creator-requests`: View all collaboration requests for the user.
- `POST /api/v1/collaboration/:projectId`: Create a new collaboration request.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit changes: `git commit -m "Add feature description"`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

For any questions or issues, feel free to open an issue or reach out!
