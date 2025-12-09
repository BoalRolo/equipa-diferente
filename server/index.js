import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
// Increase payload size limit to 50MB (for large base64 encoded files)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Endpoint para autenticação
app.post("/api/xray/authenticate", async (req, res) => {
    try {
        const { xrayBaseUrl, clientId, clientSecret } = req.body;

        if (!xrayBaseUrl || !clientId || !clientSecret) {
            return res.status(400).json({
                error: "Missing required parameters: xrayBaseUrl, clientId, clientSecret",
            });
        }

        const response = await fetch(`${xrayBaseUrl}/api/v2/authenticate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({
                error: `Authentication failed: ${response.status} ${response.statusText}`,
                details: errorText,
            });
        }

        const data = await response.json();
        const token = typeof data === "string" ? data : data.token || data;

        res.json({ token });
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
});

// Endpoint para importação
app.post("/api/xray/import", async (req, res) => {
    try {
        const { xrayBaseUrl, token, importData } = req.body;

        if (!xrayBaseUrl || !token || !importData) {
            const missing = [];
            if (!xrayBaseUrl) missing.push("xrayBaseUrl");
            if (!token) missing.push("token");
            if (!importData) missing.push("importData");

            return res.status(400).json({
                error: `Missing required parameters: ${missing.join(", ")}`,
            });
        }

        const response = await fetch(`${xrayBaseUrl}/api/v2/import/execution`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(importData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({
                error: `Import failed: ${response.status} ${response.statusText}`,
                details: errorText,
            });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Import error:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
});

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

