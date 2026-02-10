/**
 * useCompanyInfo Hook
 * Manages company information
 */

import { useState, useEffect, useCallback } from 'react';
import type { CompanyInfo, UseCompanyInfoReturn } from '@/types';
import { apiService } from '@/services/api';

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  company_name: 'SYNGRID',
  tagline: 'MY_COMPANY',
  website: 'https://syngrid.com/',
  phone_number: '9342590533',
  email: 'contact@syngrid.com',
  address: 'TRI@TCE, Thiruparankundaram, Madurai – 625 015',
  logo_url: null,
};

export const useCompanyInfo = (): UseCompanyInfoReturn => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompanyInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getCompanyInfo();
      
      if (response.error) {
        setCompanyInfo(DEFAULT_COMPANY_INFO);
        return;
      }

      const logoUrl = response.logo_url || null;

      setCompanyInfo({
        company_name: response.company_name || DEFAULT_COMPANY_INFO.company_name,
        tagline: response.tagline || DEFAULT_COMPANY_INFO.tagline,
        website: response.website || DEFAULT_COMPANY_INFO.website,
        phone_number: response.phone_number || DEFAULT_COMPANY_INFO.phone_number,
        email: response.email || DEFAULT_COMPANY_INFO.email,
        address: response.address || DEFAULT_COMPANY_INFO.address,
        logo_url: logoUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company info');
      setCompanyInfo(DEFAULT_COMPANY_INFO);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanyInfo();
  }, [loadCompanyInfo]);

  return {
    companyInfo,
    isLoading,
    error,
    refresh: loadCompanyInfo,
  };
};

