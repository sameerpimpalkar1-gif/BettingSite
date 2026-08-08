# Color Prediction Game scam 
# NOTE MUST READ
**

This is a  sample site which shows , how the colour prediction companies scam you !
You can try this site and you will know these guys have an admin panel from there they scam you !
**
** 
Using  this code and involving real money is illegal  Never use this  code to scam someone 
this code is just to demonstrate how it works  and for education purpose.

I made this as one of my friend was addicted to gambling site and i need to show him there true colours
This sites are total scam do not   try online gambling.
Enjoy the site:   
    the admin rout is ```/dashboard ``` 

    use this to remove your gambling addiction
***

## Tech Stack

- **Frontend**: Vite + React + Tailwind CSS
- **Backend**: Netlify Serverless Functions (Node.js)
- **Database**: MongoDB Atlas
- **Authentication**: JWT with httpOnly cookies
- **Password Hashing**: bcryptjs

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/colorprediction
JWT_SECRET=your_secret_key_here
```

**IMPORTANT**: When deploying to Netlify, add these environment variables in the Netlify dashboard under Site Settings > Environment Variables.

### 3. Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Deploy to Netlify

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Add environment variables in Netlify dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong secret key
4. Deploy!

## Game Rules

- **Round Duration**: 60 seconds
- **Winning Number**: 0-9 (set manually by admin)

### Colors
- **Green**: 1, 3, 7, 9
- **Red**: 2, 4, 6, 8
- **Violet**: 0, 5

### Size
- **Big**: 6, 7, 8, 9
- **Small**: 0, 1, 2, 3, 4
- **5**: Violet only

### Payouts
- **Green/Red/Violet**: 2x
- **Big/Small**: 2x
- **Number (0-9)**: 8x

## User Features

- Register/Login with 10-digit phone number
- Live 60-second countdown timer
- Place bets on colors, sizes, or specific numbers
- View last 20 results
- Recharge wallet (submit transaction ID)
- Withdraw funds (requires bank details)
- View bet history and transaction history

## Admin Panel

Access at `/admin`

**Login Credentials:**
- Email: `whatever you set`
- Password: `password123`

**Admin Features:**
- Set winning number (0-9) to end current round
- Update UPI ID for recharges
- View all users
- Add/reduce user balance
- Approve/reject recharge requests
- Approve/reject withdrawal requests
- View all bets for current round

## Project Structure

```
/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Game.jsx
│   │   ├── Recharge.jsx
│   │   ├── Withdraw.jsx
│   │   ├── Profile.jsx
│   │   ├── AdminLogin.jsx
│   │   └── AdminDashboard.jsx
│   ├── lib/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── netlify/
│   └── functions/
│       ├── auth.js
│       ├── game.js
│       ├── admin.js
│       ├── bets.js
│       └── utils/
│           └── db.js
├── netlify.toml
├── vite.config.js
├── tailwind.config.js
├── package.json
└── .env.example
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Game
- `GET /api/game/current` - Get current round info
- `POST /api/game/bet` - Place a bet

### User Transactions
- `POST /api/bets/recharge` - Submit recharge request
- `POST /api/bets/withdraw` - Submit withdrawal request
- `POST /api/bets/save-bank` - Save bank details
- `GET /api/bets/history` - Get bet history
- `GET /api/bets/transactions` - Get transaction history

### Admin
- `POST /api/admin/login` - Admin login
- `POST /api/admin/set-result` - Set winning number
- `GET /api/admin/users` - List users
- `POST /api/admin/update-balance` - Update user balance
- `GET /api/admin/recharges` - List recharge requests
- `POST /api/admin/approve-recharge` - Approve/reject recharge
- `GET /api/admin/withdrawals` - List withdrawal requests
- `POST /api/admin/approve-withdrawal` - Approve/reject withdrawal
- `GET /api/admin/bets` - Get current round bets
- `POST /api/admin/update-upi` - Update UPI ID
- `GET /api/admin/upi` - Get UPI ID

## Database Models

- **User**: phone, password, balance, bankDetails
- **Round**: roundId, result, color, size, endedAt
- **Bet**: userId, roundId, betType, betValue, amount, won, payout
- **RechargeRequest**: userId, amount, transactionId, status
- **WithdrawalRequest**: userId, amount, status
- **Setting**: key, value (for UPI ID)

## Notes

- Phone numbers must be exactly 10 digits
- Passwords must be at least 6 characters
- Round ID is calculated as `Math.floor(Date.now() / 60000)`
- Timer updates every second via polling
- Winnings are automatically credited when admin sets result
- Withdrawal requests deduct balance immediately
- If withdrawal is rejected, balance is refunded


For any issues or questions, contact the developer.
