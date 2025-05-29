import React, { useState } from "react";
import { parseCsvWithDetection } from '../lib/csvParser';

interface CsvUploadProps {
  onDataParsed: (data: any[], months: string[]) => void;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ onDataParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      setSuccess(false);
      return;
    }
    setError(null);
    setSuccess(false);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const { data, months } = parseCsvWithDetection(text);
        onDataParsed(data, months);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error parsing CSV');
        setSuccess(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div
        className={`upload-area${isDragging ? ' dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-lg font-semibold">Drag and drop your CSV file here</div>
          <div className="desc">or</div>
          <label>
            Browse Files
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="desc">Only CSV files are supported</p>
        </div>
      </div>
      {success && (
        <div style={{ color: 'var(--brand-green)', marginTop: 16, textAlign: 'center', fontWeight: 500 }}>
          <svg style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          CSV parsed successfully!
        </div>
      )}
      {error && (
        <div style={{ color: '#ff4d4f', marginTop: 16, textAlign: 'center', fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default CsvUpload; 