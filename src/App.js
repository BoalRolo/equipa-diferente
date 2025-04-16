import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
const App = () => {
    const [steps, setSteps] = useState([]);
    const [current, setCurrent] = useState({ Action: "", Data: "", "Expected Result": "" });
    const [suggestions, setSuggestions] = useState([]);
    const [title, setTitle] = useState("");
    const [copyMessage, setCopyMessage] = useState("");
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("history") || "[]");
        setSuggestions(saved);
    }, []);
    const updateHistory = (value) => {
        const history = JSON.parse(localStorage.getItem("history") || "[]");
        if (!history.includes(value)) {
            const updated = [...history, value];
            localStorage.setItem("history", JSON.stringify(updated));
            setSuggestions(updated);
        }
    };
    const handleChange = (key, value) => {
        setCurrent({ ...current, [key]: value });
    };
    const handleAddStep = () => {
        if (current.Action.trim() === "")
            return;
        setSteps([...steps, current]);
        updateHistory(current.Action);
        updateHistory(current.Data);
        updateHistory(current["Expected Result"]);
        setCurrent({ Action: "", Data: "", "Expected Result": "" });
    };
    const handleDeleteStep = (index) => {
        const newSteps = steps.filter((_, i) => i !== index);
        setSteps(newSteps);
    };
    const moveStep = (index, direction) => {
        const newSteps = [...steps];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= steps.length)
            return;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        setSteps(newSteps);
    };
    const getSuggestions = (input) => {
        if (!input)
            return [];
        return suggestions.filter((item) => item.toLowerCase().startsWith(input.toLowerCase()));
    };
    const exportJSON = () => {
        if (steps.length === 0) {
            alert("There are no steps to export.");
            return;
        }
        const filename = `${title || "steps"}.json`;
        const json = JSON.stringify(steps, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    const copyJSON = () => {
        const json = JSON.stringify(steps, null, 2);
        try {
            navigator.clipboard.writeText(json).then(() => {
                setCopyMessage("✅ JSON copied!");
                setTimeout(() => setCopyMessage(""), 2000);
            }).catch(() => {
                const textarea = document.createElement("textarea");
                textarea.value = json;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
                setCopyMessage("✅ JSON copied!");
                setTimeout(() => setCopyMessage(""), 2000);
            });
        }
        catch (err) {
            alert("Failed to copy JSON.");
        }
    };
    const Input = (props) => (_jsx("input", { ...props, className: `border-2 border-gray-400 rounded p-2 w-full ${props.className || ""}` }));
    const Button = (props) => (_jsx("button", { ...props, className: `rounded px-4 py-2 ${props.className || "bg-blue-600 text-white"}` }));
    const Card = ({ children, className = "" }) => (_jsx("div", { className: `bg-white rounded shadow ${className}`, children: children }));
    const CardContent = ({ children, className = "" }) => (_jsx("div", { className: `${className}`, children: children }));
    return (_jsxs("div", { className: "p-6 max-w-3xl mx-auto space-y-6", children: [_jsx(Card, { className: "border-2 border-gray-300 shadow-md", children: _jsxs(CardContent, { className: "space-y-4 p-4", children: [_jsx("h2", { className: "text-xl font-bold", children: "Title" }), _jsx(Input, { placeholder: "Enter a title for export...", value: title, onChange: (e) => setTitle(e.target.value) })] }) }), _jsx(Card, { className: "border-2 border-blue-300 shadow-md", children: _jsxs(CardContent, { className: "space-y-4 p-4", children: [_jsx("h2", { className: "text-xl font-bold", children: "Add a Step" }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "font-medium", children: "Action" }), _jsx(Input, { value: current.Action, onChange: (e) => handleChange("Action", e.target.value), list: "action-suggestions" }), _jsx("datalist", { id: "action-suggestions", children: getSuggestions(current.Action).map((s, i) => (_jsx("option", { value: s }, i))) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "font-medium", children: "Data" }), _jsx(Input, { value: current.Data, onChange: (e) => handleChange("Data", e.target.value), list: "data-suggestions" }), _jsx("datalist", { id: "data-suggestions", children: getSuggestions(current.Data).map((s, i) => (_jsx("option", { value: s }, i))) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "font-medium", children: "Expected Result" }), _jsx(Input, { value: current["Expected Result"], onChange: (e) => handleChange("Expected Result", e.target.value), list: "result-suggestions" }), _jsx("datalist", { id: "result-suggestions", children: getSuggestions(current["Expected Result"]).map((s, i) => (_jsx("option", { value: s }, i))) })] }), _jsx(Button, { className: "bg-blue-900 text-white hover:bg-blue-800", onClick: handleAddStep, children: "Add Step" })] }) }), _jsx(Card, { className: "border-2 border-green-300 shadow-md", children: _jsxs(CardContent, { className: "p-4 space-y-4", children: [_jsx("h2", { className: "text-xl font-bold", children: "Generated JSON" }), _jsx("div", { className: "rounded bg-black text-white text-sm overflow-auto p-3", children: _jsx(SyntaxHighlighter, { language: "json", style: oneDark, customStyle: { backgroundColor: "black", padding: "0.5rem", margin: 0, filter: "none", boxShadow: "none", textShadow: "none", borderRadius: "0.25rem" }, wrapLines: false, showLineNumbers: false, PreTag: "div", CodeTag: "div", children: JSON.stringify(steps, null, 2) }) }), _jsxs("div", { className: "flex gap-2 items-center", children: [_jsx(Button, { className: "bg-green-600 text-white hover:bg-green-500 font-semibold px-4 py-2 rounded", onClick: exportJSON, children: "Export JSON" }), _jsx(Button, { className: "bg-blue-600 text-white hover:bg-blue-500 font-semibold px-4 py-2 rounded", onClick: copyJSON, children: "Copy JSON" }), copyMessage && _jsx("span", { className: "text-green-600 font-medium", children: copyMessage })] })] }) })] }));
};
export default App;
