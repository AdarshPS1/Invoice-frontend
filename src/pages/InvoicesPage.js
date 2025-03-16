import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/InvoicesPage.css';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [formData, setFormData] = useState({
    client: '',
    amount: '',
    dueDate: '',
    currency: 'INR',
    items: [{ slNo: 1, description: '', sac: '', quantity: '', rate: '', amount: '' }]
  });
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);

  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await axios.get(`https://api-innoice.onrender.com/api/invoices?t=${timestamp}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://api-innoice.onrender.com/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data);
    } catch (err) {
      console.error('Error fetching clients:', err.response?.data?.message || err.message);
    }
  };

  const handleBackToDashboard = () => navigate('/dashboard');

  const handlePreviewInvoice = async (invoice) => {
    try {
      // Fetch the latest invoice data
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://api-innoice.onrender.com/api/invoices/${invoice._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Use the latest data
      const latestInvoice = response.data;
      setSelectedInvoice(latestInvoice);
      setCurrentStep(1);
      setFormData({
        client: latestInvoice.client?._id || '',
        amount: latestInvoice.amount,
        dueDate: latestInvoice.dueDate ? new Date(latestInvoice.dueDate).toISOString().split('T')[0] : '',
        currency: latestInvoice.currency,
        items: latestInvoice.items.map(item => ({
          slNo: item.slNo,
          description: item.description,
          sac: item.sac,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        }))
      });
      setShowPreviewModal(true);
    } catch (err) {
      console.error('Error fetching latest invoice data:', err);
      alert('Failed to load the latest invoice data. Please try again.');
    }
  };

  const handleGenerateInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to generate and send this invoice?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://api-innoice.onrender.com/api/notifications/send-invoice-email',
        { invoiceId }, // Send only the invoice ID
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message || 'Invoice generated and sent successfully!');
    } catch (err) {
      console.error('Error generating invoice:', err);
      alert(err.response?.data?.message || 'Failed to generate and send invoice.');
    }
  };
  
  const handleViewPdf = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://api-innoice.onrender.com/api/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create a blob from the PDF data
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setSelectedPdfUrl(pdfUrl);
      setShowPdfModal(true);
    } catch (err) {
      console.error('Error fetching PDF:', err);
      alert('Failed to load PDF. Please try again.');
    }
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    if (selectedPdfUrl) {
      URL.revokeObjectURL(selectedPdfUrl);
      setSelectedPdfUrl(null);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://api-innoice.onrender.com/api/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete invoice');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        slNo: prev.items.length + 1, 
        description: '', 
        sac: '', 
        quantity: '', 
        rate: '', 
        amount: '' 
      }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Calculate amount for the item
      if (field === 'quantity' || field === 'rate') {
        const quantity = parseFloat(newItems[index].quantity) || 0;
        const rate = parseFloat(newItems[index].rate) || 0;
        newItems[index].amount = quantity * rate;
      }

      // Calculate total amount
      const totalAmount = newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

      return {
        ...prev,
        items: newItems,
        amount: totalAmount.toString()
      };
    });
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Validate that client is selected
      if (!formData.client) {
        alert('Please select a client');
        return;
      }

      // Create the invoice data with proper formatting
      const invoiceData = {
        client: formData.client,
        dueDate: formData.dueDate,
        items: formData.items.map(item => ({
          slNo: item.slNo,
          description: item.description,
          sac: item.sac,
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0
        })),
        amount: parseFloat(formData.amount) || 0,
        currency: formData.currency
      };

      await axios.post(
        'https://api-innoice.onrender.com/api/invoices',
        invoiceData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh the invoices list
      await fetchInvoices();
      
      // Reset form and close modal
      setShowCreateInvoiceModal(false);
      setFormData({
        client: '',
        amount: '',
        dueDate: '',
        currency: 'INR',
        items: [{ slNo: 1, description: '', sac: '', quantity: '', rate: '', amount: '' }]
      });
      setCurrentStep(1); // Reset to first step
    } catch (err) {
      console.error('Error creating invoice:', err);
      alert(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedInvoice(null);
  };

  const handleSaveInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Validate that client is selected
      if (!formData.client) {
        alert('Please select a client');
        return;
      }

      // Create the invoice data with proper formatting
      const invoiceData = {
        client: formData.client,
        dueDate: formData.dueDate,
        items: formData.items.map(item => ({
          slNo: item.slNo,
          description: item.description,
          sac: item.sac,
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0
        })),
        amount: parseFloat(formData.amount) || 0
      };

      console.log('Updating invoice with data:', invoiceData); // Debug log

      const response = await axios.put(
        `https://api-innoice.onrender.com/api/invoices/${selectedInvoice._id}`, 
        invoiceData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Update response:', response.data); // Debug log

      if (response.data) {
        // Refresh invoices
        await fetchInvoices();
        
        // Get the updated invoice data
        const updatedInvoiceResponse = await axios.get(
          `https://api-innoice.onrender.com/api/invoices/${selectedInvoice._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Close modal and show success message
        handleClosePreviewModal();
        alert('Invoice updated successfully!');
      } else {
        throw new Error('No response data received');
      }
    } catch (err) {
      console.error('Error updating invoice:', err);
      console.error('Error response:', err.response?.data); // Log the error response
      alert(err.response?.data?.message || 'Failed to update invoice. Please try again.');
    }
  };

  const handleFilterInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://api-innoice.onrender.com/api/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      let filteredInvoices = response.data;
  
      if (filterStatus) {
        filteredInvoices = filteredInvoices.filter(invoice => invoice.status === filterStatus);
      }
  
      if (filterStartDate && filterEndDate) {
        filteredInvoices = filteredInvoices.filter(invoice => {
          const dueDate = new Date(invoice.dueDate);
          return dueDate >= new Date(filterStartDate) && dueDate <= new Date(filterEndDate);
        });
      }
  
      setInvoices(filteredInvoices);
      setShowFilterModal(false); // Close modal after filtering
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to filter invoices');
    }
  };
  
  // Reset filters
  const handleClearFilters = () => {
    setFilterStatus('');
    setFilterStartDate('');
    setFilterEndDate('');
    fetchInvoices(); // Reload all invoices
    setShowFilterModal(false);
  };

  const handleNext = (e) => {
    e.preventDefault(); // Prevent form submission
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault(); // Prevent form submission
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatCurrency = (amount, currency) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3>Step 1: Client Details</h3>
            <div className="field-group">
              <label htmlFor="client">Select Client:</label>
              <select
                id="client"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="currency">Currency:</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                required
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="AUD">Australian Dollar (A$)</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="dueDate">Due Date:</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h3>Step 2: Invoice Items</h3>
            {formData.items.map((item, index) => (
              <div key={index} className="invoice-item">
                <div className="item-header">
                  <h4>Item {index + 1}</h4>
                  {index > 0 && (
                    <button 
                      type="button" 
                      className="remove-item-button"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="item-fields">
                  <div className="field-group">
                    <label>Description:</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label>SAC:</label>
                    <input
                      type="text"
                      value={item.sac}
                      onChange={(e) => handleItemChange(index, 'sac', e.target.value)}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label>Rate:</label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label>Amount:</label>
                    <input
                      type="number"
                      value={item.amount}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            ))}
            <button 
              type="button" 
              className="add-item-button"
              onClick={handleAddItem}
            >
              Add Another Item
            </button>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h3>Step 3: Review & Submit</h3>
            <div className="review-section">
              <div className="review-item">
                <label>Client:</label>
                <span>{clients.find(c => c._id === formData.client)?.name || 'N/A'}</span>
              </div>
              <div className="review-item">
                <label>Currency:</label>
                <span>{formData.currency}</span>
              </div>
              <div className="review-item">
                <label>Due Date:</label>
                <span>{new Date(formData.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="review-items-table">
                <h4>Invoice Items</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>SAC</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.description}</td>
                        <td>{item.sac}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.rate, formData.currency)}</td>
                        <td>{formatCurrency(item.amount, formData.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="review-item total-amount">
                <label>Total Amount:</label>
                <span>{formatCurrency(formData.amount, formData.currency)}</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <p className="loading">Loading invoices...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="invoices-container">
      <div className="invoices-header">
        <h1>INVOICES</h1>
        <div className="header-buttons">
        <button className="filter-button" onClick={() => setShowFilterModal(true)}>
            Filter
          </button>
          <button className="create-invoice-button" onClick={() => setShowCreateInvoiceModal(true)}>
            Create Invoice
          </button>
          <button className="back-button" onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
          <th>Invoice No.</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice._id}>
              <td>{invoice.invoiceNumber}</td>
              <td>{invoice.client?.name || 'N/A'}</td>
              <td>{formatCurrency(invoice.amount, invoice.currency)}</td>
              <td className={`status ${invoice.status.toLowerCase()}`}>{invoice.status}</td>
              <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
              <td>
                <button className="view-button" onClick={() => handleViewPdf(invoice._id)}>
                  View
                </button>
                <button 
                  className="preview-button" 
                  onClick={() => {
                    // Force a refresh of invoices before showing preview
                    fetchInvoices().then(() => {
                      // Find the refreshed invoice in the updated invoices array
                      const refreshedInvoice = invoices.find(inv => inv._id === invoice._id);
                      if (refreshedInvoice) {
                        handlePreviewInvoice(refreshedInvoice);
                      } else {
                        handlePreviewInvoice(invoice);
                      }
                    });
                  }} 
                  disabled={invoice.status === 'Paid'}
                >
                  Preview
                </button>
                <button className="generate-button" onClick={() => handleGenerateInvoice(invoice._id)} disabled={invoice.status === 'Paid'}>
                  Generate
                </button>
                {['admin', 'accountant'].includes(userRole) && (
                  <button className="delete-button" onClick={() => handleDeleteInvoice(invoice._id)} disabled={invoice.status === 'Paid'}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showCreateInvoiceModal && (
        <div className="create-invoice-modal-overlay">
          <div className="create-invoice-modal">
            <h2>Create Invoice</h2>
            <form onSubmit={handleCreateInvoice}>
              <div className="step-indicator">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
              </div>
              
              {renderStepContent()}

              <div className="modal-buttons">
                {currentStep > 1 && (
                  <button type="button" onClick={handlePrevious} className="previous-button">
                    Previous
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button type="button" onClick={handleNext} className="next-button">
                    Next
                  </button>
                ) : (
                  <button type="submit" className="submit-button">
                    Create Invoice
                  </button>
                )}
                <button type="button" onClick={() => setShowCreateInvoiceModal(false)} className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{showPreviewModal && (
  <div className="preview-invoice-modal-overlay">
    <div className="preview-invoice-modal">
      <h2>Edit Invoice</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSaveInvoice();
      }}>
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
        </div>
        
        {renderStepContent()}

        <div className="modal-buttons">
          {currentStep > 1 && (
            <button type="button" onClick={handlePrevious} className="previous-button">
              Previous
            </button>
          )}
          {currentStep < totalSteps ? (
            <button type="button" onClick={handleNext} className="next-button">
              Next
            </button>
          ) : (
            <button type="submit" className="submit-button">
              Save Changes
            </button>
          )}
          <button type="button" onClick={handleClosePreviewModal} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{showFilterModal && (
  <div className="filter-modal-overlay">
    <div className="filter-modal">
      <h2>Filter Invoices</h2>

      <label>Status:</label>
      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
        <option value="">All</option>
        <option value="Paid">Paid</option>
        <option value="Pending">Pending</option>
        <option value="Overdue">Overdue</option>
      </select>

      <label>Due Date (From):</label>
      <input
        type="date"
        value={filterStartDate}
        onChange={(e) => setFilterStartDate(e.target.value)}
      />

      <label>Due Date (To):</label>
      <input
        type="date"
        value={filterEndDate}
        onChange={(e) => setFilterEndDate(e.target.value)}
      />

      <div className="filter-modal-buttons">
        <button onClick={handleFilterInvoices}>Apply Filters</button>
        <button onClick={handleClearFilters}>Clear Filters</button>
        <button onClick={() => setShowFilterModal(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}

{showPdfModal && (
  <div className="pdf-modal-overlay">
    <div className="pdf-modal">
      <div className="pdf-modal-header">
        <h2>Invoice PDF</h2>
        <button className="close-button" onClick={handleClosePdfModal}>×</button>
      </div>
      <div className="pdf-modal-content">
        {selectedPdfUrl && (
          <iframe
            src={selectedPdfUrl}
            title="Invoice PDF"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default InvoicesPage;
