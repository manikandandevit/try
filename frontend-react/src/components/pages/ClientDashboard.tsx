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
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formErrors, setFormErrors] = useState({ name: '', email: '' });
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
      setFormData({ name: client.name, email: client.email });
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '' });
    }
    setFormErrors({ name: '', email: '' });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingClient(null);
    setFormData({ name: '', email: '' });
    setFormErrors({ name: '', email: '' });
  };

  const validateForm = (): boolean => {
    const errors = { name: '', email: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
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
        // Update client
        await apiService.updateClient(editingClient.id, {
          name: formData.name.trim(),
          email: formData.email.trim(),
        });
      } else {
        // Create client
        await apiService.createClient({
          name: formData.name.trim(),
          email: formData.email.trim(),
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
      <div className={styles.header}>
        <h1 className={styles.title}>Client Dashboard</h1>
        <Button
          onClick={() => handleOpenForm()}
          icon="add"
          variant="primary"
        >
          Add Client
        </Button>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <span className="material-icons">search</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search clients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          onClick={() => handleOpenForm(client)}
                          variant="ghost"
                          size="small"
                          icon="edit"
                          aria-label="Edit client"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(client.id)}
                          variant="danger"
                          size="small"
                          icon="delete"
                          aria-label="Delete client"
                        >
                          Delete
                        </Button>
                        <Button
                          onClick={() => handleNewButtonClick(client)}
                          variant="primary"
                          size="small"
                          icon="add"
                          aria-label="New action"
                        >
                          New
                        </Button>
                        <div 
                          className={styles.dropdownContainer}
                          data-dropdown={client.id}
                        >
                          <Button
                            onClick={() => toggleDropdown(client.id)}
                            variant="primary"
                            size="small"
                            icon="arrow_drop_down"
                            aria-label="More options"
                          >
                            More
                          </Button>
                          {openDropdownId === client.id && (
                            <div className={styles.dropdownMenu}>
                              <button
                                className={styles.dropdownItem}
                                onClick={() => {
                                  console.log('Option 1 clicked for client:', client);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <span className="material-icons">visibility</span>
                                View Details
                              </button>
                              <button
                                className={styles.dropdownItem}
                                onClick={() => {
                                  console.log('Option 2 clicked for client:', client);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <span className="material-icons">content_copy</span>
                                Duplicate
                              </button>
                              <button
                                className={styles.dropdownItem}
                                onClick={() => {
                                  console.log('Option 3 clicked for client:', client);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <span className="material-icons">download</span>
                                Export
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}

      {/* Form Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseForm}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
              <button
                className={styles.closeButton}
                onClick={handleCloseForm}
                aria-label="Close"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={formErrors.name}
                required
                autoFocus
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={formErrors.email}
                required
              />

              <div className={styles.formActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseForm}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isLoading}>
                  {editingClient ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

