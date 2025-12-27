import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';

const CodeGenerator = ({ endpoint, method, headers, body, apiKey }) => {
  const [copied, setCopied] = useState(null);
  const [selectedLang, setSelectedLang] = useState('curl');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const fullUrl = `${backendUrl}${endpoint}`;

  // Generate code snippets
  const generateCurl = () => {
    let curl = `curl -X ${method} "${fullUrl}"`;
    
    if (apiKey) {
      curl += ` \\
  -H "Authorization: Bearer ${apiKey}"`;
    }
    
    Object.entries(headers).forEach(([key, value]) => {
      if (value) {
        curl += ` \\
  -H "${key}: ${value}"`;
      }
    });

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      curl += ` \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(JSON.parse(body), null, 2)}'`;
    }

    return curl;
  };

  const generatePython = () => {
    let code = `import requests\nimport json\n\n`;
    code += `url = "${fullUrl}"\n\n`;
    
    code += `headers = {\n`;
    if (apiKey) {
      code += `    "Authorization": f"Bearer ${apiKey}",\n`;
    }
    Object.entries(headers).forEach(([key, value]) => {
      if (value) {
        code += `    "${key}": "${value}",\n`;
      }
    });
    code += `}\n\n`;

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      code += `payload = ${JSON.stringify(JSON.parse(body), null, 2)}\n\n`;
      code += `response = requests.${method.toLowerCase()}(url, headers=headers, json=payload)\n`;
    } else {
      code += `response = requests.${method.toLowerCase()}(url, headers=headers)\n`;
    }

    code += `\nprint(f"Status: {response.status_code}")\n`;
    code += `print(response.json())`;

    return code;
  };

  const generateJavaScript = () => {
    let code = `const url = "${fullUrl}";\n\n`;
    
    code += `const options = {\n`;
    code += `  method: "${method}",\n`;
    code += `  headers: {\n`;
    if (apiKey) {
      code += `    "Authorization": \`Bearer \${apiKey}\`,\n`;
    }
    Object.entries(headers).forEach(([key, value]) => {
      if (value) {
        code += `    "${key}": "${value}",\n`;
      }
    });
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      code += `    "Content-Type": "application/json",\n`;
    }
    code += `  },\n`;

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      code += `  body: JSON.stringify(${JSON.stringify(JSON.parse(body), null, 2)})\n`;
    }
    code += `};\n\n`;

    code += `fetch(url, options)\n`;
    code += `  .then(response => response.json())\n`;
    code += `  .then(data => console.log(data))\n`;
    code += `  .catch(error => console.error('Error:', error));`;

    return code;
  };

  const codeSnippets = {
    curl: { code: generateCurl(), language: 'bash' },
    python: { code: generatePython(), language: 'python' },
    javascript: { code: generateJavaScript(), language: 'javascript' }
  };

  const copyToClipboard = (text, lang) => {
    navigator.clipboard.writeText(text);
    setCopied(lang);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentSnippet = codeSnippets[selectedLang];

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      {/* Language Selector */}
      <div className="flex items-center justify-between bg-gray-900/50 px-4 py-2 border-b border-gray-700">
        <div className="flex gap-2">
          {Object.keys(codeSnippets).map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedLang === lang
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => copyToClipboard(currentSnippet.code, selectedLang)}
          className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
        >
          {copied === selectedLang ? (
            <>
              <Check size={16} className="text-green-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Display */}
      <div className="overflow-x-auto">
        <Highlight
          theme={themes.nightOwl}
          code={currentSnippet.code}
          language={currentSnippet.language}
        >
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre
              style={style}
              className="p-4 text-sm font-mono overflow-x-auto"
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
};

export default CodeGenerator;
