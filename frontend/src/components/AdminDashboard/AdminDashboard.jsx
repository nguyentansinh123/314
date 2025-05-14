import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import './AdminDashboard.css';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editedRole, setEditedRole] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('http://localhost:5000/api/user/admin/getAllUser', {
        withCredentials: true
      });
      
      if (response.data.user) {
        setUsers(response.data.user);
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error loading users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditedRole(user.role);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditedRole('');
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await axios.put(
        'http://localhost:5000/api/user/admin/editUser',
        {
          userIdfindingId: editingUser._id,
          role: editedRole
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setSuccess(`User ${editingUser.name}'s role updated successfully to ${editedRole}`);
        setEditingUser(null);
        
        const updatedUsers = users.map(user => 
          user._id === editingUser._id ? {...user, role: editedRole} : user
        );
        setUsers(updatedUsers);
      } else {
        setError(response.data.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Error updating user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await axios.delete(
        'http://localhost:5000/api/user/admin/deleteUser',
        { 
          data: { userIdfindingId: userId },
          withCredentials: true
        }
      );
      
      if (response.data.message === "User deleted successfully") {
        setSuccess('User deleted successfully');
        
        const updatedUsers = users.filter(user => user._id !== userId);
        setUsers(updatedUsers);
      } else {
        setError('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error deleting user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <div className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h2>Admin Dashboard</h2>
          </div>
          <div className="admin-sidebar-menu">
            <button 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              User Management
            </button>
          </div>
        </div>
        
        <div className="admin-content">
          <div className="admin-content-header">
            <h1>User Management</h1>
            <div className="admin-actions">
              <div className="search-container">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="refresh-btn" onClick={fetchUsers}>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                  <path d="M23 4v6h-6"></path>
                  <path d="M1 20v-6h6"></path>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Refresh
              </button>
            </div>
          </div>
          
          {error && <div className="admin-message error">{error}</div>}
          {success && <div className="admin-message success">{success}</div>}
          
          {loading ? (
            <div className="admin-loading">
              <div className="admin-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td className="user-name-cell">
                          <div className="user-avatar">
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.name} />
                            ) : (
                              <span>{user.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          {user.name}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          {editingUser && editingUser._id === user._id ? (
                            <select 
                              value={editedRole} 
                              onChange={(e) => setEditedRole(e.target.value)}
                              className="role-select"
                            >
                              <option value="user">User</option>
                              <option value="organizer">Organizer</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`role-badge ${user.role}`}>{user.role}</span>
                          )}
                        </td>
                        <td>
                          {user.isAccountVerified ? (
                            <span className="verified-badge">Verified</span>
                          ) : (
                            <span className="unverified-badge">Unverified</span>
                          )}
                        </td>
                        <td>
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td>
                          {editingUser && editingUser._id === user._id ? (
                            <div className="action-buttons">
                              <button className="save-btn" onClick={handleSaveEdit}>
                                Save
                              </button>
                              <button className="cancel-btn" onClick={handleCancelEdit}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button 
                                className="edit-btn"
                                onClick={() => handleEditUser(user)}
                              >
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-users">
                        {searchQuery ? 'No users match your search' : 'No users found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="user-count">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;