import React, { useState, useRef } from "react";
import { useDarkMode } from "../contexts/DarkModeContext";
import Header from "../components/Header";
import {
  authenticateXray,
  importExecution,
  XrayTest,
  XrayEvidence,
} from "../services/xrayCloud";

interface FileWithTestRun {
  file: File;
  testRunNumber: string;
  testKey: string;
}

interface GroupedFiles {
  [testRunNumber: string]: FileWithTestRun[];
}

export default function ImportEvidence() {
  const { isDarkMode } = useDarkMode();
  const [testExecutionKey, setTestExecutionKey] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [invalidFiles, setInvalidFiles] = useState<File[]>([]);
  const [groupedFiles, setGroupedFiles] = useState<GroupedFiles>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<"files" | "folder">("files");

  // Get Xray Cloud configuration from environment variables
  const xrayBaseUrl = import.meta.env.VITE_XRAY_BASE_URL || "";
  const clientId = import.meta.env.VITE_XRAY_CLIENT_ID || "";
  const clientSecret = import.meta.env.VITE_XRAY_CLIENT_SECRET || "";

  /**
   * Extracts Test Run number from filename
   * Format: UAAS-<number>.extension or UAAS-<number>-anything.extension
   */
  const extractTestRunNumber = (filename: string): string | null => {
    // Matches: UAAS-123.ext or UAAS-123-anything.ext
    const match = filename.match(/^UAAS-(\d+)(?:-.*)?\./);
    return match ? match[1] : null;
  };

  /**
   * Converts a File to base64 string
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Gets MIME type from file extension
   */
  const getContentType = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      mp4: "video/mp4",
      txt: "text/plain",
      log: "text/plain",
      pdf: "application/pdf",
      json: "application/json",
    };
    return mimeTypes[extension || ""] || "application/octet-stream";
  };

  /**
   * Processes uploaded files and groups them by Test Run
   */
  const processFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const fileArray = Array.from(fileList);
    const grouped: GroupedFiles = {};
    const processedFiles: File[] = [];
    const invalid: File[] = [];

    fileArray.forEach((file) => {
      const testRunNumber = extractTestRunNumber(file.name);
      if (testRunNumber) {
        const testKey = `UAAS-${testRunNumber}`;
        if (!grouped[testRunNumber]) {
          grouped[testRunNumber] = [];
        }
        grouped[testRunNumber].push({
          file,
          testRunNumber,
          testKey,
        });
        processedFiles.push(file);
      } else {
        invalid.push(file);
      }
    });

    setFiles(fileArray); // Store all files for display
    setInvalidFiles(invalid);
    setGroupedFiles(grouped);
    setResult(null);
  };

  /**
   * Handles file/folder input change
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  /**
   * Triggers file or folder selection based on current mode
   */
  const handleUploadClick = () => {
    if (uploadMode === "folder" && folderInputRef.current) {
      folderInputRef.current.click();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Converts grouped files to Xray format and imports to Xray Cloud
   */
  const handleImport = async () => {
    if (!testExecutionKey.trim()) {
      setResult({
        success: false,
        message: "Por favor, introduza o ID da Test Execution",
      });
      return;
    }

    if (Object.keys(groupedFiles).length === 0) {
      setResult({
        success: false,
        message: "Por favor, faça upload de ficheiros válidos",
      });
      return;
    }

    if (!xrayBaseUrl || !clientId || !clientSecret) {
      setResult({
        success: false,
        message:
          "As credenciais do Xray Cloud não estão configuradas. Por favor, configure as variáveis de ambiente VITE_XRAY_BASE_URL, VITE_XRAY_CLIENT_ID e VITE_XRAY_CLIENT_SECRET no ficheiro .env.local",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      // Step 1: Authenticate
      const token = await authenticateXray(xrayBaseUrl, clientId, clientSecret);

      // Step 2: Prepare test data with evidences
      const tests: XrayTest[] = [];

      for (const [testRunNumber, fileGroup] of Object.entries(groupedFiles)) {
        const evidences: XrayEvidence[] = [];

        for (const fileWithTestRun of fileGroup) {
          const base64Data = await fileToBase64(fileWithTestRun.file);
          evidences.push({
            data: base64Data,
            filename: fileWithTestRun.file.name,
            contentType: getContentType(fileWithTestRun.file.name),
          });
        }

        // Use current date/time for start and finish
        const now = new Date();
        const finish = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes later

        tests.push({
          testKey: `UAAS-${testRunNumber}`,
          status: "PASSED", // Default status, can be changed if needed
          start: now.toISOString(),
          finish: finish.toISOString(),
          evidences,
        });
      }

      // Step 3: Import execution
      const importData = {
        testExecutionKey: testExecutionKey.trim(),
        info: {
          summary: `Upload de Evidência e Status para ${testExecutionKey.trim()}`,
        },
        tests,
      };

      const response = await importExecution(xrayBaseUrl, token, importData);

      setResult({
        success: true,
        message: `Importação realizada com sucesso!`,
        details: response,
      });

      // Clear files after successful import
      setFiles([]);
      setInvalidFiles([]);
      setGroupedFiles({});
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Erro ao importar evidências",
        details: error,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900"
      }`}
    >
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center space-y-4 animate-fade-in mb-8">
          <h2
            className={`text-4xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Import Evidence
          </h2>
          <p
            className={`text-xl ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } animate-fade-in-up max-w-2xl mx-auto`}
          >
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Test Execution Input */}
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } rounded-xl shadow-lg p-6`}
          >
            <h3
              className={`text-xl font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Test Execution
            </h3>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                ID da Test Execution
              </label>
              <input
                type="text"
                value={testExecutionKey}
                onChange={(e) => setTestExecutionKey(e.target.value)}
                placeholder="UAAS-25085"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } rounded-xl shadow-lg p-6`}
          >
            <h3
              className={`text-xl font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Upload de Ficheiros
            </h3>
            <div className="space-y-4">
              {/* Upload Mode Toggle */}
              <div className="flex items-center space-x-4 mb-4">
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Modo de upload:
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setUploadMode("files")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      uploadMode === "files"
                        ? "bg-blue-600 text-white"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Ficheiros
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("folder")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      uploadMode === "folder"
                        ? "bg-blue-600 text-white"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Pasta
                  </button>
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={folderInputRef}
                type="file"
                {...({ webkitdirectory: "" } as any)}
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload Button */}
              <button
                type="button"
                onClick={handleUploadClick}
                className={`w-full px-6 py-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 hover:border-blue-500 hover:bg-gray-600 text-white"
                    : "border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50 text-gray-700"
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="font-medium">
                    {uploadMode === "folder"
                      ? "Selecionar Pasta"
                      : "Selecionar Ficheiros"}
                  </span>
                  <span
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {uploadMode === "folder"
                      ? "Selecione uma pasta para fazer upload de todos os ficheiros"
                      : "Selecione um ou mais ficheiros"}
                  </span>
                </div>
              </button>

              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Os ficheiros devem seguir o formato:
                UAAS-&lt;número&gt;.extensão ou
                UAAS-&lt;número&gt;-qualquer_coisa.extensão
              </p>

              {/* Files List - Show all uploaded files */}
              {files.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <h4
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Ficheiros Selecionados ({files.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setFiles([]);
                        setInvalidFiles([]);
                        setGroupedFiles({});
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                        if (folderInputRef.current) {
                          folderInputRef.current.value = "";
                        }
                      }}
                      className={`text-xs px-3 py-1 rounded ${
                        isDarkMode
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-red-100 hover:bg-red-200 text-red-700"
                      } transition-colors`}
                    >
                      Limpar todos
                    </button>
                  </div>
                  <div
                    className={`max-h-60 overflow-y-auto space-y-2 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    } rounded-lg p-4`}
                  >
                    {files.map((file, idx) => {
                      const isValid = extractTestRunNumber(file.name) !== null;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2 rounded ${
                            isValid
                              ? isDarkMode
                                ? "bg-green-900/30 border border-green-700/50"
                                : "bg-green-50 border border-green-200"
                              : isDarkMode
                              ? "bg-red-900/30 border border-red-700/50"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <svg
                              className={`w-5 h-5 flex-shrink-0 ${
                                isValid
                                  ? isDarkMode
                                    ? "text-green-400"
                                    : "text-green-600"
                                  : isDarkMode
                                  ? "text-red-400"
                                  : "text-red-600"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {isValid ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              )}
                            </svg>
                            <span
                              className={`text-sm truncate ${
                                isDarkMode ? "text-gray-200" : "text-gray-700"
                              }`}
                              title={file.name}
                            >
                              {file.name}
                            </span>
                          </div>
                          <span
                            className={`text-xs ml-2 ${
                              isValid
                                ? isDarkMode
                                  ? "text-green-400"
                                  : "text-green-600"
                                : isDarkMode
                                ? "text-red-400"
                                : "text-red-600"
                            }`}
                          >
                            {isValid ? "✓ Válido" : "✗ Inválido"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {invalidFiles.length > 0 && (
                    <p
                      className={`text-xs mt-2 ${
                        isDarkMode ? "text-yellow-400" : "text-yellow-600"
                      }`}
                    >
                      ⚠ {invalidFiles.length} ficheiro(s) não seguem o formato
                      correto e serão ignorados
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Grouped Files Preview */}
          {Object.keys(groupedFiles).length > 0 && (
            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-lg p-6`}
            >
              <h3
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Ficheiros Agrupados por Test Run
              </h3>
              <div className="space-y-4">
                {Object.entries(groupedFiles).map(
                  ([testRunNumber, fileGroup]) => (
                    <div
                      key={testRunNumber}
                      className={`p-4 rounded-lg ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`font-semibold mb-2 ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        Test Run: UAAS-{testRunNumber} ({fileGroup.length}{" "}
                        ficheiro
                        {fileGroup.length !== 1 ? "s" : ""})
                      </div>
                      <ul className="list-disc list-inside space-y-1">
                        {fileGroup.map((item, idx) => (
                          <li
                            key={idx}
                            className={`text-sm ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {item.file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Import Button */}
          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={
                isProcessing ||
                Object.keys(groupedFiles).length === 0 ||
                !testExecutionKey.trim()
              }
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isProcessing ||
                Object.keys(groupedFiles).length === 0 ||
                !testExecutionKey.trim()
                  ? "bg-gray-400 cursor-not-allowed text-gray-600"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {isProcessing ? "A processar..." : "Importar para Xray Cloud"}
            </button>
          </div>
          {Object.keys(groupedFiles).length === 0 && files.length > 0 && (
            <div
              className={`text-sm text-center ${
                isDarkMode ? "text-yellow-400" : "text-yellow-600"
              }`}
            >
              ⚠ Nenhum ficheiro válido encontrado. Verifique se os nomes seguem
              o formato UAAS-&lt;número&gt;.extensão ou
              UAAS-&lt;número&gt;-qualquer_coisa.extensão
            </div>
          )}

          {/* Result Message */}
          {result && (
            <div
              className={`rounded-xl shadow-lg p-6 ${
                result.success
                  ? isDarkMode
                    ? "bg-green-900 border border-green-700"
                    : "bg-green-50 border border-green-200"
                  : isDarkMode
                  ? "bg-red-900 border border-red-700"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div
                className={`font-semibold mb-2 ${
                  result.success
                    ? isDarkMode
                      ? "text-green-300"
                      : "text-green-800"
                    : isDarkMode
                    ? "text-red-300"
                    : "text-red-800"
                }`}
              >
                {result.success ? "✓ Sucesso" : "✗ Erro"}
              </div>
              <div
                className={`${
                  result.success
                    ? isDarkMode
                      ? "text-green-200"
                      : "text-green-700"
                    : isDarkMode
                    ? "text-red-200"
                    : "text-red-700"
                }`}
              >
                {result.message}
              </div>
              {result.details && (
                <details className="mt-4">
                  <summary
                    className={`cursor-pointer text-sm ${
                      result.success
                        ? isDarkMode
                          ? "text-green-300"
                          : "text-green-600"
                        : isDarkMode
                        ? "text-red-300"
                        : "text-red-600"
                    }`}
                  >
                    Ver detalhes
                  </summary>
                  <pre
                    className={`mt-2 p-4 rounded text-xs overflow-auto ${
                      isDarkMode
                        ? "bg-gray-900 text-gray-300"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
