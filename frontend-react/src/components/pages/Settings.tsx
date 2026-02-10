/**
 * Settings Component
 * Displays and allows editing of company details
 */

import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import type { CompanyDetails } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import styles from './Settings.module.css';

export const Settings: React.FC = () => {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    tagline: '',
    phone_number: '',
    address: '',
    sendemail: '',
    sendpassword: '',
    sendnumber: '',
    openrouter_api_key: '',
    openrouter_model: '',
  });

  const [imageUploading, setImageUploading] = useState<{
    login_logo: boolean;
    login_image: boolean;
    quotation_logo: boolean;
  }>({
    login_logo: false,
    login_image: false,
    quotation_logo: false,
  });

  useEffect(() => {
    loadCompanyDetails();
  }, []);

  const loadCompanyDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCompanyDetails();
      if (response.success && response.company) {
        setCompanyDetails(response.company);
        setFormData({
          company_name: response.company.company_name || '',
          email: response.company.email || '',
          tagline: response.company.tagline || '',
          phone_number: response.company.phone_number || '',
          address: response.company.address || '',
          sendemail: response.company.sendemail || '',
          sendpassword: response.company.sendpassword || '',
          sendnumber: response.company.sendnumber || '',
          openrouter_api_key: response.company.openrouter_api_key || '',
          openrouter_model: response.company.openrouter_model || 'google/gemini-flash-1.5:free',
        });
      } else {
        setError(response.error || 'Failed to load company details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setError('Company email is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.updateCompanyDetails({
        company_name: formData.company_name.trim() || undefined,
        email: formData.email.trim(),
        tagline: formData.tagline.trim() || undefined,
        phone_number: formData.phone_number.trim() || undefined,
        address: formData.address.trim() || undefined,
        sendemail: formData.sendemail.trim() || undefined,
        sendpassword: formData.sendpassword.trim() || undefined,
        sendnumber: formData.sendnumber.trim() || undefined,
        openrouter_api_key: formData.openrouter_api_key.trim() || undefined,
        openrouter_model: formData.openrouter_model.trim() || undefined,
      });

      if (response.success && response.company) {
        setCompanyDetails(response.company);
        setSuccess('Company details updated successfully!');
        setIsEditing(false);
        // Reload to get updated data
        await loadCompanyDetails();
      } else {
        setError(response.error || 'Failed to update company details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company details');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (companyDetails) {
      setFormData({
        company_name: companyDetails.company_name || '',
        email: companyDetails.email || '',
        tagline: companyDetails.tagline || '',
        phone_number: companyDetails.phone_number || '',
        address: companyDetails.address || '',
        sendemail: companyDetails.sendemail || '',
        sendpassword: companyDetails.sendpassword || '',
        sendnumber: companyDetails.sendnumber || '',
        openrouter_api_key: companyDetails.openrouter_api_key || '',
        openrouter_model: companyDetails.openrouter_model || 'google/gemini-flash-1.5:free',
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleImageUpload = async (imageType: 'login_logo' | 'login_image' | 'quotation_logo', file: File) => {
    if (!file) return;

    setImageUploading(prev => ({ ...prev, [imageType]: true }));
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('image_type', imageType);
      formData.append(imageType, file);

      const token = localStorage.getItem('access_token');
      
      // Get CSRF token
      let csrfToken = '';
      try {
        const csrfResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/csrf-token/`);
        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json();
          csrfToken = csrfData.csrfToken || '';
        }
      } catch (e) {
        // CSRF token fetch failed, continue without it
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/company-details/upload-image/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRFToken': csrfToken,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`${imageType.replace('_', ' ')} uploaded successfully!`);
        // Reload company details to get updated image URLs
        await loadCompanyDetails();
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setImageUploading(prev => ({ ...prev, [imageType]: false }));
    }
  };

  if (loading) {
    return (
      <div className={styles.settings}>
        <div className={styles.loading}>
          <LoadingSpinner />
          <p>Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error && !companyDetails) {
    return (
      <div className={styles.settings}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <h1 className={styles.title}>Company Settings</h1>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className={styles.editButton}
          >
            <span className="material-icons">edit</span>
            Edit
          </Button>
        )}
      </div>

      {success && (
        <div className={styles.successMessage}>
          <span className="material-icons">check_circle</span>
          {success}
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          <span className="material-icons">error</span>
          {error}
        </div>
      )}

      <div className={styles.settingsContent}>
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <span className="material-icons">business</span>
            <h2>Company Details</h2>
          </div>

          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className="material-icons">business</span>
                Company Name
              </label>
              <Input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Your Company Name"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className="material-icons">email</span>
                Company Email <span className={styles.required}>*</span>
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
                placeholder="company@example.com"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className="material-icons">tag</span>
                Company Tagline
              </label>
              <Input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Your company tagline"
                className={styles.input}
              />
              <p className={styles.helpText}>
                Short tagline or slogan for your company
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className="material-icons">phone</span>
                Company Phone Number
              </label>
              <Input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+91 1234567890"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className="material-icons">location_on</span>
                Company Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Your company address"
                className={styles.input}
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className="material-icons">send</span>
                Send Email (SMTP)
              </label>
              <Input
                type="email"
                name="sendemail"
                value={formData.sendemail}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="smtp@example.com"
                className={styles.input}
              />
              <p className={styles.helpText}>
                Email address used to send quotations via SMTP
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className="material-icons">lock</span>
                Send Email Password (SMTP)
              </label>
              <Input
                type="password"
                name="sendpassword"
                value={formData.sendpassword}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter SMTP password"
                className={styles.input}
              />
              <p className={styles.helpText}>
                Password for the SMTP email account
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className="material-icons">phone</span>
                Send Number (WhatsApp)
              </label>
              <Input
                type="text"
                name="sendnumber"
                value={formData.sendnumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+91 1234567890"
                className={styles.input}
              />
              <p className={styles.helpText}>
                Phone number used to send quotations via WhatsApp
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className="material-icons">key</span>
                OpenRouter API Key
              </label>
              <Input
                type="password"
                name="openrouter_api_key"
                value={formData.openrouter_api_key}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="sk-or-v1-..."
                className={styles.input}
              />
              <p className={styles.helpText}>
                API key for OpenRouter AI service (used for quotation generation)
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className="material-icons">smart_toy</span>
                OpenRouter Model
              </label>
              <Input
                type="text"
                name="openrouter_model"
                value={formData.openrouter_model}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="google/gemini-flash-1.5:free"
                className={styles.input}
              />
              <p className={styles.helpText}>
                Model name for OpenRouter (e.g., google/gemini-flash-1.5:free, anthropic/claude-3.5-sonnet)
              </p>
            </div>

            {isEditing && (
              <div className={styles.formActions}>
                <Button
                  type="button"
                  onClick={handleCancel}
                  className={styles.cancelButton}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="small" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-icons">save</span>
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>

        {companyDetails && (
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <span className="material-icons">image</span>
              <h2>Company Images</h2>
            </div>

            <div className={styles.imageSection}>
              <div className={styles.imageItem}>
                <label className={styles.imageLabel}>Login Logo</label>
                {companyDetails.login_logo_url ? (
                  <div className={styles.imagePreview}>
                    <img src={companyDetails.login_logo_url} alt="Login Logo" />
                  </div>
                ) : (
                  <div className={styles.noImage}>No logo uploaded</div>
                )}
                <div className={styles.imageUpload}>
                  <input
                    type="file"
                    id="login_logo_upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('login_logo', file);
                    }}
                    style={{ display: 'none' }}
                  />
                  <Button
                    onClick={() => document.getElementById('login_logo_upload')?.click()}
                    disabled={imageUploading.login_logo}
                    className={styles.uploadButton}
                  >
                    {imageUploading.login_logo ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                </div>
              </div>

              <div className={styles.imageItem}>
                <label className={styles.imageLabel}>Login Image</label>
                {companyDetails.login_image_url ? (
                  <div className={styles.imagePreview}>
                    <img src={companyDetails.login_image_url} alt="Login Image" />
                  </div>
                ) : (
                  <div className={styles.noImage}>No image uploaded</div>
                )}
                <div className={styles.imageUpload}>
                  <input
                    type="file"
                    id="login_image_upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('login_image', file);
                    }}
                    style={{ display: 'none' }}
                  />
                  <Button
                    onClick={() => document.getElementById('login_image_upload')?.click()}
                    disabled={imageUploading.login_image}
                    className={styles.uploadButton}
                  >
                    {imageUploading.login_image ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </div>

              <div className={styles.imageItem}>
                <label className={styles.imageLabel}>Quotation Logo</label>
                {companyDetails.quotation_logo_url ? (
                  <div className={styles.imagePreview}>
                    <img src={companyDetails.quotation_logo_url} alt="Quotation Logo" />
                  </div>
                ) : (
                  <div className={styles.noImage}>No logo uploaded</div>
                )}
                <div className={styles.imageUpload}>
                  <input
                    type="file"
                    id="quotation_logo_upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('quotation_logo', file);
                    }}
                    style={{ display: 'none' }}
                  />
                  <Button
                    onClick={() => document.getElementById('quotation_logo_upload')?.click()}
                    disabled={imageUploading.quotation_logo}
                    className={styles.uploadButton}
                  >
                    {imageUploading.quotation_logo ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {companyDetails && (
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <span className="material-icons">info</span>
              <h2>Additional Information</h2>
            </div>

            <div className={styles.infoSection}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <span className="material-icons">calendar_today</span>
                  Created At
                </span>
                <span className={styles.infoValue}>
                  {companyDetails.created_at
                    ? new Date(companyDetails.created_at).toLocaleString()
                    : 'N/A'}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <span className="material-icons">update</span>
                  Last Updated
                </span>
                <span className={styles.infoValue}>
                  {companyDetails.updated_at
                    ? new Date(companyDetails.updated_at).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

