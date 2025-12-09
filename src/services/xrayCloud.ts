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
  start: string;
  finish: string;
  evidences: XrayEvidence[];
}

export interface XrayImportRequest {
  testExecutionKey: string;
  info: {
    summary: string;
  };
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
