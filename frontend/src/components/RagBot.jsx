import React, { useState } from 'react';
import { UploadCloud, Send, Loader, AlertCircle, CheckCircle, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const RagBot = () => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(''); // '', 'success', 'error'

  const handlePdfChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }
    
    setPdfFile(file);
    setIsUploading(true);
    setUploadStatus('');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const UPLOAD_URL = 'http://localhost:8000/api/upload';

    try {
      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed.');
      }
      
      const result = await response.json();
      console.log(result.message);
      setUploadStatus('success');

    } catch (err) {
      setUploadStatus('error');
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setAnswer('');
    setError(null);

    const API_URL = 'http://localhost:8000/api/query_stream';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        let errorMsg = `Server responded with status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      
      const responseData = await response.json();
      setAnswer(responseData.response || "No 'response' key in the result.");

    } catch (err) {
      setError(err.message || 'An error occurred while fetching the response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            RAG Bot
        </h1>
        <p className="text-lg text-center text-gray-400 mb-10">
            Upload a PDF and ask questions about its content.
        </p>
        <div className="space-y-6">
            <PdfUpload 
              pdfFile={pdfFile} 
              handlePdfChange={handlePdfChange} 
              isUploading={isUploading} 
              uploadStatus={uploadStatus} 
            />
            <QueryForm query={query} setQuery={setQuery} handleSubmit={handleSubmit} isLoading={isLoading || isUploading} />
            <AnswerDisplay answer={answer} isLoading={isLoading} error={error} />
        </div>
    </div>
  );
};

const PdfUpload = ({ pdfFile, handlePdfChange, isUploading, uploadStatus }) => (
    <div className="p-6 border-2 border-dashed border-gray-600 rounded-lg text-center bg-gray-700/30 hover:border-blue-500 transition-colors">
      <UploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <label htmlFor="pdf-upload" className={`cursor-pointer ${isUploading ? 'cursor-not-allowed' : ''}`}>
        <span className="font-semibold text-blue-400">
          {isUploading ? 'Uploading...' : 'Click to upload a PDF'}
        </span>
        <p className="text-xs text-gray-500 mt-1">PDF (MAX. 800MB)</p>
      </label>
      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        onChange={handlePdfChange}
        className="hidden"
        disabled={isUploading}
      />
      {isUploading && pdfFile && (
        <div className="mt-4 text-sm flex items-center justify-center text-blue-300">
          <Loader className="w-5 h-5 mr-2 animate-spin" />
          <span>Uploading: {pdfFile.name}</span>
        </div>
      )}
      {!isUploading && pdfFile && uploadStatus === 'success' && (
        <div className="mt-4 text-sm flex items-center justify-center text-green-400">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>Ready to query: {pdfFile.name}</span>
        </div>
      )}
       {!isUploading && pdfFile && uploadStatus === 'error' && (
        <div className="mt-4 text-sm flex items-center justify-center text-red-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Upload failed. Please try again.</span>
        </div>
      )}
    </div>
);
  
const QueryForm = ({ query, setQuery, handleSubmit, isLoading }) => (
<form onSubmit={handleSubmit} className="flex gap-4">
    <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Ask me anything about your document..."
    className="flex-1 px-5 py-3 text-lg bg-gray-700/50 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
    disabled={isLoading}
    />
    <button
    type="submit"
    className="flex items-center justify-center px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
    disabled={isLoading}
    >
    {isLoading ? (
        <Loader className="animate-spin w-6 h-6" />
    ) : (
        <Send className="w-6 h-6" />
    )}
    </button>
</form>
);

const AnswerDisplay = ({ answer, isLoading, error }) => (
<div className="min-h-[250px] p-6 bg-gray-900/50 rounded-lg border border-gray-700">
    {isLoading && !answer && (
    <div className="flex items-center justify-center h-full text-gray-400">
        <Loader className="w-8 h-8 mr-4 animate-spin" />
        <p className="text-lg">Thinking...</p>
    </div>
    )}
    {error && (
    <div className="flex items-center p-4 text-red-400 bg-red-900/50 rounded-lg">
        <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
        <span className="text-md">{error}</span>
    </div>
    )}
    {answer && (
     <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="prose prose-invert max-w-none text-lg leading-relaxed mt-1 w-full">
            <ReactMarkdown>{answer}</ReactMarkdown>
        </div>
    </div>
    )}
</div>
);

export default RagBot;
