import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { DbClient } from './authorizationService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function authenticateUser(db: DbClient, email: string, password: string) {
    const result = await db.query(
        'SELECT * FROM lab_pbm_senasa.users WHERE email = $1',
        [email]
    );

    if (result.rows.length === 0) {
        return { success: false, error: 'Invalid credentials' };
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
        return { success: false, error: 'Invalid credentials' };
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    return {
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.full_name }
    };
}
