import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
    userId: number;
    email: string;
    role: string;
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

export const generatePasswordResetToken = (email: string): string => {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' } as jwt.SignOptions);
};

export const verifyPasswordResetToken = (token: string): { email: string } => {
    return jwt.verify(token, JWT_SECRET) as { email: string };
};

export const generateResetToken = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

