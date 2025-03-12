import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import '../styles/Reports.css';

const ReportsPage = () => {
  const [financialReport, setFinancialReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch the full report (on page load)
  const fetchInitialReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/reports/financial-report', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFinancialReport(response.data);
    } catch (err) {
      setError('Failed to load financial report. Please try again.');
      console.error('Error fetching financial report:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialReport();
  }, [fetchInitialReport]);

  // Fetch filtered report
  const handleFilter = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/reports/financial-report', {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate },
      });
      setFinancialReport(response.data);
      setShowModal(false); // Close modal after fetching data
    } catch (err) {
      setError('Failed to filter financial report. Please try again.');
      console.error('Error filtering financial report:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  // Prepare data for the chart
  const revenueChartData = financialReport?.revenueSummary
    ? Object.entries(financialReport.revenueSummary).map(([month, revenue]) => ({
        month,
        revenue,
      }))
    : [];

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Financial Report</h1>
        <div className="button-group">
          <button className="button" onClick={() => setShowModal(true)}>Filter Report</button>
          <button className="back-button" onClick={() => window.location.href = '/dashboard'}>Back to Dashboard</button>
        </div>
      </div>

      {loading && <p className="loading">Loading report...</p>}
      {error && <p className="error">{error}</p>}

      {financialReport && !loading && (
        <>
          <h2>Summary</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Total Revenue</th>
                <th>Total Invoices</th>
                <th>Paid Invoices</th>
                <th>Unpaid Invoices</th>
                <th>Total Tax (18%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{formatCurrency(financialReport.totalRevenue)}</td>
                <td>{financialReport.totalInvoices || 0}</td>
                <td>{financialReport.paidInvoices || 0}</td>
                <td>{financialReport.unpaidInvoices || 0}</td>
                <td>{formatCurrency(financialReport.totalTax)}</td>
              </tr>
            </tbody>
          </table>

          <h2>Revenue Summary</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#4caf50" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      {showModal && (
        <div className="report-modal-overlay">
          <div className="report-modal">
            <h2>Filter Financial Report</h2>
            <form onSubmit={handleFilter}>
              <div className="report-form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="report-form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="report-modal-actions">
                <button type="submit" className="report-button">Filter</button>
                <button type="button" className="report-cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
