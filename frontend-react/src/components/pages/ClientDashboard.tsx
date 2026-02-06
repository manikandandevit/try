/**
 * Client Dashboard Component
 * Provides CRUD operations for clients with search functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Client } from '@/types';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import styles from './ClientDashboard.module.css';

export const ClientDashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({ 
    customer_name: '', 
    company_name: '', 
    phone_number: '', 
    email: '', 
    address: '' 
  });
  const [formErrors, setFormErrors] = useState({ 
    customer_name: '', 
    email: '' 
  });
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Load clients
  const loadClients = useCallback(async (search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.listClients(search);
      setClients(response.clients);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadClients(searchQuery || undefined);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadClients]);

  // Form handlers
  const handleOpenForm = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({ 
        customer_name: client.customer_name || '', 
        company_name: client.company_name || '', 
        phone_number: client.phone_number || '', 
        email: client.email || '', 
        address: client.address || '' 
      });
    } else {
      setEditingClient(null);
      setFormData({ 
        customer_name: '', 
        company_name: '', 
        phone_number: '', 
        email: '', 
        address: '' 
      });
    }
    setFormErrors({ customer_name: '', email: '' });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingClient(null);
    setFormData({ 
      customer_name: '', 
      company_name: '', 
      phone_number: '', 
      email: '', 
      address: '' 
    });
    setFormErrors({ customer_name: '', email: '' });
  };

  const validateForm = (): boolean => {
    const errors = { customer_name: '', email: '' };
    let isValid = true;

    if (!formData.customer_name.trim()) {
      errors.customer_name = 'Customer Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
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
      if (editingClient) {
        // Update customer
        await apiService.updateClient(editingClient.id, {
          customer_name: formData.customer_name.trim(),
          company_name: formData.company_name.trim() || undefined,
          phone_number: formData.phone_number.trim() || undefined,
          email: formData.email.trim(),
          address: formData.address.trim() || undefined,
        });
      } else {
        // Create customer
        await apiService.createClient({
          customer_name: formData.customer_name.trim(),
          company_name: formData.company_name.trim() || undefined,
          phone_number: formData.phone_number.trim() || undefined,
          email: formData.email.trim(),
          address: formData.address.trim() || undefined,
        });
      }
      
      handleCloseForm();
      await loadClients(searchQuery || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save client');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (clientId: number) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiService.deleteClient(clientId);
      await loadClients(searchQuery || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewButtonClick = (client: Client) => {
    console.log('New button clicked for client:', client);
    // Add your custom logic here
  };

  const toggleDropdown = (clientId: number) => {
    setOpenDropdownId(openDropdownId === clientId ? null : clientId);
  };

  const handleToggleSwitch = async (client: Client) => {
    const newIsActive = !client.is_active;

    // Optimistic UI update
    setClients(prev =>
      prev.map(c =>
        c.id === client.id ? { ...c, is_active: newIsActive } : c
      )
    );

    try {
      await apiService.updateClient(client.id, {
        customer_name: client.customer_name,
        company_name: client.company_name || undefined,
        phone_number: client.phone_number || undefined,
        email: client.email,
        address: client.address || undefined,
        is_active: newIsActive,
      });
    } catch (err) {
      // Revert change on error
      setClients(prev =>
        prev.map(c =>
          c.id === client.id ? { ...c, is_active: client.is_active } : c
        )
      );
      setError(err instanceof Error ? err.message : 'Failed to update toggle');
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = clients.slice(startIndex, endIndex);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest(`[data-dropdown="${openDropdownId}"]`)) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  return (
    <div className={styles.dashboard}>
      {/* Header with Title, Search, and Button in one row */}
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
            Add Customer
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
      {isLoading && clients.length === 0 && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
      )}

      {/* Clients Table */}
      {!isLoading || clients.length > 0 ? (
        <div className={styles.tableContainer}>
          {clients.length === 0 ? (
            <div className={styles.emptyState}>
              <span className="material-icons">person_off</span>
              <p>No clients found</p>
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
                    <col className={styles.colCustomerName} />
                    <col className={styles.colCompanyName} />
                    <col className={styles.colPhone} />
                    <col className={styles.colEmail} />
                    <col className={styles.colAddress} />
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
                          Customer Name
                          <span className="material-icons">arrow_drop_down</span>
                        </span>
                      </th>
                      <th className={styles.sortable}>
                        <span className={styles.headerContent}>
                          Company Name
                          <span className="material-icons">arrow_drop_down</span>
                        </span>
                      </th>
                      <th className={styles.sortable}>
                        <span className={styles.headerContent}>
                          Phone Number
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
                          Address
                          <span className="material-icons">arrow_drop_down</span>
                        </span>
                      </th>
                      <th className={styles.actionHeader}>
                        <span className={styles.headerContent}>Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClients.map((client, index) => {
                      const serialNumber = startIndex + index + 1;
                      const isToggleActive = client.is_active;
                      return (
                        <tr key={client.id}>
                          <td className={styles.cellSno}>{client.id}</td>
                          <td className={styles.cellCustomerName}>{client.customer_name}</td>
                          <td className={styles.cellCompanyName}>{client.company_name || '-'}</td>
                          <td className={styles.cellPhone}>{client.phone_number || '-'}</td>
                          <td className={styles.cellEmail}>{client.email}</td>
                          <td className={styles.cellAddress}>{client.address || '-'}</td>
                          <td className={styles.cellAction}>
                            <div className={styles.actions}>
                              {/* Toggle Switch */}
                              <label className={styles.toggleSwitch}>
                                <input 
                                  type="checkbox" 
                                  checked={isToggleActive}
                                  onChange={() => handleToggleSwitch(client)}
                                />
                                <span className={`${styles.toggleSlider} ${isToggleActive ? styles.active : ''}`}></span>
                              </label>
                              {/* Edit Icon */}
                              <button
                                className={styles.actionButton}
                                onClick={() => handleOpenForm(client)}
                                aria-label="Edit customer"
                              >
                                <span className="material-icons">edit</span>
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
                {currentClients.map((client, index) => {
                  const serialNumber = startIndex + index + 1;
                  const isToggleActive = client.is_active;
                  return (
                    <div key={client.id} className={styles.mobileCard}>
                      <div className={styles.mobileCardHeader}>
                        <div className={styles.mobileCardTitle}>
                          <span className={styles.mobileCardSno}>{client.id}</span>
                          <h3 className={styles.mobileCardName}>{client.customer_name}</h3>
                        </div>
                        <label className={styles.toggleSwitch}>
                          <input 
                            type="checkbox" 
                            checked={isToggleActive}
                            onChange={() => handleToggleSwitch(client)}
                          />
                          <span className={`${styles.toggleSlider} ${isToggleActive ? styles.active : ''}`}></span>
                        </label>
                      </div>
                      <div className={styles.mobileCardBody}>
                        <div className={styles.mobileCardRow}>
                          <span className={styles.mobileCardLabel}>Company:</span>
                          <span className={styles.mobileCardValue}>{client.company_name || '-'}</span>
                        </div>
                        <div className={styles.mobileCardRow}>
                          <span className={styles.mobileCardLabel}>Phone:</span>
                          <span className={styles.mobileCardValue}>{client.phone_number || '-'}</span>
                        </div>
                        <div className={styles.mobileCardRow}>
                          <span className={styles.mobileCardLabel}>Email:</span>
                          <span className={styles.mobileCardValue}>{client.email}</span>
                        </div>
                        {client.address && (
                          <div className={styles.mobileCardRow}>
                            <span className={styles.mobileCardLabel}>Address:</span>
                            <span className={styles.mobileCardValue}>{client.address}</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.mobileCardActions}>
                        <button
                          className={styles.mobileActionButton}
                          onClick={() => handleOpenForm(client)}
                          aria-label="Edit customer"
                        >
                          <span className="material-icons">edit</span>
                          <span>Edit</span>
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
      {clients.length > 0 && (
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
            {/* Show first page if not in first 3 pages */}
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
            {/* Show pages around current page */}
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
            {/* Show last page if not in last 3 pages */}
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
              <h2>{editingClient ? 'Edit' : 'Add'}</h2>
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
                    Customer Name<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter Customer Name"
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_name: e.target.value })
                    }
                    required
                    autoFocus
                  />
                  {formErrors.customer_name && (
                    <span className={styles.errorText}>{formErrors.customer_name}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Company Name<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter Company Name"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Phone Number<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="Enter a Number"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    required
                  />
                </div>

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
                  />
                  {formErrors.email && (
                    <span className={styles.errorText}>{formErrors.email}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Address</label>
                  <textarea
                    className={styles.textarea}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                    placeholder="Description"
                  />
                </div>
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
    </div>
  );
};

