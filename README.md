# MUSI
Musi is an app where users can rank their favorite songs, create personal lists, and share their music taste with others. Current music platforms make it easy to listen but not to express how much you like a song or compare preferences. By allowing users to share ranked lists and compare profiles with friends, Musi makes music more social and helps people discover new songs through each other.

## Team Members
- Zuhair Khalid - Github: [zuhair-khalid](https://github.com/zuhair-khalid)
- Julz Liang - Github: [julzliang](https://github.com/julzliang)
- Ian Jiang - Github: [ianjiang7](https://github.com/ianjiang7)
- Andy Cabidnol - Github: [andycabindol](https://github.com/andycabindol)
- David Yu - Github: [DavidYu00](https://github.com/DavidYu00)

## Team Norms
Sprint Planning   
Mondays 4:00-4:30PM

Sprint Reviews
Thursdays 4:00-4:30PM 

## Why work on Musi
Musi came to be because current music platforms aren't able to capture the social aspect of music. It might be easy to listen to any song you want on a streaming platform, but it's much harder to know what your friends are listening to. Musi helps you express your music tastes to your friends and let them know what you're listening to. Help us make Musi bettter for you by [contributing to the project](https://github.com/agile-students-fall2025/4-final-musi/blob/master/CONTRIBUTING.md).

## How to use Musi
Visit [Musi](http://159.203.187.244/) here! (http://159.203.187.244/)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas connection string)
- Spotify API credentials (Client ID and Client Secret)

### Environment Variables

Create a `.env` file in the `back-end` directory with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/musi
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
JWT_SECRET=your_jwt_secret_key
PORT=3001
```

**Note:** Replace the placeholder values with your actual credentials:
- `MONGODB_URI`: Your MongoDB connection string (defaults to local MongoDB if not provided)
- `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`: Get these from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- `JWT_SECRET`: A random secret string for JWT token signing

### Installation

1. Clone the repository:
```bash
git clone https://github.com/agile-students-fall2025/4-final-musi.git
cd 4-final-musi
```

2. Install backend dependencies:
```bash
cd back-end
npm install
```

3. Install frontend dependencies:
```bash
cd ../front-end/my-app
npm install
```

## Build Instructions

### Backend
The backend doesn't require a build step - it runs directly with Node.js.

### Frontend
To build the frontend for production:

```bash
cd front-end/my-app
npm run build
```

This creates an optimized production build in the `build` folder.

## Run Instructions

### Development Mode

1. **Start the backend server:**
```bash
cd back-end
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:3001` (or the port specified in your `.env` file).

2. **Start the frontend development server:**
```bash
cd front-end/my-app
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

**Note:** Make sure MongoDB is running if you're using a local instance, or ensure your MongoDB Atlas connection string is correct.

### Production Mode

1. Build the frontend:
```bash
cd front-end/my-app
npm run build
```

2. Serve the built files (you can use a static file server like `serve`):
```bash
npm install -g serve
serve -s build -l 3000
```

3. Start the backend:
```bash
cd back-end
npm start
```

## Test Instructions

### Backend Tests

Run backend tests:
```bash
cd back-end
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Frontend Tests

Run frontend tests:
```bash
cd front-end/my-app
npm test
```

This launches the test runner in interactive watch mode. Press `a` to run all tests, or press `Enter` to run tests related to changed files.

## Project Structure

```
4-final-musi/
├── back-end/          # Node.js/Express backend API
│   ├── app.js        # Main application file
│   ├── server.js     # Server entry point
│   ├── models.js     # MongoDB models
│   ├── middleware/   # Authentication middleware
│   ├── routes/       # API routes
│   └── test/         # Backend tests
├── front-end/        # React frontend application
│   └── my-app/       # Create React App project
│       ├── src/      # React source code
│       └── public/   # Static assets
└── README.md         # This file
```

## Relevant material
Replace if needed
