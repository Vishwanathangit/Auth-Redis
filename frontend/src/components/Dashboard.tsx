import React from 'react';
import { authAPI } from '../utils/api';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Welcome to Dashboard</h2>
        <div style={{ marginBottom: '10px' }}>
          <strong>Name:</strong> {user.name}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Email:</strong> {user.email}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Role:</strong> {user.role}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>User ID:</strong> {user.id}
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#e9ecef', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Authentication Status</h3>
        <p style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Authenticated via Redis Session</p>
        <p>Your session is stored in Redis with JWT token</p>
      </div>

      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;