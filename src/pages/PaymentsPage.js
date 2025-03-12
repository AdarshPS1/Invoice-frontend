import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/PaymentsPage.css';

const PaymentsPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({
    referenceNumber: '',
    amount: '',
    date: '',
    remark: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => navigate('/dashboard');

  const handleMakePaymentClick = (invoice) => {
    // Calculate remaining amount
    const existingPayments = invoice.payments || [];
    const totalPaid = existingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingAmount = invoice.amount - totalPaid;
    
    setSelectedInvoice(invoice);
    setPaymentData({
      referenceNumber: '',
      amount: remainingAmount.toString(),
      date: new Date().toISOString().split('T')[0],
      remark: ''
    });
    setShowPaymentModal(true);
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
  
    if (!selectedInvoice) return;
  
    // Calculate total paid amount including the new payment
    const existingPayments = selectedInvoice.payments || [];
    const totalPaidSoFar = existingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const newPaymentAmount = parseFloat(paymentData.amount);
    const totalAfterPayment = totalPaidSoFar + newPaymentAmount;

    // Validate payment amount
    if (totalAfterPayment > selectedInvoice.amount) {
      alert(`Total payments (${totalAfterPayment}) cannot exceed invoice amount (${selectedInvoice.amount})`);
      return;
    }
  
    const token = localStorage.getItem('token');
    const paymentPayload = {
      referenceNumber: paymentData.referenceNumber,
      amount: newPaymentAmount,
      date: paymentData.date || new Date(),
      remark: paymentData.remark,
    };
  
    try {
      setSubmitting(true);
      const response = await axios.post(
        `http://localhost:5000/api/invoices/${selectedInvoice._id}/payments`,
        paymentPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Update the invoice in the local state with the response data
      const updatedInvoice = response.data;
      setInvoices(prevInvoices => 
        prevInvoices.map(invoice => 
          invoice._id === updatedInvoice._id ? updatedInvoice : invoice
        )
      );
      
      setShowPaymentModal(false);
      setPaymentData({ referenceNumber: '', amount: '', date: '', remark: '' });
      setSelectedInvoice(null);

      // Show success message
      const isFullyPaid = totalAfterPayment === selectedInvoice.amount;
      alert(`Payment of ₹${newPaymentAmount} successfully recorded${isFullyPaid ? '. Invoice fully paid!' : ''}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate total paid amount for an invoice
  const calculateTotalPaid = (invoice) => {
    const payments = invoice.payments || [];
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  if (loading) return <p className="loading">Loading invoices...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="payments-container">
      <div className="payments-header">
        <h1>PAYMENTS</h1>
        <button className="back-button" onClick={handleBackToDashboard}>
          Back to Dashboard
        </button>
      </div>

      <table className="payment-table">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Client</th>
            <th>Invoice Amount</th>
            <th>Amount Paid</th>
            <th>Remaining Amount</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            const totalPaid = calculateTotalPaid(invoice);
            const remainingAmount = invoice.amount - totalPaid;
            
            return (
              <tr key={invoice._id}>
                <td>{invoice.invoiceNumber || 'N/A'}</td>
                <td>{invoice.client?.name || 'N/A'}</td>
                <td>₹{invoice.amount.toLocaleString()}</td>
                <td>₹{totalPaid.toLocaleString()}</td>
                <td>₹{remainingAmount.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${invoice.status.toLowerCase()}`}>
                    {invoice.status}
                  </span>
                </td>
                <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="make-payment-button" 
                    onClick={() => handleMakePaymentClick(invoice)} 
                    disabled={invoice.status === 'Paid' || remainingAmount <= 0}
                  >
                    Make Payment
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <h2>Make Payment</h2>
            <form onSubmit={handleSubmitPayment}>
              <label>Reference Number:</label>
              <input
                type="text"
                name="referenceNumber"
                value={paymentData.referenceNumber}
                onChange={handlePaymentInputChange}
                required
              />

              <label>Amount:</label>
              <input
                type="number"
                name="amount"
                value={paymentData.amount}
                onChange={handlePaymentInputChange}
                required
              />

              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={paymentData.date}
                onChange={handlePaymentInputChange}
                required
              />

              <label>Remark:</label>
              <textarea
                name="remark"
                value={paymentData.remark}
                onChange={handlePaymentInputChange}
              ></textarea>

              <div className="payment-modal-buttons">
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Payment'}
                </button>
                <button type="button" onClick={() => setShowPaymentModal(false)} disabled={submitting}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
