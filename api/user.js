
import pool from "./db.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            error: "Method not allowed."
        });
    }

    const { username, password } = req.body || {};

    if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        !username.trim() ||
        !password
    ) {
        return res.status(400).json({
            error: "Username and password are required."
        });
    }

    const cleanUsername = username.trim().toLowerCase();

    try {
        const result = await pool.query(
            `SELECT name, username, password_hash, grade
             FROM students
             WHERE username = $1
             LIMIT 1`,
            [cleanUsername]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Invalid username or password."
            });
        }

        const student = result.rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            student.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Invalid username or password."
            });
        }

        return res.status(200).json({
            name: student.name,
            grade: student.grade,
            student: {
                name: student.name,
                grade: student.grade
            }
        });

    } catch (error) {
        console.error("Login database error:", error.message);

        return res.status(500).json({
            error: "Login service is temporarily unavailable."
        });
    }
}
