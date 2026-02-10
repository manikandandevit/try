/**
 * Profile Component
 * Displays user profile details for regular users and admin details for admins
 */

import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import type { CheckAuthResponse } from '@/types';
import styles from './Profile.module.css';

export const Profile: React.FC = () => {
  const [authData, setAuthData] = useState<CheckAuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.checkAuth();
      if (response.authenticated) {
        setAuthData(response);
      } else {
        setError('Not authenticated');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.profile}>
        <div className={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.profile}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!authData || !authData.authenticated) {
    return (
      <div className={styles.profile}>
        <div className={styles.error}>Not authenticated</div>
      </div>
    );
  }

  const isAdmin = authData.is_admin || false;
  const userDetails = authData.user_details;

  return (
    <div className={styles.profile}>
      <div className={styles.profileHeader}>
        <h1 className={styles.title}>Profile</h1>
        <div className={styles.roleBadge}>
          <span className={`${styles.badge} ${isAdmin ? styles.badgeAdmin : styles.badgeUser}`}>
            {isAdmin ? 'Admin' : 'User'}
          </span>
        </div>
      </div>

      <div className={styles.profileContent}>
        {isAdmin ? (
          // Admin Profile
          <div className={styles.profileCard}>
            <div className={styles.cardHeader}>
              <span className="material-icons">admin_panel_settings</span>
              <h2>Admin Details</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.infoRow}>
                <div className={styles.infoLabel}>
                  <span className="material-icons">email</span>
                  <span>Company Email</span>
                </div>
                <div className={styles.infoValue}>
                  {userDetails?.company_email || authData.user_email || 'N/A'}
                </div>
              </div>
              
              {userDetails?.send_email && (
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <span className="material-icons">send</span>
                    <span>Send Email</span>
                  </div>
                  <div className={styles.infoValue}>
                    {userDetails.send_email}
                  </div>
                </div>
              )}
              
              {userDetails?.send_number && (
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <span className="material-icons">phone</span>
                    <span>Send Number</span>
                  </div>
                  <div className={styles.infoValue}>
                    {userDetails.send_number}
                  </div>
                </div>
              )}
              
              {userDetails?.created_at && (
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <span className="material-icons">calendar_today</span>
                    <span>Created At</span>
                  </div>
                  <div className={styles.infoValue}>
                    {new Date(userDetails.created_at).toLocaleString()}
                  </div>
                </div>
              )}
              
              {userDetails?.updated_at && (
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <span className="material-icons">update</span>
                    <span>Last Updated</span>
                  </div>
                  <div className={styles.infoValue}>
                    {new Date(userDetails.updated_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // User Profile
          <div className={styles.profileCard}>
            <div className={styles.cardHeader}>
              <span className="material-icons">person</span>
              <h2>User Details</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.infoRow}>
                <div className={styles.infoLabel}>
                  <span className="material-icons">email</span>
                  <span>Email</span>
                </div>
                <div className={styles.infoValue}>
                  {authData.user_email || 'N/A'}
                </div>
              </div>
              
              {userDetails?.first_name && (
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <span className="material-icons">badge</span>
                    <span>First Name</span>
                  </div>
                  <div className={styles.infoValue}>
                    {userDetails.first_name}
                  </div>
                </div>
              )}
              
              {userDetails?.last_name && (
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <span className="material-icons">badge</span>
                    <span>Last Name</span>
                  </div>
                  <div className={styles.infoValue}>
                    {userDetails.last_name}
                  </div>
                </div>
              )}
              
              {authData.user_name && (
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <span className="material-icons">account_circle</span>
                    <span>Full Name</span>
                  </div>
                  <div className={styles.infoValue}>
                    {authData.user_name}
                  </div>
                </div>
              )}
              
              <div className={styles.infoRow}>
                <div className={styles.infoLabel}>
                  <span className="material-icons">verified</span>
                  <span>Status</span>
                </div>
                <div className={styles.infoValue}>
                  <span className={`${styles.statusBadge} ${userDetails?.is_active ? styles.statusActive : styles.statusInactive}`}>
                    {userDetails?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {authData.permissions && authData.permissions.length > 0 && (
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <span className="material-icons">lock</span>
                    <span>Permissions</span>
                  </div>
                  <div className={styles.infoValue}>
                    <div className={styles.permissionsList}>
                      {authData.permissions.map((perm, index) => (
                        <span key={index} className={styles.permissionTag}>
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {userDetails?.created_at && (
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <span className="material-icons">calendar_today</span>
                    <span>Created At</span>
                  </div>
                  <div className={styles.infoValue}>
                    {new Date(userDetails.created_at).toLocaleString()}
                  </div>
                </div>
              )}
              
              {userDetails?.updated_at && (
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <span className="material-icons">update</span>
                    <span>Last Updated</span>
                  </div>
                  <div className={styles.infoValue}>
                    {new Date(userDetails.updated_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

