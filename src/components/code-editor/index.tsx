// TODO: Consider deleting this component

"use client";

import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { EditorView } from "@codemirror/view";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import type { BasicSetupOptions } from "@uiw/react-codemirror";
import CodeMirror from "@uiw/react-codemirror";
import { Check, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

export type SupportedLanguage = "json" | "yaml" | "typescript" | "auto";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: SupportedLanguage;
  placeholder?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  width?: string;
  readOnly?: boolean;
  hideCursor?: boolean;
  className?: string;
  onLanguageChange?: (language: SupportedLanguage) => void;
  basicSetup?: BasicSetupOptions;
  showCopyButton?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = "auto",
  placeholder = "Enter your code here...",
  height = "400px",
  minHeight = "200px",
  maxHeight = "600px",
  width = "100%",
  readOnly = false,
  hideCursor = false,
  className = "",
  onLanguageChange,
  basicSetup,
  showCopyButton = false,
}: CodeEditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const [detectedLanguage, setDetectedLanguage] =
    useState<SupportedLanguage>("auto");
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle hydration mismatch by ensuring component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-detect language based on content
  const detectLanguage = (content: string): SupportedLanguage => {
    if (!content.trim()) return "auto";

    const trimmed = content.trim();

    // Check for JSON
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        JSON.parse(trimmed);
        return "json";
      } catch {
        // Not valid JSON, continue checking
      }
    }

    // Check for TypeScript/JavaScript (basic heuristics)
    if (
      (trimmed.includes("interface ") ||
        trimmed.includes("type ") ||
        trimmed.includes("enum ") ||
        trimmed.includes("function ") ||
        trimmed.includes("const ") ||
        trimmed.includes("let ") ||
        trimmed.includes("var ")) &&
      !trimmed.startsWith("{") &&
      !trimmed.startsWith("[")
    ) {
      return "typescript";
    }

    // Check for YAML (basic heuristics)
    if (
      trimmed.includes(":") &&
      (trimmed.includes("\n") || trimmed.includes("---")) &&
      !trimmed.startsWith("{") &&
      !trimmed.startsWith("[") &&
      !trimmed.includes("interface ") &&
      !trimmed.includes("type ")
    ) {
      return "yaml";
    }

    return "auto";
  };

  // Determine the actual language to use
  const actualLanguage = useMemo(() => {
    if (language === "auto") {
      const detected = detectLanguage(value);
      if (detected !== detectedLanguage) {
        setDetectedLanguage(detected);
        onLanguageChange?.(detected);
      }
      return detected;
    }
    return language;
  }, [language, value, detectedLanguage, onLanguageChange]);

  // Get the appropriate language extension
  const getLanguageExtension = () => {
    switch (actualLanguage) {
      case "json":
        return [json()];
      case "yaml":
        return [yaml()];
      case "typescript":
        return [javascript({ typescript: true })];
      default:
        return [];
    }
  };

  // Get extensions including cursor hiding if needed
  const getExtensions = () => {
    const extensions = [...getLanguageExtension(), EditorView.lineWrapping];

    // Hide cursor and prevent selection if hideCursor is true
    if (hideCursor) {
      extensions.push(EditorView.editable.of(false));
    }

    return extensions;
  };

  // Get the theme - handle hydration mismatch
  const getTheme = () => {
    if (!mounted) {
      return "light"; // Always render light theme on server
    }
    return resolvedTheme === "dark" ? vscodeDark : "light";
  };

  // Default basic setup configuration
  const defaultBasicSetup: BasicSetupOptions = {
    lineNumbers: true,
    foldGutter: true,
    dropCursor: false,
    allowMultipleSelections: false,
    indentOnInput: true,
    bracketMatching: true,
    closeBrackets: true,
    autocompletion: true,
    highlightActiveLine: true,
    highlightSelectionMatches: true,
    searchKeymap: true,
  };

  // Merge user-provided basicSetup with defaults
  const basicSetupWithDefaults = useMemo(() => {
    return { ...defaultBasicSetup, ...basicSetup };
  }, [basicSetup]);

  // Handle value changes
  const handleChange = (newValue: string) => {
    onChange(newValue);

    // Auto-detect language if in auto mode
    if (language === "auto") {
      const detected = detectLanguage(newValue);
      if (detected !== detectedLanguage) {
        setDetectedLanguage(detected);
        onLanguageChange?.(detected);
      }
    }
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div
        className={`code-editor ${className}`}
        style={{
          height,
          minHeight,
          maxHeight,
          width,
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
        }}
      >
        Loading editor...
      </div>
    );
  }

  return (
    <div
      className={`code-editor rounded-md border ${className}`}
      style={{
        position: "relative",
        paddingTop: showCopyButton ? "36px" : "0",
      }}
    >
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md bg-gray-100/30 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100/80 dark:bg-gray-700/30 dark:text-gray-300 dark:hover:bg-gray-700/80"
          title={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      )}
      <CodeMirror
        value={value}
        onChange={handleChange}
        height={height}
        minHeight={minHeight}
        maxHeight={maxHeight}
        width={width}
        placeholder={placeholder}
        readOnly={readOnly}
        theme={getTheme()}
        extensions={getExtensions()}
        basicSetup={basicSetupWithDefaults}
      />
    </div>
  );
}

// Language selector component
interface LanguageSelectorProps {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
  className?: string;
}

export function LanguageSelector({
  value,
  onChange,
  className = "",
}: LanguageSelectorProps) {
  const languages: { value: SupportedLanguage; label: string }[] = [
    { value: "auto", label: "Auto-detect" },
    { value: "json", label: "JSON" },
    { value: "yaml", label: "YAML" },
    { value: "typescript", label: "TypeScript" },
  ];

  return (
    <div className={`language-selector ${className}`}>
      <label
        htmlFor="language-select"
        className="mb-2 block text-sm font-medium"
      >
        Language
      </label>
      <select
        id="language-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SupportedLanguage)}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Combined component with language selector
interface CodeEditorWithSelectorProps
  extends Omit<CodeEditorProps, "language" | "onLanguageChange"> {
  showLanguageSelector?: boolean;
  languageSelectorClassName?: string;
}

export function CodeEditorWithSelector({
  showLanguageSelector = true,
  languageSelectorClassName = "",
  ...codeEditorProps
}: CodeEditorWithSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedLanguage>("auto");

  return (
    <div className="space-y-4">
      {showLanguageSelector && (
        <LanguageSelector
          value={selectedLanguage}
          onChange={setSelectedLanguage}
          className={languageSelectorClassName}
        />
      )}
      <CodeEditor
        {...codeEditorProps}
        language={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />
    </div>
  );
}
