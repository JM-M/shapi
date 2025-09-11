# Code Editor Component

A powerful React code editor component built with `@uiw/react-codemirror` that supports JSON and YAML editing with auto-detection capabilities.

## Features

- 🚀 **JSON Support**: Full JSON syntax highlighting and validation
- 📝 **YAML Support**: Complete YAML syntax highlighting and formatting
- 🔍 **Auto-detection**: Automatically detects JSON or YAML based on content
- 🌙 **Theme Support**: Automatically adapts to light/dark themes
- 📱 **Responsive**: Fully responsive design with customizable dimensions
- 🎯 **TypeScript**: Built with TypeScript for better developer experience
- ⚡ **Performance**: Optimized for smooth editing experience

## Components

### `CodeEditor`

The main code editor component with support for JSON and YAML.

```tsx
import { CodeEditor } from "@/components/code-editor";

<CodeEditor
  value={value}
  onChange={setValue}
  language="json" // or "yaml" or "auto"
  placeholder="Enter your code here..."
  height="400px"
  readOnly={false}
/>;
```

### `CodeEditorWithSelector`

A code editor with an integrated language selector.

```tsx
import { CodeEditorWithSelector } from "@/components/code-editor";

<CodeEditorWithSelector
  value={value}
  onChange={setValue}
  showLanguageSelector={true}
  placeholder="Try pasting JSON or YAML content!"
/>;
```

### `LanguageSelector`

A standalone language selector component.

```tsx
import { LanguageSelector } from "@/components/code-editor";

<LanguageSelector value={language} onChange={setLanguage} />;
```

## Hooks

### `useCodeEditor`

A custom hook for managing code editor state.

```tsx
import { useCodeEditor } from "@/hooks/use-code-editor";

const { value, language, setValue, setLanguage, reset, setValueAndLanguage } =
  useCodeEditor({
    initialValue: "",
    initialLanguage: "auto",
  });
```

## Props

### CodeEditor Props

| Prop               | Type                                    | Default                     | Description                             |
| ------------------ | --------------------------------------- | --------------------------- | --------------------------------------- |
| `value`            | `string`                                | -                           | The current value of the editor         |
| `onChange`         | `(value: string) => void`               | -                           | Callback when the value changes         |
| `language`         | `'json' \| 'yaml' \| 'auto'`            | `'auto'`                    | The language mode                       |
| `placeholder`      | `string`                                | `'Enter your code here...'` | Placeholder text                        |
| `height`           | `string`                                | `'400px'`                   | Height of the editor                    |
| `minHeight`        | `string`                                | `'200px'`                   | Minimum height                          |
| `maxHeight`        | `string`                                | `'600px'`                   | Maximum height                          |
| `width`            | `string`                                | `'100%'`                    | Width of the editor                     |
| `readOnly`         | `boolean`                               | `false`                     | Whether the editor is read-only         |
| `className`        | `string`                                | `''`                        | Additional CSS classes                  |
| `onLanguageChange` | `(language: SupportedLanguage) => void` | -                           | Callback when language is auto-detected |

## Usage Examples

### Basic JSON Editor

```tsx
import { CodeEditor } from "@/components/code-editor";

function MyComponent() {
  const [jsonData, setJsonData] = useState('{"name": "example"}');

  return (
    <CodeEditor
      value={jsonData}
      onChange={setJsonData}
      language="json"
      height="300px"
    />
  );
}
```

### Auto-detect Editor with Language Selector

```tsx
import { CodeEditorWithSelector } from "@/components/code-editor";

function MyComponent() {
  const [code, setCode] = useState("");

  return (
    <CodeEditorWithSelector
      value={code}
      onChange={setCode}
      placeholder="Paste JSON or YAML content here..."
      height="400px"
    />
  );
}
```

### Using the Hook

```tsx
import { useCodeEditor } from "@/hooks/use-code-editor";

function MyComponent() {
  const editor = useCodeEditor({
    initialValue: '{"example": "data"}',
    initialLanguage: "json",
  });

  return (
    <div>
      <CodeEditor
        value={editor.value}
        onChange={editor.setValue}
        language={editor.language}
      />
      <button onClick={editor.reset}>Reset</button>
    </div>
  );
}
```

## Dependencies

- `@uiw/react-codemirror`: Main CodeMirror React wrapper
- `@uiw/codemirror-extensions-langs`: Language extensions
- `@uiw/codemirror-themes`: Theme support
- `js-yaml`: YAML parsing and formatting utilities

## Demo

Visit `/code-editor-demo` to see the component in action with various examples and features.
