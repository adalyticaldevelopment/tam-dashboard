import React from "react";

interface Props {
  totalKeywords: number;
  totalEstimatedSpend: number;
  totalEstimatedRevenue: number;
}

const SummaryCards: React.FC<Props> = ({
  totalEstimatedSpend,
  totalEstimatedRevenue,
}) => (
  <div className="flex flex-row gap-4 w-full justify-center">
    <div className="summary-card" style={{padding: '24px 20px', minWidth: 160}}>
      <div className="label" style={{color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10}}>Est. Market Spend</div>
      <div className="value white" style={{fontSize: '1.7rem', marginTop: 6, fontWeight: 800}}>
        £{totalEstimatedSpend.toLocaleString(undefined, {maximumFractionDigits: 0})}
      </div>
    </div>
    <div className="summary-card" style={{padding: '24px 20px', minWidth: 160}}>
      <div className="label" style={{color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10}}>Est. Market Revenue</div>
      <div className="value" style={{fontSize: '1.7rem', marginTop: 6, fontWeight: 800}}>
        £{totalEstimatedRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}
      </div>
    </div>
  </div>
);

export default SummaryCards; 