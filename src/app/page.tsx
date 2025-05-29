"use client";
import React, { useState } from "react";
import CsvUpload from "../components/CsvUpload";
import Dashboard from "../components/Dashboard";
import { KeywordData } from "../lib/types";

interface UserMonthData {
  month: string;
  convValue: number;
  cost: number;
}

export default function Home() {
  const [data, setData] = useState<KeywordData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(true);
  const [userData, setUserData] = useState<UserMonthData[]>([]);

  const handleDataParsed = (parsedData: KeywordData[], parsedMonths: string[]) => {
    setData(parsedData);
    setMonths(parsedMonths);
    setParseError(parsedData.length === 0 ? 'No data rows found in CSV.' : null);
    if (parsedData.length > 0 && parsedMonths.length > 0) {
      setShowUpload(false);
    }
  };

  const handleNewUpload = () => {
    setData([]);
    setMonths([]);
    setParseError(null);
    setShowUpload(true);
  };

  const handleUserDataUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      // Use row 3 (index 2) as the header row for campaign uploads
      const headers = lines[2].split(',').map(h => h.trim().toLowerCase());
      const monthIdx = headers.findIndex(h => h === 'month');
      const convIdx = headers.findIndex(h => h === 'conv. value');
      const costIdx = headers.findIndex(h => h === 'cost');
      if (monthIdx !== -1 && convIdx !== -1 && costIdx !== -1) {
        const userDataArr: UserMonthData[] = [];
        for (let i = 3; i < lines.length; i++) {
          const row = lines[i].split(',');
          const month = row[monthIdx]?.trim();
          const convValue = parseFloat((row[convIdx] || '').replace(/"|,/g, '')) || 0;
          const cost = parseFloat((row[costIdx] || '').replace(/"|,/g, '')) || 0;
          if (month) userDataArr.push({ month, convValue, cost });
        }
        console.log('Extracted userData:', userDataArr);
        setUserData(userDataArr);
        return;
      }
      // ... do not show any legacy error messages or Total: Account logic ...
    };
    reader.readAsText(file);
  };

  return (
    <div className="dashboard-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-light)', padding: '19px 0' }}>
      <div className="dashboard-card" style={{ width: '100%', maxWidth: 1280, background: 'var(--brand-dark)', borderRadius: 24, boxShadow: '0 8px 32px rgba(35,80,27,0.12)', padding: '25.6px 19.2px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Top menu */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 25.6, gap: 12.8 }}>
          {!showUpload && (
            <>
              <button
                onClick={handleNewUpload}
                className="interactive-button"
                style={{
                  background: 'var(--brand-green)',
                  color: 'var(--brand-white)',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 32px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 18,
                  boxShadow: '0 2px 8px rgba(35,80,27,0.10)',
                  letterSpacing: 0.2,
                  transition: 'background 0.2s',
                  marginRight: 8
                }}
              >
                Upload New CSV
              </button>
              <label
                className="interactive-button"
                style={{
                  background: 'var(--brand-accent)',
                  color: 'var(--brand-white)',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 32px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 18,
                  boxShadow: '0 2px 8px rgba(35,80,27,0.10)',
                  letterSpacing: 0.2,
                  transition: 'background 0.2s',
                  display: 'inline-block'
                }}
              >
                Upload My Google Ads Data
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleUserDataUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </>
          )}
        </div>
        {!showUpload && <div style={{ borderBottom: '1px solid #2d4c2a', marginBottom: 32 }} />}
        {showUpload && (
          <div className="dashboard-header" style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ color: 'var(--brand-white)', fontSize: '1.45rem', fontWeight: 700, marginBottom: 6 }}>Google Ads TAM Dashboard</p>
            <div className="subtitle" style={{ color: 'var(--brand-light)', fontSize: '1.15rem', fontWeight: 500 }}>Upload your keyword data to analyze market potential</div>
          </div>
        )}
        {showUpload && (
          <div className="upload-card" style={{ background: 'var(--brand-accent)', borderRadius: 12, boxShadow: '0 4px 16px rgba(35,80,27,0.10)', padding: '16px 12.8px', marginBottom: 38.4 }}>
            <CsvUpload onDataParsed={handleDataParsed} />
          </div>
        )}
        {parseError && <div className="placeholder" style={{ color: '#ff4d4f', marginBottom: 32 }}>{parseError}</div>}
        {data.length > 0 && months.length > 0 && !showUpload ? (
          <div style={{ marginTop: 24 }}>
            <Dashboard data={data} months={months} userData={userData} />
          </div>
        ) : (
          !parseError && showUpload && null
        )}
      </div>
    </div>
  );
}
