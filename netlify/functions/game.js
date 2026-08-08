import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { connectDB, User, Round, Bet } from './utils/db.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}

const SITE_URL = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:5173';

const headers = {
    'Access-Control-Allow-Origin': SITE_URL,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
};

// Helper to get current round ID
function getCurrentRoundId() {
    return Math.floor(Date.now() / 60000);
}

// Helper to get time left in current round
function getTimeLeft() {
    return 60 - (Math.floor(Date.now() / 1000) % 60);
}

// Helper to determine color from number
function getColor(num) {
    if ([1, 3, 7, 9].includes(num)) return 'green';
    if ([2, 4, 6, 8].includes(num)) return 'red';
    if ([0, 5].includes(num)) return 'violet';
}

// Helper to determine size from number
function getSize(num) {
    if ([6, 7, 8, 9].includes(num)) return 'big';
    if ([0, 1, 2, 3, 4].includes(num)) return 'small';
    if (num === 5) return 'violet';
}

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    await connectDB();

    const path = event.path.replace('/.netlify/functions/game', '');

    try {
        // GET /current - Get current round info
        if (event.httpMethod === 'GET' && path === '/current') {
            const currentRoundId = getCurrentRoundId();
            const timeLeft = getTimeLeft();

            // Get last 20 results (excluding the active round if already generated/set)
            const lastResults = await Round.find({
                roundId: { $lt: currentRoundId },
                result: { $ne: null }
            })
                .sort({ roundId: -1 })
                .limit(20)
                .select('roundId result color size');

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    roundId: currentRoundId,
                    timeLeft,
                    lastResults: lastResults.map(r => ({
                        roundId: r.roundId,
                        result: r.result,
                        color: r.color,
                        size: r.size,
                    })),
                }),
            };
        }

        // POST /bet - Place a bet
        if (event.httpMethod === 'POST' && path === '/bet') {
            // Verify JWT
            const cookies = cookie.parse(event.headers.cookie || '');
            const token = cookies.token;

            if (!token) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Not authenticated' }),
                };
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'User not found' }),
                };
            }

            const { betType, betValue, amount } = JSON.parse(event.body);

            // Validate bet
            if (!betType || !amount || amount <= 0) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid bet' }),
                };
            }

            if (amount > user.balance) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Insufficient balance' }),
                };
            }

            // Validate bet type
            const validBetTypes = ['green', 'red', 'violet', 'big', 'small', 'number'];
            if (!validBetTypes.includes(betType)) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid bet type' }),
                };
            }

            if (betType === 'number' && (betValue < 0 || betValue > 9)) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid number' }),
                };
            }

            const currentRoundId = getCurrentRoundId();

            // Check if more than 15 seconds left in current round
            const timeLeft = getTimeLeft();
            if (timeLeft <= 15) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Betting closed - less than 15 seconds remaining' }),
                };
            }

            // Check if round has ended
            const existingRound = await Round.findOne({ roundId: currentRoundId });
            if (existingRound && existingRound.result !== null && existingRound.result !== undefined) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Round has ended' }),
                };
            }

            // Deduct balance
            user.balance -= amount;
            await user.save();

            // Create bet
            await Bet.create({
                userId: user._id,
                roundId: currentRoundId,
                betType,
                betValue: betType === 'number' ? betValue : null,
                amount,
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    balance: user.balance,
                }),
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not found' }),
        };
    } catch (error) {
        console.error('Game error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
