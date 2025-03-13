import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ClientsPage.css';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [editFormData, setEditFormData] = useState({ _id: '', name: '', email: '', phone: '' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api-innoice.onrender.com/api/clients');
      setClients(response.data);
    } catch (err) {
      setError('Failed to load clients.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    try {
      await axios.delete(`https://api-innoice.onrender.com/api/clients/${id}`);
      setClients(clients.filter((client) => client._id !== id));
    } catch (err) {
      alert('Failed to delete client.');
    }
  };

  // Create Client
  const openCreateClientModal = () => setIsCreateClientModalOpen(true);
  const closeCreateClientModal = () => {
    setIsCreateClientModalOpen(false);
    setFormData({ name: '', email: '', phone: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://api-innoice.onrender.com/api/clients/add', formData);
      fetchClients();
      closeCreateClientModal();
    } catch (err) {
      alert('Failed to create client.');
    }
  };

  // Edit Client
  const openEditClientModal = (client) => {
    setEditFormData(client);
    setIsEditClientModalOpen(true);
  };

  const closeEditClientModal = () => {
    setIsEditClientModalOpen(false);
    setEditFormData({ _id: '', name: '', email: '', phone: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://api-innoice.onrender.com/api/clients/${editFormData._id}`, editFormData);
      fetchClients();
      closeEditClientModal();
    } catch (err) {
      alert('Failed to update client.');
    }
  };

  return (
    <div className="clients-page">
      <div className="clients-header">
        <h1>Clients</h1>
        <div className="clients-header-buttons">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
          <button className="create-client-btn" onClick={openCreateClientModal}>
            Create Client
          </button>
        </div>
      </div>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      <table className="clients-table">
        <thead>
          <tr>
            <th>Client ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client._id}>
              <td>{client._id}</td>
              <td>{client.name}</td>
              <td>{client.email}</td>
              <td>{client.phone}</td>
              <td>
                <button className="edit-button" onClick={() => openEditClientModal(client)}>
                  Edit
                </button>
                <button className="delete-button" onClick={() => handleDelete(client._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isCreateClientModalOpen && (
        <div className="create-client-modal-overlay">
          <div className="create-client-modal">
            <h2>Create New Client</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Name:
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </label>
              <label>
                Email:
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </label>
              <label>
                Phone:
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
              </label>
              <div className="create-client-modal-buttons">
                <button type="submit" className="create-client-submit-btn">
                  Submit
                </button>
                <button type="button" className="create-client-cancel-btn" onClick={closeCreateClientModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditClientModalOpen && (
        <div className="create-client-modal-overlay">
          <div className="create-client-modal">
            <h2>Edit Client</h2>
            <form onSubmit={handleEditSubmit}>
              <label>
                Name:
                <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} required />
              </label>
              <label>
                Email:
                <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} required />
              </label>
              <label>
                Phone:
                <input type="tel" name="phone" value={editFormData.phone} onChange={handleEditChange} required />
              </label>
              <div className="create-client-modal-buttons">
                <button type="submit" className="create-client-submit-btn">
                  Save
                </button>
                <button type="button" className="create-client-cancel-btn" onClick={closeEditClientModal}>
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

export default ClientsPage;
