import React from 'react';
import Editor from "@monaco-editor/react";

const CodingEditor = ({ code, setCode, language }) => {
  const languageMap = {
    'java': 'java',
    'python': 'python',
    'c': 'c',
    'cpp': 'cpp',
    'sql': 'sql'
  };

  return (
    <div className="h-full border rounded-xl overflow-hidden shadow-inner">
      <Editor
        height="100%"
        defaultLanguage={languageMap[language.toLowerCase()] || 'javascript'}
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value)}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          formatOnPaste: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodingEditor;
