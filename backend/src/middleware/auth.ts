import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
    user?: TokenPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authentication required.',
            });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};

export const authorize = (...allowedRoles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        const userRole = req.user.role as Role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
            });
        }

        next();
    };
};
