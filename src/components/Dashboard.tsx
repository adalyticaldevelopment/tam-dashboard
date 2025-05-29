import React, { useState } from "react";
import { KeywordData } from "../lib/types";
import SummaryCards from "./SummaryCards";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend
);

interface UserMonthData {
  month: string;
  convValue: number;
  cost: number;
}

interface DashboardProps {
  data: KeywordData[];
  months: string[];
  userData?: KeywordData[] | UserMonthData[];
}

// Utility to normalize month strings to 'Mon-YY' format
function normalizeMonth(month: string): string {
  const longMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  let m = month.trim().replace(/^Searches: /, '');
  // Match 'September 2024'
  let match = m.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (match !== null) {
    const idx = longMonths.findIndex(lm => lm.toLowerCase() === match?.[1]?.toLowerCase());
    if (idx !== -1) {
      return `${shortMonths[idx]}-${match?.[2]?.slice(-2)}`;
    }
  }
  // Match 'Sep-24' or 'Sep 2024'
  match = m.match(/^([A-Za-z]{3})[- ](\d{2,4})$/);
  if (match !== null) {
    return `${match?.[1]?.charAt(0).toUpperCase() + match?.[1]?.slice(1).toLowerCase()}-${match?.[2]?.slice(-2)}`;
  }
  return m;
}

const Dashboard: React.FC<DashboardProps> = ({ data, months, userData = [] }) => {
  // User-adjustable inputs
  const [cvr, setCvr] = useState(5); // Conversion Rate (%)
  const [aov, setAov] = useState(100); // Average Order Value (£)

  // Always use normalized market months as x-axis
  const xLabels = months.map(m => normalizeMonth(m.replace(/^Searches: /, "")));
  // Debug: print market and user months
  console.log('Market months (normalized):', xLabels);
  if (Array.isArray(userData) && userData.length > 0 && 'month' in userData[0]) {
    const userMonths = (userData as any[]).map(row => typeof row.month === 'string' ? normalizeMonth(row.month) : null).filter(Boolean);
    console.log('User months (normalized):', userMonths);
  }
  // Prepare clean month labels for display
  const monthLabels = xLabels;

  // Market stats as before
  const marketStats = xLabels.map((_, monthIdx) => {
    const spend = data.reduce(
      (sum, k) => sum + (k.monthlySearches?.[monthIdx] || 0) * k.topOfPageBidHigh,
      0
    );
    const revenue = spend * (cvr / 100) * aov;
    return { spend, revenue };
  });

  // User stats: align to normalized market months
  let userStats: { spend: number | null; revenue: number | null }[] = [];
  if (Array.isArray(userData) && userData.length > 0 && 'month' in userData[0]) {
    const userMonthMap: Record<string, { revenue: number; cost: number }> = {};
    (userData as any[]).forEach(row => {
      const normMonth = normalizeMonth(row.month);
      userMonthMap[normMonth] = { revenue: row.convValue, cost: row.cost };
    });
    userStats = xLabels.map(m => {
      const entry = userMonthMap[m];
      return entry ? { spend: entry.cost, revenue: entry.revenue } : { spend: null, revenue: null };
    });
  } else if (userData && userData.length > 0) {
    // fallback for old format: single month
    userStats = xLabels.map((_, i) => {
      const d = (userData as any)[0];
      return {
        spend: d.topOfPageBidHigh || 0,
        revenue: d.convValue || 0,
      };
    });
  }

  // Chart datasets
  const chartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Market Revenue',
        data: marketStats.map(s => s.revenue),
        borderColor: '#00ff6a', // Brighter green
        backgroundColor: 'rgba(0,255,106,0.10)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#00ff6a',
      },
      {
        label: 'Market Spend',
        data: marketStats.map(s => s.spend),
        borderColor: '#ff6b6b', // Brighter red
        backgroundColor: 'rgba(255,107,107,0.10)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#ff6b6b',
      },
      ...(userStats.length > 0
        ? [
            {
              label: "Your Revenue",
              data: userStats.map(s => s.revenue),
              borderColor: '#ffb300', // Bright orange
              backgroundColor: 'rgba(255,179,0,0.10)',
              tension: 0.4,
              fill: false,
              borderDash: [6, 4],
              borderWidth: 3,
              pointRadius: 5,
              pointBackgroundColor: '#ffb300',
            },
            {
              label: "Your Spend",
              data: userStats.map(s => s.spend),
              borderColor: '#2196f3', // Bright blue
              backgroundColor: 'rgba(33,150,243,0.10)',
              tension: 0.4,
              fill: false,
              borderDash: [6, 4],
              borderWidth: 3,
              pointRadius: 5,
              pointBackgroundColor: '#2196f3',
            },
          ]
        : []),
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            return `${label}: £${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    hover: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          color: '#fff',
          font: { size: 15, weight: 'bold' as const },
          maxRotation: 45,
          minRotation: 30,
        },
        grid: { color: '#23501B' },
      },
      y: {
        ticks: {
          color: '#fff',
          callback: (tickValue: string | number) => {
            if (typeof tickValue === 'number') {
              return `£${(tickValue/1000).toFixed(2)}K`;
            }
            return tickValue;
          },
        },
        grid: { color: '#23501B' },
      },
    },
  };

  // Summary cards use the most recent month (last in the array)
  const latest = marketStats.length > 0 ? marketStats[marketStats.length - 1] : { spend: 0, revenue: 0 };

  return (
    <div className="flex flex-col gap-12">
      {/* Main dashboard card */}
      <div className="rounded-3xl shadow-2xl px-10 py-12 flex flex-col lg:flex-row items-stretch gap-10 max-w-[1200px] mx-auto" style={{background: '#263326'}}>
        {/* Left: Inputs + Summary Cards */}
        <div className="flex flex-col gap-6 flex-[1_1_40%] min-w-[280px] max-w-[420px] justify-center">
          <div className="bg-white/5 rounded-xl p-5 mb-2 flex flex-col gap-4 shadow">
            <label className="flex flex-col gap-1 text-sm font-bold" style={{color: '#fff'}}>
              Conversion Rate (CVR)
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={cvr}
                onChange={e => setCvr(Number(e.target.value))}
                className="rounded-md px-3 py-2 bg-brand-dark text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/60 transition"
                aria-label="Conversion Rate (CVR)"
                title="Conversion Rate (CVR)"
              />
              <span className="text-xs" style={{color: '#b6c2b6'}}> % of clicks that convert</span>
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold" style={{color: '#fff'}}>
              Average Order Value (AOV)
              <input
                type="number"
                min={0}
                step={1}
                value={aov}
                onChange={e => setAov(Number(e.target.value))}
                className="rounded-md px-3 py-2 bg-brand-dark text-white border border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/60 transition"
                aria-label="Average Order Value (AOV)"
                title="Average Order Value (AOV)"
              />
              <span className="text-xs" style={{color: '#b6c2b6'}}> £ per conversion</span>
            </label>
          </div>
          <SummaryCards
            totalKeywords={data.length}
            totalEstimatedSpend={latest.spend}
            totalEstimatedRevenue={latest.revenue}
          />
        </div>
        {/* Divider for desktop */}
        <div className="hidden lg:block w-px bg-white/20 mx-8 my-4" />
        {/* Right: Large Chart */}
        <div className="flex-[1_1_60%] flex items-center justify-center min-w-[340px]">
          <div className="bg-brand-dark rounded-2xl shadow-lg px-6 py-6 w-full h-[420px] flex items-center justify-center">
            <Line data={chartData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  ...chartOptions.plugins.legend,
                  labels: {
                    ...chartOptions.plugins.legend.labels,
                    color: '#fff',
                  },
                },
              },
              scales: {
                x: {
                  ...chartOptions.scales.x,
                  ticks: { color: '#fff', font: { size: 13 } },
                  grid: { color: '#23501B' },
                },
                y: {
                  ...chartOptions.scales.y,
                  ticks: {
                    color: '#fff',
                    callback: (tickValue: string | number) => {
                      if (typeof tickValue === 'number') {
                        return `£${(tickValue/1000).toFixed(2)}K`;
                      }
                      return tickValue;
                    },
                  },
                  grid: { color: '#23501B' },
                },
              },
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 