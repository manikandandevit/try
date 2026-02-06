/**
 * Dashboard Component
 * Displays KPI cards, monthly sends bar chart, and email/WhatsApp breakdown pie chart
 */

import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import type { DashboardStatsResponse } from '@/types';
import styles from './Dashboard.module.css';

type SortField = 'customer_name' | 'company_name' | 'email' | 'phone_number' | 'total_quotation' | 'status';
type SortDirection = 'asc' | 'desc';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    loadDashboardStats();
  }, [selectedYear]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getDashboardStats(selectedYear);
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError('Failed to load dashboard statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Generate years for dropdown (current year and 4 previous years)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.error}>No data available</div>
      </div>
    );
  }

  // Calculate max value for bar chart scaling
  const maxDataValue = Math.max(...stats.monthly_sends.map(m => m.total), 0);
  // Use dynamic scaling: if max value is low, use a smaller scale, otherwise use 1000
  const maxBarValue = maxDataValue > 0 
    ? Math.max(maxDataValue * 1.2, 10) // Add 20% padding, minimum 10
    : 1000; // Default to 1000 if no data
  const chartHeight = 300;

  // Pie chart calculations
  const totalSends = stats.send_breakdown.total;
  const emailPercentage = stats.send_breakdown.email.percentage;
  const whatsappPercentage = stats.send_breakdown.whatsapp.percentage;

  // Helper function to round numbers
  const round = (num: number, decimals: number) => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  // Calculate "Not Sent" percentage for pie chart (quotations that haven't been sent)
  // This represents quotations that exist but haven't been sent via email or WhatsApp
  const notSentCount = Math.max(0, stats.kpis.total_quotations - totalSends);
  const notSentPercentage = stats.kpis.total_quotations > 0 
    ? round((notSentCount / stats.kpis.total_quotations) * 100, 1)
    : 0;

  // SVG pie chart path calculations
  const radius = 70;
  const centerX = 100;
  const centerY = 100;
  
  // Update pie chart SVG viewBox to match new center
  const pieViewBox = "0 0 200 200";
  
  // Calculate angles for pie slices
  const emailAngle = (emailPercentage / 100) * 360;
  const whatsappAngle = (whatsappPercentage / 100) * 360;
  const notSentAngle = (notSentPercentage / 100) * 360;
  
  // Convert angles to radians and calculate path
  const getPieSlicePath = (startAngle: number, endAngle: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const emailStartAngle = 0;
  const emailEndAngle = emailAngle;
  const whatsappStartAngle = emailEndAngle;
  const whatsappEndAngle = emailEndAngle + whatsappAngle;
  const notSentStartAngle = whatsappEndAngle;
  const notSentEndAngle = whatsappEndAngle + notSentAngle;

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort customers
  const filteredCustomers = stats.customers ? stats.customers.filter(customer => customer.status === statusFilter) : [];
  
  const sortedCustomers = filteredCustomers.sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: string | number = a[sortField];
    let bValue: string | number = b[sortField];
    
    if (sortField === 'status') {
      aValue = a.status === 'Active' ? 1 : 0;
      bValue = b.status === 'Active' ? 1 : 0;
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className={styles.dashboard}>
      {/* KPI Cards */}
      <div className={styles.kpiCards}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <div className={styles.kpiInfo}>
              <h3 className={styles.kpiTitle}>Total Quotation</h3>
              <p className={styles.kpiValue}>{stats.kpis.total_quotations}</p>
            </div>
            <div className={`${styles.kpiIcon} ${styles.kpiIconBlue}`}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="8" y="8" width="24" height="28" rx="2" fill="white" opacity="0.9"/>
                <rect x="12" y="12" width="16" height="2" rx="1" fill="#3B82F6"/>
                <rect x="12" y="16" width="12" height="2" rx="1" fill="#3B82F6" opacity="0.7"/>
                <circle cx="28" cy="28" r="6" fill="white" opacity="0.9"/>
                <path d="M25 28L27 30L31 26" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <div className={styles.kpiInfo}>
              <h3 className={styles.kpiTitle}>Active Customers</h3>
              <p className={styles.kpiValue}>{stats.kpis.active_customers}</p>
            </div>
            <div className={`${styles.kpiIcon} ${styles.kpiIconGreen}`}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="18" r="7" fill="white" opacity="0.9"/>
                <path d="M10 32C10 26 14 22 20 22C26 22 30 26 30 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
                <circle cx="20" cy="20" r="2" fill="#10b981" opacity="0.8"/>
              </svg>
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <div className={styles.kpiInfo}>
              <h3 className={styles.kpiTitle}>Inactive Customers</h3>
              <p className={styles.kpiValue}>{stats.kpis.inactive_customers}</p>
            </div>
            <div className={`${styles.kpiIcon} ${styles.kpiIconGray}`}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="18" r="7" fill="white" opacity="0.9"/>
                <path d="M10 32C10 26 14 22 20 22C26 22 30 26 30 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
                <circle cx="20" cy="20" r="2" fill="#6b7280" opacity="0.8"/>
              </svg>
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <div className={styles.kpiInfo}>
              <h3 className={styles.kpiTitle}>Total Users</h3>
              <p className={styles.kpiValue}>+{stats.kpis.total_users.toLocaleString()}</p>
            </div>
            <div className={`${styles.kpiIcon} ${styles.kpiIconTeal}`}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="16" cy="16" r="5" fill="white" opacity="0.9"/>
                <circle cx="24" cy="16" r="5" fill="white" opacity="0.9"/>
                <path d="M8 28C8 24 11 21 16 21C18 21 20 22 21 23" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
                <path d="M19 28C19 24 22 21 24 21C26 21 28 22 29 23" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
                <path d="M12 28C12 25 14 23 16 23C18 23 20 25 20 28" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
                <path d="M20 28C20 25 22 23 24 23C26 23 28 25 28 28" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        {/* Bar Chart - Monthly Email + WhatsApp Sends */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Quotations Sent Overview</h3>
            <select
              className={styles.yearSelector}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className={styles.barChart}>
            <div className={styles.barChartYAxis}>
              <div className={styles.yAxisLabel}>Count</div>
            </div>
            <div className={styles.barChartContent}>
              <div className={styles.barsContainer}>
                {stats.monthly_sends.map((month, index) => {
                  const barHeight = Math.max((month.total / maxBarValue) * chartHeight, 4);
                  return (
                    <div key={index} className={styles.barGroup}>
                      <div className={styles.barWrapper}>
                        <div
                          className={styles.bar}
                          style={{ height: `${barHeight}px` }}
                          title={`${month.month}: ${month.total} quotation${month.total !== 1 ? 's' : ''} sent (${month.email} via Email, ${month.whatsapp} via WhatsApp)`}
                        >
                          <div className={styles.barValue}>{month.total}</div>
                        </div>
                      </div>
                      <div className={styles.barLabel}>{month.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart - Email vs WhatsApp Breakdown */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Quotation Distribution</h3>
              <p className={styles.chartSubtitle}>Email vs WhatsApp vs Not Sent</p>
            </div>
            <div className={styles.chartActions}>
              <span className={styles.updateTime}>
                Updated at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <div className={styles.pieChart}>
            <div className={styles.pieChartContainer}>
              <svg width="200" height="200" viewBox="0 0 200 200" className={styles.pieSvg}>
                {/* Email slice */}
                {emailPercentage > 0 && (
                  <path
                    d={getPieSlicePath(emailStartAngle, emailEndAngle)}
                    fill="#3B82F6"
                    className={styles.pieSlice}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                )}
                {/* WhatsApp slice */}
                {whatsappPercentage > 0 && (
                  <path
                    d={getPieSlicePath(whatsappStartAngle, whatsappEndAngle)}
                    fill="#14B8A6"
                    className={styles.pieSlice}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                )}
                {/* Not Sent slice (if any) */}
                {notSentPercentage > 0 && (
                  <path
                    d={getPieSlicePath(notSentStartAngle, notSentEndAngle)}
                    fill="#F59E0B"
                    className={styles.pieSlice}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                )}
                {/* Center circle for donut effect */}
                <circle cx="100" cy="100" r="50" fill="white" />
                <text x="100" y="95" textAnchor="middle" className={styles.pieCenterText}>
                  Total
                </text>
                <text x="100" y="115" textAnchor="middle" className={styles.pieCenterValue}>
                  {stats.kpis.total_quotations}
                </text>
              </svg>
            </div>
            <div className={styles.pieLegend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotBlue}`}></span>
                <span className={styles.legendText}>
                  <strong>Email</strong> - {emailPercentage}% ({stats.send_breakdown.email.count})
                </span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotTeal}`}></span>
                <span className={styles.legendText}>
                  <strong>WhatsApp</strong> - {whatsappPercentage}% ({stats.send_breakdown.whatsapp.count})
                </span>
              </div>
              {notSentPercentage > 0 && (
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendDotYellow}`}></span>
                  <span className={styles.legendText}>
                    <strong>Not Sent</strong> - {notSentPercentage.toFixed(1)}% ({notSentCount})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Customers</h3>
          <div className={styles.statusToggle}>
            <button
              className={`${styles.toggleButton} ${statusFilter === 'Active' ? styles.toggleActive : ''}`}
              onClick={() => setStatusFilter('Active')}
            >
              Active
            </button>
            <button
              className={`${styles.toggleButton} ${statusFilter === 'Inactive' ? styles.toggleActive : ''}`}
              onClick={() => setStatusFilter('Inactive')}
            >
              Inactive
            </button>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>S. No</th>
                <th 
                  className={styles.sortable}
                  onClick={() => handleSort('customer_name')}
                >
                  Customer Name
                  <span className={styles.sortIcon}>
                    {sortField === 'customer_name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}
                  </span>
                </th>
                <th 
                  className={styles.sortable}
                  onClick={() => handleSort('company_name')}
                >
                  Company Name
                  <span className={styles.sortIcon}>
                    {sortField === 'company_name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}
                  </span>
                </th>
                <th 
                  className={styles.sortable}
                  onClick={() => handleSort('email')}
                >
                  Email
                  <span className={styles.sortIcon}>
                    {sortField === 'email' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}
                  </span>
                </th>
                <th 
                  className={styles.sortable}
                  onClick={() => handleSort('phone_number')}
                >
                  Phone Number
                  <span className={styles.sortIcon}>
                    {sortField === 'phone_number' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}
                  </span>
                </th>
                <th 
                  className={styles.sortable}
                  onClick={() => handleSort('total_quotation')}
                >
                  Total Quotation
                  <span className={styles.sortIcon}>
                    {sortField === 'total_quotation' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}
                  </span>
                </th>
                <th 
                  className={styles.sortable}
                  onClick={() => handleSort('status')}
                >
                  Status
                  <span className={styles.sortIcon}>
                    {sortField === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.length > 0 ? (
                sortedCustomers.map((customer, index) => (
                  <tr key={customer.id}>
                    <td>{index + 1}</td>
                    <td>{customer.customer_name}</td>
                    <td>{customer.company_name || '-'}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone_number || '-'}</td>
                    <td>{customer.total_quotation}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${customer.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                        <span className={styles.statusDot}></span>
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className={styles.noData}>
                    No {statusFilter.toLowerCase()} customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

