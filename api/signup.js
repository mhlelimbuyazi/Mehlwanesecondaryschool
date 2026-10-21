
import pool from "./db.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            error: "Method not allowed."
        });
    }

    const { name, username, password, dateOfBirth, grade } =
        req.body || {};

    if (
        typeof name !== "string" ||
        typeof username !== "string" ||
        typeof password !== "string" ||
        typeof dateOfBirth !== "string" ||
        typeof grade !== "string"
    ) {
        return res.status(400).json({
            error: "Please complete all fields."
        });
    }

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanGrade = grade.trim();

    if (
        !cleanName ||
        !cleanUsername ||
        !cleanGrade ||
        cleanName.length > 120 ||
        cleanUsername.length > 50 ||
        cleanGrade.length > 30 ||
        password.length < 6 ||
        Buffer.byteLength(password, "utf8") > 72 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)
    ) {
        return res.status(400).json({
            error: "Check your details. Password must be at least 6 characters."
        });
    }

    const dob = new Date(`${dateOfBirth}T00:00:00Z`);

    if (
        Number.isNaN(dob.getTime()) ||
        dob.toISOString().slice(0, 10) !== dateOfBirth ||
        dateOfBirth > new Date().toISOString().slice(0, 10)
    ) {
        return res.status(400).json({
            error: "Please enter a valid date of birth."
        });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO students
                (name, username, password_hash, date_of_birth, grade)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (username) DO NOTHING
             RETURNING id, name, username, grade`,
            [
                cleanName,
                cleanUsername,
                passwordHash,
                dateOfBirth,
                cleanGrade
            ]
        );

        if (result.rowCount === 0) {
            return res.status(409).json({
                error: "That username is already registered."
            });
        }

        return res.status(201).json({
            success: true,
            message: "Registration successful. You can now log in.",
            student: result.rows[0]
        });
    } catch (error) {
        console.error("Signup error:", error.message);

        return res.status(500).json({
            error: "Registration failed. Please try again later."
        });
    }
}
