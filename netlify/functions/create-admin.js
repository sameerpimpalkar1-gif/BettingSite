import bcrypt from 'bcryptjs';
import { connectDB, User } from './utils/db.js';

/**
 * create-admin — Protected by a one-time secret key.
 *
 * This endpoint is secured with ADMIN_SECRET env var to prevent
 * unauthorized admin account creation. Without this key matching,
 * the endpoint returns 403 immediately.
 *
 * Usage (set ADMIN_SECRET in Netlify env vars, then call once):
 *   POST /.netlify/functions/create-admin
 *   Headers: x-admin-secret: <your ADMIN_SECRET value>
 *   Body: { "phone": "9999999999", "password": "yourpassword" }
 *
 * After creating the admin account, you can remove or rotate ADMIN_SECRET.
 */

const ADMIN_SECRET = process.env.ADMIN_SECRET;

const headers = {
    'Access-Control-Allow-Origin': process.env.URL || 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Require ADMIN_SECRET to be configured and matched
    if (!ADMIN_SECRET) {
        return {
            statusCode: 503,
            headers,
            body: JSON.stringify({ error: 'Admin creation is not configured on this server' }),
        };
    }

    const providedSecret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
    if (!providedSecret || providedSecret !== ADMIN_SECRET) {
        return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'Forbidden: invalid or missing admin secret' }),
        };
    }

    await connectDB();

    try {
        const { phone, password } = JSON.parse(event.body);

        // Validate phone (10 digits)
        if (!phone || !/^\d{10}$/.test(phone)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Phone must be exactly 10 digits' }),
            };
        }

        if (!password || password.length < 8) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Password must be at least 8 characters' }),
            };
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Upsert: update existing user to admin, or create new admin user
        const existing = await User.findOne({ phone });
        if (existing) {
            existing.isAdmin = true;
            existing.password = hashedPassword;
            await existing.save();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Existing user promoted to admin', phone }),
            };
        }

        await User.create({ phone, password: hashedPassword, balance: 0, isAdmin: true });

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ success: true, message: 'Admin user created', phone }),
        };
    } catch (error) {
        console.error('Create admin error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
