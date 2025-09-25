import { CodeEditor } from "@/components/code-editor";

export const Response = () => {
  return (
    <div className="p-2">
      <CodeEditor
        value={""}
        onChange={() => {}}
        placeholder=""
        readOnly
        hideCursor
      />
    </div>
  );
};
