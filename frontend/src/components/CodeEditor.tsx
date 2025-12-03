import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: 'javascript' | 'python' | 'java' | 'typescript';
  readOnly?: boolean;
  height?: string;
  theme?: 'light' | 'dark';
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  readOnly = false,
  height = '100%',
  theme = 'dark',
}: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      autoIndent: 'full',
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      formatOnType: true,
    });
  };

  const handleChange = (newValue: string | undefined) => {
    if (newValue !== undefined && !readOnly) {
      onChange?.(newValue);
    }
  };

  // Map our language names to Monaco language IDs
  const getMonacoLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      javascript: 'javascript',
      typescript: 'typescript',
      python: 'python',
      java: 'java',
    };
    return languageMap[lang] || 'javascript';
  };

  return (
    <Editor
      height={height}
      defaultLanguage={getMonacoLanguage(language)}
      language={getMonacoLanguage(language)}
      value={value}
      onChange={handleChange}
      onMount={handleEditorMount}
      theme={theme === 'dark' ? 'vs-dark' : 'vs'}
      options={{
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        autoIndent: 'full',
        tabSize: 2,
        insertSpaces: true,
        formatOnPaste: true,
        formatOnType: true,
        padding: { top: 16, bottom: 16 },
        fontSize: 13,
        fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
        lineHeight: 1.6,
        bracketPairColorization: {
          enabled: true,
        },
      }}
    />
  );
}
