// src/services/xrayCloud.ts

export interface XrayAuthResponse {
  token: string;
}

export interface XrayEvidence {
  data: string; // base64 encoded file
  filename: string;
  contentType: string;
}

export interface XrayTest {
  testKey: string;
  status: "EXECUTING" | "FAILED" | "PASSED";
  start?: string; // Optional - omit to preserve original startedOn
  finish: string;
  evidences: XrayEvidence[];
  executedBy?: string; // Xray/Jira account ID of the user executing the test
}

export interface XrayImportRequest {
  testExecutionKey: string;
  tests: XrayTest[];
}

export interface XrayImportResponse {
  testExecIssue?: {
    id: string;
    key: string;
    self: string;
  };
  testIssues?: Array<{
    id: string;
    key: string;
    self: string;
  }>;
  info?: {
    summary: string;
  };
}

/**
 * Authenticates with Xray Cloud and returns a JWT token
 * Uses backend proxy to avoid CORS issues
 */
export async function authenticateXray(
  xrayBaseUrl: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
  const url = `${backendUrl}/api/xray/authenticate`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      xrayBaseUrl,
      clientId,
      clientSecret,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Authentication failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.token;
}

/**
 * Imports test execution and evidences to Xray Cloud
 * Uses backend proxy to avoid CORS issues
 */
export async function importExecution(
  xrayBaseUrl: string,
  token: string,
  importData: XrayImportRequest
): Promise<XrayImportResponse> {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
  const url = `${backendUrl}/api/xray/import`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      xrayBaseUrl,
      token,
      importData,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Import failed: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Updates test runs using GraphQL mutations
 * This allows better control over timer stopping
 */
export async function updateTestRunsViaGraphQL(
  xrayBaseUrl: string,
  token: string,
  testRunUpdates: Array<{
    testRunId: string;
    status: string;
  }>
): Promise<any> {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
  const url = `${backendUrl}/api/xray/update-test-runs-graphql`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      xrayBaseUrl,
      token,
      testRunUpdates,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Failed to update test runs: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

export interface TestExecutionValidation {
  valid: boolean;
  testExecution?: {
    key: string;
    summary: string;
    status?: string | null;
  };
  testRuns?: {
    total: number;
    results: Array<{
      id: string;
      status: string;
      statusColor: string;
      statusDescription: string;
      assigneeId?: string;
      executedById?: string;
      startedOn?: string;
      finishedOn?: string;
      comment?: string;
      test: {
        key: string;
        summary: string;
        testType: string;
      };
    }>;
  };
  testIdsAndStatuses?: Array<{
    id: string;
    testKey: string;
    status: string;
  }>;
  statusSummary?: Record<string, number>;
  error?: string;
}

/**
 * Validates a Test Execution and retrieves all its test runs
 * Uses backend proxy to avoid CORS issues
 */
export async function validateTestExecution(
  xrayBaseUrl: string,
  token: string,
  testExecutionKey: string
): Promise<TestExecutionValidation> {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
  const url = `${backendUrl}/api/xray/validate-test-execution`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      xrayBaseUrl,
      token,
      testExecutionKey,
    }),
  });

  // Check content type before parsing
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    let errorMessage = `Validation failed: ${response.status} ${response.statusText}`;

    try {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        const errorText = await response.text();
        errorMessage = `Server returned HTML instead of JSON. This usually means the endpoint doesn't exist or the backend isn't running. Status: ${response.status}`;
      }
    } catch (parseError: any) {
      errorMessage = `Failed to parse error response: ${parseError.message}`;
    }

    throw new Error(errorMessage);
  }

  // Verify we're getting JSON
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(
      "Server returned non-JSON response. Please check if the backend is running correctly and the endpoint exists."
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError: any) {
    throw new Error(
      "Failed to parse server response as JSON. The backend may have returned an error page."
    );
  }

  return data;
}
