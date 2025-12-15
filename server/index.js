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

// Endpoint para validar Test Execution via GraphQL
app.post("/api/xray/validate-test-execution", async (req, res) => {
    try {
        const { xrayBaseUrl, token, testExecutionKey } = req.body;

        if (!xrayBaseUrl || !token || !testExecutionKey) {
            const missing = [];
            if (!xrayBaseUrl) missing.push("xrayBaseUrl");
            if (!token) missing.push("token");
            if (!testExecutionKey) missing.push("testExecutionKey");

            return res.status(400).json({
                error: `Missing required parameters: ${missing.join(", ")}`,
            });
        }

        // First request to get Test Execution info and total count
        const initialQuery = {
            query: `query ($jql: String!, $limit: Int!, $trLimit: Int!) {
                getTestExecutions(jql: $jql, limit: $limit) {
                    results {
                        jira(fields: ["key", "summary"])
                        testRuns(limit: $trLimit) {
                            total
                            results {
                                id
                                status {
                                    name
                                    color
                                    description
                                }
                                assigneeId
                                executedById
                                startedOn
                                finishedOn
                                comment
                                test {
                                    jira(fields: ["key", "summary"])
                                    testType {
                                        name
                                    }
                                }
                            }
                        }
                    }
                }
            }`,
            variables: {
                jql: `key=${testExecutionKey}`,
                limit: 1,
                trLimit: 100,
            },
        };

        const initialResponse = await fetch(`${xrayBaseUrl}/api/v2/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(initialQuery),
        });

        if (!initialResponse.ok) {
            const errorText = await initialResponse.text();
            console.error("❌ GraphQL error:", errorText);
            return res.status(initialResponse.status).json({
                error: `GraphQL request failed: ${initialResponse.status} ${initialResponse.statusText}`,
                details: errorText,
            });
        }

        const initialData = await initialResponse.json();

        // Verificar se a Test Execution existe
        if (
            !initialData.data ||
            !initialData.data.getTestExecutions ||
            !initialData.data.getTestExecutions.results ||
            initialData.data.getTestExecutions.results.length === 0
        ) {
            return res.status(404).json({
                error: `Test Execution ${testExecutionKey} not found`,
                valid: false,
            });
        }

        const testExecution = initialData.data.getTestExecutions.results[0];
        const totalTestRuns = testExecution.testRuns?.total || 0;
        let allTestRuns = testExecution.testRuns?.results || [];

        // Paginate to get all Test Runs if there are more than 100
        // Xray GraphQL uses cursor-based pagination with 'start' parameter
        if (totalTestRuns > 100) {
            const pageSize = 100;
            const totalPages = Math.ceil(totalTestRuns / pageSize);

            for (let page = 1; page < totalPages; page++) {
                const start = page * pageSize;

                const paginatedQuery = {
                    query: `query ($jql: String!, $limit: Int!, $trLimit: Int!, $trStart: Int!) {
                        getTestExecutions(jql: $jql, limit: $limit) {
                            results {
                                testRuns(limit: $trLimit, start: $trStart) {
                                    results {
                                        id
                                        status {
                                            name
                                            color
                                            description
                                        }
                                        assigneeId
                                        executedById
                                        startedOn
                                        finishedOn
                                        comment
                                        test {
                                            jira(fields: ["key", "summary"])
                                            testType {
                                                name
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }`,
                    variables: {
                        jql: `key=${testExecutionKey}`,
                        limit: 1,
                        trLimit: pageSize,
                        trStart: start,
                    },
                };

                const paginatedResponse = await fetch(`${xrayBaseUrl}/api/v2/graphql`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(paginatedQuery),
                });

                if (!paginatedResponse.ok) {
                    const errorText = await paginatedResponse.text();
                    console.error(`❌ Error fetching page ${page + 1}:`, paginatedResponse.status);
                    console.error(`❌ Error details:`, errorText.substring(0, 200));
                    // Try to continue with what we have
                    break;
                }

                const paginatedData = await paginatedResponse.json();

                // Check for GraphQL errors
                if (paginatedData.errors) {
                    console.error(`❌ GraphQL errors on page ${page + 1}:`, paginatedData.errors);
                    break;
                }

                const pageTestRuns = paginatedData.data?.getTestExecutions?.results[0]?.testRuns?.results || [];
                allTestRuns = allTestRuns.concat(pageTestRuns);

                // If we got fewer results than expected, we've reached the end
                if (pageTestRuns.length < pageSize) {
                    break;
                }
            }
        }

        // Parse jira field (it's a JSON string)
        let jiraData;
        try {
            jiraData = typeof testExecution.jira === 'string'
                ? JSON.parse(testExecution.jira)
                : testExecution.jira;
        } catch (e) {
            jiraData = testExecution.jira;
        }

        const foundTestExecutionKey = jiraData?.key || testExecutionKey;
        const testExecutionSummary = jiraData?.summary || "";

        // Parse jira fields in test runs and extract IDs and statuses
        const parsedTestRuns = allTestRuns.map((tr) => {
            let testJiraData;
            try {
                testJiraData = typeof tr.test?.jira === 'string'
                    ? JSON.parse(tr.test.jira)
                    : tr.test?.jira;
            } catch (e) {
                testJiraData = tr.test?.jira;
            }

            return {
                id: tr.id,
                status: tr.status?.name || "UNKNOWN",
                statusColor: tr.status?.color || "",
                statusDescription: tr.status?.description || "",
                assigneeId: tr.assigneeId,
                executedById: tr.executedById,
                startedOn: tr.startedOn,
                finishedOn: tr.finishedOn,
                comment: tr.comment,
                test: {
                    key: testJiraData?.key || "",
                    summary: testJiraData?.summary || "",
                    testType: tr.test?.testType?.name || "",
                },
            };
        });

        // Extract all test IDs and statuses for summary
        const testIdsAndStatuses = parsedTestRuns.map(tr => ({
            id: tr.id,
            testKey: tr.test.key,
            status: tr.status,
        }));

        // Calculate status summary
        const statusSummary = parsedTestRuns.reduce((acc, tr) => {
            const status = tr.status || "UNKNOWN";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        res.json({
            valid: true,
            testExecution: {
                key: foundTestExecutionKey,
                summary: testExecutionSummary,
            },
            testRuns: {
                total: totalTestRuns,
                results: parsedTestRuns,
            },
            testIdsAndStatuses: testIdsAndStatuses,
            statusSummary: statusSummary,
        });
    } catch (error) {
        console.error("❌ Validation error:", error);
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

