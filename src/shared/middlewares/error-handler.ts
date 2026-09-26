import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";
import { ZodError } from "zod";
import { ERROR_MESSAGES } from "../constants/error-messages.js";
import { Prisma } from "@prisma/client";


// IMPORTANT
// This middleware handles application errors globally and returns a consistent error response.
// Use this middleware in app.ts after all route handlers.
// Without this middleware, errors passed to next(error) (from controller) won't return a response body.

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {

    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: ERROR_MESSAGES.VALIDATION_FAILED,
            errors: err.issues,
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }


    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({
            success: false,
            message: "Invalid database operation.",
        });
    }


    // If not the above errors return internal server error
    return res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });

}