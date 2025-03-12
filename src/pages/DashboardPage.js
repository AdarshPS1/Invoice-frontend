import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Tooltip as MuiTooltip
} from '@mui/material';
import {
  AccountBalance,
  Receipt,
  People,
  Logout,
  Payment,
  Info
} from '@mui/icons-material';
import { getDashboardStats, getMonthlyData, getPaymentStatusData } from '../services/dashboardService';
import '../styles/Dashboard.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    activeClients: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [paymentStatusData, setPaymentStatusData] = useState([]);

  const COLORS = ['#4caf50', '#ff9800', '#f44336'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [statsData, monthlyData, paymentData] = await Promise.all([
          getDashboardStats(),
          getMonthlyData(),
          getPaymentStatusData()
        ]);

        setStats(statsData);
        setMonthlyData(monthlyData);
        setPaymentStatusData(paymentData);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="dashboard-container">
      <Box className="dashboard-header">
        <Typography variant="h4" component="h1">
          Dashboard Overview
        </Typography>
        <IconButton onClick={handleLogout} color="error">
          <Logout />
        </IconButton>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalance sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography color="text.secondary" gutterBottom>
                      Total Revenue
                    </Typography>
                    <MuiTooltip title="Total revenue from paid invoices only">
                      <Info sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </MuiTooltip>
                  </Box>
                  <Typography variant="h5">${stats.totalRevenue.toLocaleString()}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Receipt sx={{ fontSize: 40, color: '#2196f3', mr: 2 }} />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography color="text.secondary" gutterBottom>
                      Total Invoices
                    </Typography>
                    <MuiTooltip title="Total number of invoices">
                      <Info sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </MuiTooltip>
                  </Box>
                  <Typography variant="h5">{stats.totalInvoices}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography color="text.secondary" gutterBottom>
                      Pending Payments
                    </Typography>
                    <MuiTooltip title="Number of invoices with pending status">
                      <Info sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </MuiTooltip>
                  </Box>
                  <Typography variant="h5">{stats.pendingPayments}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 40, color: '#6c63ff', mr: 2 }} />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography color="text.secondary" gutterBottom>
                      Total Clients
                    </Typography>
                    <MuiTooltip title="Total number of registered clients">
                      <Info sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </MuiTooltip>
                  </Box>
                  <Typography variant="h5">{stats.activeClients}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Revenue & Invoices
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#4caf50" name="Revenue" />
                <Line type="monotone" dataKey="invoices" stroke="#2196f3" name="Invoices" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Payment Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<Receipt />}
              onClick={() => navigateTo('/invoices')}
            >
              Manage Invoices
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              startIcon={<Payment />}
              onClick={() => navigateTo('/payments')}
            >
              View Payments
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<People />}
              onClick={() => navigateTo('/clients')}
            >
              Manage Clients
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardPage;
