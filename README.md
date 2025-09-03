# MonadHub - Public Community Recognizer

MonadHub is a community recognition platform that allows users to vote for notable contributors in the Monad ecosystem once per day.

##  Features

- Wallet connection with MetaMask/Rabby support

- Token-gated voting (requires specific Monad tokens)

- Vote for up to 3 Twitter usernames per day

- Real-time contributor rankings

- Search functionality for contributors

- 24-hour cooldown between votes

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- Modern web browser with MetaMask extension
- SQLite3

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nftshinessy/monadhub.git
cd monadhub
```

2. Install backend dependencies:
```bash
cd backend
npm install
npm install web3 cors express-rate-limit
```

3. Set up environment variables:
Create a ```.env``` file in the backend directory with the following content:
```bash
PORT=3000
BLOCKVISION_API_KEY=your_blockvision_api_key_here
```

4. Initialize the database:
The SQLite database will be created automatically when you start the server for the first time.

5. Start the backend server:
```bash
cd backend
npm start
npm run dev
```

6. The frontend will be served from the ```/frontend``` directory at the root URL.


## Project Structure

```text
/monadhub/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── voteController.js
│   │   └── contributorController.js
│   ├── models/
│   │   ├── Voter.js
│   │   └── Contributor.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── votes.js
│   │   └── contributors.js
│   ├── package.json
│   ├── server.js
│   └── .env
└── README.md              

# Project documentation
```

##  API Endpoints

 **```POST /api/auth/connect```** - Connect wallet and check voting eligibility

 **```POST /api/vote/submit```** - Submit votes for contributors

 **```GET /api/contributors```** - Get all contributors with rankings


