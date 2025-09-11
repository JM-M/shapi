"use client";

import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { EditorView } from "@codemirror/view";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

export type SupportedLanguage = "json" | "yaml" | "auto";

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
  className?: string;
  onLanguageChange?: (language: SupportedLanguage) => void;
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
  className = "",
  onLanguageChange,
}: CodeEditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const [detectedLanguage, setDetectedLanguage] =
    useState<SupportedLanguage>("auto");
  const [mounted, setMounted] = useState(false);

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

    // Check for YAML (basic heuristics)
    if (
      trimmed.includes(":") &&
      (trimmed.includes("\n") || trimmed.includes("---")) &&
      !trimmed.startsWith("{") &&
      !trimmed.startsWith("[")
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
      default:
        return [];
    }
  };

  // Get the theme - handle hydration mismatch
  const getTheme = () => {
    if (!mounted) {
      return "light"; // Always render light theme on server
    }
    return resolvedTheme === "dark" ? vscodeDark : "light";
  };

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
    <div className={`code-editor ${className}`}>
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
        extensions={[...getLanguageExtension(), EditorView.lineWrapping]}
        basicSetup={{
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
        }}
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
