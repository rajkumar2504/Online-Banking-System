import React from 'react';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const navigate = useNavigate();

  const features = [
    'Monthly spending breakdown chart',
    'Income vs Expense comparison',
    'Transaction category analysis',
    'Balance trend over time',
  ];

  return (
    <div className="page-container">
      <div className="analytics-coming-soon-wrapper">
        {/* Background glow blobs */}
        <div className="analytics-glow-blob analytics-glow-top" />
        <div className="analytics-glow-blob analytics-glow-bottom" />

        <div className="analytics-card">
          {/* Chart Icon */}
          <div className="analytics-icon-wrapper">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
              <path d="M3 20h18" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="analytics-heading">Analytics Coming Soon</h1>
          <p className="analytics-subtext">
            Track your spending patterns, income trends and account insights.
          </p>

          {/* Feature Preview */}
          <div className="analytics-feature-list">
            {features.map((feature, idx) => (
              <div key={idx} className="analytics-feature-item">
                <span className="analytics-lock-icon">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Get Notified Button */}
          <button
            className="analytics-notify-btn"
            onClick={() => navigate('/')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Get Notified
          </button>

          <p className="analytics-back-link" onClick={() => navigate('/')}>
            ← Back to Dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
