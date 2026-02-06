/**
 * User Dashboard Component
 * Provides CRUD operations for users with email and password reset functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { TabType } from '@/types';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import styles from './UserDashboard.module.css';

// Sidebar items for permissions
const PERMISSION_OPTIONS = [
  { id: TabType.DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
  { id: TabType.QUOTATION, label: 'Quotation', icon: 'description' },
  { id: TabType.CLIENT_PROFILE, label: 'Customers', icon: 'people' },
  { id: TabType.HISTORY, label: 'Users', icon: 'person' },
  { id: TabType.SETTINGS, label: 'Settings', icon: 'settings' },
] as const;

export const UserDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingPasswordUser, setResettingPasswordUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ 
    email: '', 
    first_name: '', 
    last_name: '',
    password: '',
    is_active: true,
    is_admin: false,
    permissions: [] as string[]
  });
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [passwordResetData, setPasswordResetData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [formErrors, setFormErrors] = useState({ 
    email: '', 
    password: '',
    password_reset: ''
  });

  // Load users
  const loadUsers = useCallback(async (search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.listUsers(search);
      setUsers(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers(searchQuery || undefined);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadUsers]);

  // Form handlers
  const handleOpenForm = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ 
        email: user.email || '', 
        first_name: user.first_name || '', 
        last_name: user.last_name || '',
        password: '',
        is_active: user.is_active !== undefined ? user.is_active : true,
        is_admin: user.is_admin || false,
        permissions: user.permissions || []
      });
    } else {
      setEditingUser(null);
      setFormData({ 
        email: '', 
        first_name: '', 
        last_name: '',
        password: '',
        is_active: true,
        is_admin: false,
        permissions: []
      });
    }
    setFormErrors({ email: '', password: '', password_reset: '' });
    setIsPermissionsOpen(false);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setFormData({ 
      email: '', 
      first_name: '', 
      last_name: '',
      password: '',
      is_active: true,
      is_admin: false,
      permissions: []
    });
    setFormErrors({ email: '', password: '', password_reset: '' });
    setIsPermissionsOpen(false);
  };

  const handleOpenPasswordReset = (user: User) => {
    setResettingPasswordUser(user);
    setPasswordResetData({
      new_password: '',
      confirm_password: ''
    });
    setFormErrors({ email: '', password: '', password_reset: '' });
    setIsPasswordResetOpen(true);
  };

  const handleClosePasswordReset = () => {
    setIsPasswordResetOpen(false);
    setResettingPasswordUser(null);
    setPasswordResetData({
      new_password: '',
      confirm_password: ''
    });
    setFormErrors({ email: '', password: '', password_reset: '' });
  };

  const validateForm = (): boolean => {
    const errors = { email: '', password: '', password_reset: '' };
    let isValid = true;

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
      isValid = false;
    }

    if (!editingUser && !formData.password.trim()) {
      errors.password = 'Password is required for new users';
      isValid = false;
    } else if (formData.password.trim() && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const validatePasswordReset = (): boolean => {
    const errors = { email: '', password: '', password_reset: '' };
    let isValid = true;

    if (!passwordResetData.new_password.trim()) {
      errors.password_reset = 'New password is required';
      isValid = false;
    } else if (passwordResetData.new_password.length < 6) {
      errors.password_reset = 'Password must be at least 6 characters';
      isValid = false;
    } else if (passwordResetData.new_password !== passwordResetData.confirm_password) {
      errors.password_reset = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (editingUser) {
        // Update user
        await apiService.updateUser(editingUser.id, {
          email: formData.email.trim(),
          first_name: formData.first_name.trim() || undefined,
          last_name: formData.last_name.trim() || undefined,
          is_active: formData.is_active,
          is_admin: formData.is_admin,
          permissions: formData.is_admin ? [] : formData.permissions,
        });
      } else {
        // Create user
        await apiService.createUser({
          email: formData.email.trim(),
          password: formData.password.trim(),
          first_name: formData.first_name.trim() || undefined,
          last_name: formData.last_name.trim() || undefined,
          is_active: formData.is_active,
          is_admin: formData.is_admin,
          permissions: formData.is_admin ? [] : formData.permissions,
        });
      }
      
      handleCloseForm();
      await loadUsers(searchQuery || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordReset() || !resettingPasswordUser) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiService.resetUserPassword(resettingPasswordUser.id, {
        new_password: passwordResetData.new_password.trim(),
        confirm_password: passwordResetData.confirm_password.trim(),
      });
      
      handleClosePasswordReset();
      alert('Password reset successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiService.deleteUser(userId);
      await loadUsers(searchQuery || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  return (
    <div className={styles.dashboard}>
      {/* Header with Search and Button */}
      <div className={styles.header}>
        <div className={styles.headerActions}>
          <div className={styles.searchInputWrapper}>
            <span className="material-icons">search</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className={styles.addButton}
            onClick={() => handleOpenForm()}
          >
            Add User
            <span className="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorBanner}>
          <span className="material-icons">error</span>
          {error}
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && users.length === 0 && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
      )}

      {/* Users Table */}
      {!isLoading || users.length > 0 ? (
        <div className={styles.tableContainer}>
          {users.length === 0 ? (
            <div className={styles.emptyState}>
              <span className="material-icons">person_off</span>
              <p>No users found</p>
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="ghost"
                  size="small"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <colgroup>
                    <col className={styles.colSno} />
                    <col className={styles.colEmail} />
                    <col className={styles.colName} />
                    <col className={styles.colStatus} />
                    <col className={styles.colAccess} />
                    <col className={styles.colAction} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={styles.sortable}>
                        <span className={styles.headerContent}>
                          ID
                          <span className="material-icons">arrow_drop_down</span>
                        </span>
                      </th>
                      <th className={styles.sortable}>
                        <span className={styles.headerContent}>
                          Email
                          <span className="material-icons">arrow_drop_down</span>
                        </span>
                      </th>
                      <th className={styles.sortable}>
                        <span className={styles.headerContent}>
                          Name
                          <span className="material-icons">arrow_drop_down</span>
                        </span>
                      </th>
                      <th className={styles.sortable}>
                        <span className={styles.headerContent}>
                          Status
                          <span className="material-icons">arrow_drop_down</span>
                        </span>
                      </th>
                      <th className={styles.sortable}>
                        <span className={styles.headerContent}>
                          Access
                          <span className="material-icons">arrow_drop_down</span>
                        </span>
                      </th>
                      <th className={styles.actionHeader}>
                        <span className={styles.headerContent}>Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => {
                      return (
                        <tr key={user.id}>
                          <td className={styles.cellSno}>{user.id}</td>
                          <td className={styles.cellEmail}>{user.email}</td>
                          <td className={styles.cellName}>
                            {user.first_name || user.last_name 
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : '-'}
                          </td>
                          <td className={styles.cellStatus}>
                            <span className={`${styles.statusBadge} ${user.is_active ? styles.statusActive : styles.statusInactive}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className={styles.cellAccess}>
                            {user.is_admin ? (
                              <span className={`${styles.statusBadge} ${styles.statusAdmin}`}>
                                Admin
                              </span>
                            ) : (
                              <span className={styles.permissionsText}>
                                {user.permissions?.length || 0} permissions
                              </span>
                            )}
                          </td>
                          <td className={styles.cellAction}>
                            <div className={styles.actions}>
                              <button
                                className={styles.actionButton}
                                onClick={() => handleOpenPasswordReset(user)}
                                aria-label="Reset password"
                                title="Reset Password"
                              >
                                <span className="material-icons">lock_reset</span>
                              </button>
                              <button
                                className={styles.actionButton}
                                onClick={() => handleOpenForm(user)}
                                aria-label="Edit user"
                              >
                                <span className="material-icons">edit</span>
                              </button>
                              <button
                                className={styles.actionButton}
                                onClick={() => handleDelete(user.id)}
                                aria-label="Delete user"
                              >
                                <span className="material-icons">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className={styles.mobileCardView}>
                {currentUsers.map((user) => {
                  return (
                    <div key={user.id} className={styles.mobileCard}>
                      <div className={styles.mobileCardHeader}>
                        <div className={styles.mobileCardTitle}>
                          <span className={styles.mobileCardSno}>{user.id}</span>
                          <h3 className={styles.mobileCardName}>{user.email}</h3>
                        </div>
                        <span className={`${styles.statusBadge} ${user.is_active ? styles.statusActive : styles.statusInactive}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className={styles.mobileCardBody}>
                        {user.username && (
                          <div className={styles.mobileCardRow}>
                            <span className={styles.mobileCardLabel}>Username:</span>
                            <span className={styles.mobileCardValue}>{user.username}</span>
                          </div>
                        )}
                        {(user.first_name || user.last_name) && (
                          <div className={styles.mobileCardRow}>
                            <span className={styles.mobileCardLabel}>Name:</span>
                            <span className={styles.mobileCardValue}>
                              {`${user.first_name || ''} ${user.last_name || ''}`.trim()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={styles.mobileCardActions}>
                        <button
                          className={styles.mobileActionButton}
                          onClick={() => handleOpenPasswordReset(user)}
                          aria-label="Reset password"
                        >
                          <span className="material-icons">lock_reset</span>
                          <span>Reset Password</span>
                        </button>
                        <button
                          className={styles.mobileActionButton}
                          onClick={() => handleOpenForm(user)}
                          aria-label="Edit user"
                        >
                          <span className="material-icons">edit</span>
                          <span>Edit</span>
                        </button>
                        <button
                          className={`${styles.mobileActionButton} ${styles.mobileActionButtonDanger}`}
                          onClick={() => handleDelete(user.id)}
                          aria-label="Delete user"
                        >
                          <span className="material-icons">delete</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* Pagination */}
      {users.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationLeft}>
            <span>Show</span>
            <select 
              className={styles.pageSizeSelect}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="2">02</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>Results</span>
          </div>
          <div className={styles.paginationRight}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <span className="material-icons">chevron_left</span>
            </button>
            {currentPage > 3 && totalPages > 5 && (
              <>
                <button
                  className={styles.pageButton}
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>
                {currentPage > 4 && <span className={styles.ellipsis}>...</span>}
              </>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`${styles.pageButton} ${currentPage === pageNum ? styles.active : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                <span className={styles.ellipsis}>...</span>
                <button
                  className={styles.pageButton}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <span className="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Right Side Panel Form */}
      {isFormOpen && (
        <>
          <div className={styles.panelOverlay} onClick={handleCloseForm}></div>
          <div className={styles.formPanel}>
            <div className={styles.panelHeader}>
              <h2>{editingUser ? 'Edit User' : 'Add User'}</h2>
              <button
                className={styles.closeButton}
                onClick={handleCloseForm}
                aria-label="Close"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formContent}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Email<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    autoFocus
                  />
                  {formErrors.email && (
                    <span className={styles.errorText}>{formErrors.email}</span>
                  )}
                </div>

                {!editingUser && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Password<span className={styles.required}>*</span>
                    </label>
                    <input
                      type="password"
                      className={styles.input}
                      placeholder="Enter Password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                    {formErrors.password && (
                      <span className={styles.errorText}>{formErrors.password}</span>
                    )}
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label className={styles.label}>First Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter First Name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Last Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter Last Name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                    />
                    <span style={{ marginLeft: '8px' }}>Active</span>
                  </label>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <input
                      type="checkbox"
                      checked={formData.is_admin}
                      onChange={(e) => {
                        const isAdmin = e.target.checked;
                        setFormData({ 
                          ...formData, 
                          is_admin: isAdmin,
                          permissions: isAdmin ? [] : formData.permissions
                        });
                      }}
                    />
                    <span style={{ marginLeft: '8px' }}>Admin (Full Access)</span>
                  </label>
                </div>

                {!formData.is_admin && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Permissions<span className={styles.required}>*</span>
                    </label>
                    <div className={styles.permissionsDropdown}>
                      <button
                        type="button"
                        className={styles.permissionsToggle}
                        onClick={() => setIsPermissionsOpen(!isPermissionsOpen)}
                      >
                        <span>
                          {formData.permissions.length === 0 
                            ? 'Select Permissions' 
                            : `${formData.permissions.length} permission(s) selected`}
                        </span>
                        <span className="material-icons">
                          {isPermissionsOpen ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {isPermissionsOpen && (
                        <div className={styles.permissionsMenu}>
                          {PERMISSION_OPTIONS.map((option) => (
                            <label key={option.id} className={styles.permissionItem}>
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(option.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      permissions: [...formData.permissions, option.id]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      permissions: formData.permissions.filter(p => p !== option.id)
                                    });
                                  }
                                }}
                              />
                              <span className="material-icons">{option.icon}</span>
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  Submit <span className="material-icons">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Password Reset Panel */}
      {isPasswordResetOpen && resettingPasswordUser && (
        <>
          <div className={styles.panelOverlay} onClick={handleClosePasswordReset}></div>
          <div className={styles.formPanel}>
            <div className={styles.panelHeader}>
              <h2>Reset Password - {resettingPasswordUser.email}</h2>
              <button
                className={styles.closeButton}
                onClick={handleClosePasswordReset}
                aria-label="Close"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className={styles.form}>
              <div className={styles.formContent}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    New Password<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="Enter New Password"
                    value={passwordResetData.new_password}
                    onChange={(e) =>
                      setPasswordResetData({ ...passwordResetData, new_password: e.target.value })
                    }
                    required
                    autoFocus
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Confirm Password<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="Confirm New Password"
                    value={passwordResetData.confirm_password}
                    onChange={(e) =>
                      setPasswordResetData({ ...passwordResetData, confirm_password: e.target.value })
                    }
                    required
                  />
                  {formErrors.password_reset && (
                    <span className={styles.errorText}>{formErrors.password_reset}</span>
                  )}
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleClosePasswordReset}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  Reset Password <span className="material-icons">lock_reset</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

