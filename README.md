# Ticketify — Music Event Discovery & Ticket Booking

Ticketify is a web application for discovering music events and exploring concerts by artists you enjoy. It integrates with Spotify to personalize event discovery and uses MongoDB to store event information.

**Live Demo:** https://ticketify-3gat.onrender.com

## Features

- **Browse events:** Explore music events loaded from the database.
- **Spotify authentication:** Sign in through Spotify OAuth.
- **Personalized discovery:** Use Spotify listening preferences, including top artists, to help rank relevant events.
- **Event details:** View the artist, event name, date, venue, ticket price, ticket availability, and image.
- **MongoDB persistence:** Store event records in MongoDB.
- **REST API:** Retrieve event data through the Express backend.

> Confirm which booking, payment, and user-account flows are implemented before describing them as production-ready features.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication / Music data:** Spotify Web API, Passport Spotify OAuth
- **Configuration:** dotenv
- **Deployment:** Render

## Project Structure

```text
ticketify/
├── models/
│   └── Event.js
├── route/
│   └── events.js
├── seedEvents.js
├── db.js
├── server.js
├── package.json
├── package-lock.json
└── .env                 # Local secrets; do not commit
```

Your repository may contain additional frontend, authentication, or view files. Keep those in this overview if applicable.

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB database (local MongoDB or MongoDB Atlas)
- A Spotify Developer application for Spotify OAuth/API access

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ticketify
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with your repository's clone URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_CALLBACK_URL=http://127.0.0.1:PORT/auth/spotify/callback
APP_URL=http://127.0.0.1:PORT
```

Replace the example values with your own. Use the actual port and callback path configured by your application. The callback URL registered in your Spotify Developer Dashboard must match the one used by the app.

For Render, configure the corresponding environment variables in **Render → your service → Environment**. The deployed callback URL is:

```text
https://ticketify-3gat.onrender.com/auth/spotify/callback
```

Do not commit `.env` or share your Spotify client secret or MongoDB credentials.

### 4. Start the application

Check the scripts in `package.json` to confirm the supported start command. Common options are:

```bash
npm start
```

or, if your project defines a development script:

```bash
npm run dev
```

Open the local URL and port configured by your application.

## API

### Get all events

```http
GET /api/events
```

Deployed endpoint: https://ticketify-3gat.onrender.com/api/events

The endpoint returns event records from MongoDB. When Spotify personalization is available for a signed-in user, the route can use their top artists to rank relevant events; otherwise, it can return events without personalized ranking.

An event record includes fields such as:

| Field | Description |
|---|---|
| `eventId` | Event identifier |
| `artistName` | Performing artist |
| `eventName` | Event or concert name |
| `date` | Event date and time |
| `venue` | Event venue |
| `ticketPrice` | Ticket price |
| `totalTickets` | Total ticket inventory |
| `availableTickets` | Tickets currently available |
| `imageUrl` | Event image URL or placeholder |

## Seed Sample Events

The repository includes `seedEvents.js` to insert sample event data into MongoDB.

Before running it, verify that your local `.env` points to the intended database. The script clears the existing `events` collection before inserting sample records.

```bash
node seedEvents.js
```

**Warning:** `Event.deleteMany({})` removes all documents from the target `events` collection. Run this script only when you intend to replace that collection's contents. Do not run it against production data unless that is explicitly intended.

## Spotify Setup

1. Create an application in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add the client ID and client secret to your local `.env` file or Render environment settings.
3. Register the exact OAuth callback URL used by your application under the Spotify app's **Redirect URIs**.
4. Restart or redeploy after changing environment variables.
5. Test Spotify sign-in and personalized event discovery.

Spotify API access and account requirements can change; consult Spotify's current developer documentation if you encounter authorization errors.

## Deployment

The project is deployed on Render: https://ticketify-3gat.onrender.com

1. Push committed changes to the branch connected to Render.
2. Confirm the build and start commands in Render.
3. Set required environment variables in Render's Environment settings.
4. Review deployment logs if the service fails to start.
5. Verify the live app and `/api/events` endpoint after deployment.

## Security Notes

- Never commit `.env`, access tokens, client secrets, or database credentials.
- Keep `.env` in `.gitignore`.
- Use environment variables for sensitive configuration.
- Do not expose Spotify access or refresh tokens in logs, public endpoints, screenshots, or issue reports.
- Use a non-production database when testing scripts that delete and reseed event records.

## Future Improvements

Potential improvements, depending on the current project scope:

- Event search and filtering
- Improved event and artist recommendations
- More robust ticket inventory and booking workflows
- Input validation, error handling, and automated tests
- Improved accessibility and responsive UI
