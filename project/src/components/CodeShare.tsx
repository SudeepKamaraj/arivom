import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CodeEditor from './CodeEditor';

const CodeShare: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [codeData, setCodeData] = useState<{ code: string; language: string } | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const encodedCode = searchParams.get('code');
    if (!encodedCode) {
      setError('No code data found in URL');
      return;
    }

    try {
      const decodedData = atob(encodedCode);
      const parsedData = JSON.parse(decodedData);
      setCodeData(parsedData);
    } catch (err) {
      setError('Invalid code data in URL');
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="/" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  if (!codeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shared code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shared Code</h1>
          <p className="text-gray-600 mb-4">
            This code was shared with you. You can view, run, and copy it.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Language: <strong className="capitalize">{codeData.language}</strong></span>
            <span>•</span>
            <span>Read-only mode</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <CodeEditor
            supportedLanguages={[codeData.language]}
            initialLanguage={codeData.language}
            initialCode={codeData.code}
            readOnly={true}
            height="400px"
          />
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About Code Sharing</h3>
          <div className="text-gray-600 space-y-2">
            <p>• This shared code is temporary and not stored on our servers</p>
            <p>• You can copy, modify, and run this code</p>
            <p>• Create your own account to save and share your own code</p>
          </div>
          <div className="mt-4">
            <a 
              href="/register" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-4"
            >
              Create Account
            </a>
            <a 
              href="/" 
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Browse Courses
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeShare;