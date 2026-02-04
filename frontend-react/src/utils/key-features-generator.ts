/**
 * Key Features Generator
 * Generates exactly 4 key features for a given service name
 */

/**
 * Generates 4 key features for a service based on its name
 * @param serviceName - The name of the service
 * @returns Array of exactly 4 key features
 */
export const generateKeyFeatures = (serviceName: string): string[] => {
  if (!serviceName || serviceName.trim().length === 0) {
    return [
      'Professional service delivery',
      'Quality assurance',
      'Timely completion',
      'Customer support',
    ];
  }

  const normalizedName = serviceName.toLowerCase().trim();

  // Hardware/Electronics
  if (normalizedName.includes('monitor') || normalizedName.includes('display') || normalizedName.includes('screen')) {
    return [
      'Full HD / 4K display support',
      'HDMI and VGA connectivity',
      'Low power consumption',
      'Adjustable stand design',
    ];
  }

  if (normalizedName.includes('laptop') || normalizedName.includes('computer') || normalizedName.includes('pc')) {
    return [
      'High-performance processor',
      'Fast SSD storage',
      'Long battery life',
      'Modern connectivity ports',
    ];
  }

  if (normalizedName.includes('keyboard') || normalizedName.includes('mouse') || normalizedName.includes('peripheral')) {
    return [
      'Ergonomic design',
      'Wireless connectivity',
      'Long battery life',
      'Compatible with multiple devices',
    ];
  }

  // Software/AI Services
  if (normalizedName.includes('chatbot') || normalizedName.includes('ai') || normalizedName.includes('artificial intelligence')) {
    return [
      '24/7 automated customer support',
      'Multi-language support',
      'Real-time analytics dashboard',
      'Secure data handling',
    ];
  }

  if (normalizedName.includes('software') || normalizedName.includes('application') || normalizedName.includes('app')) {
    return [
      'User-friendly interface',
      'Cross-platform compatibility',
      'Regular updates and support',
      'Secure data encryption',
    ];
  }

  // Web Services
  if (normalizedName.includes('website') || normalizedName.includes('web development') || normalizedName.includes('web design')) {
    return [
      'Mobile-responsive design',
      'Fast loading performance',
      'SEO-friendly structure',
      'Secure hosting integration',
    ];
  }

  if (normalizedName.includes('e-commerce') || normalizedName.includes('online store') || normalizedName.includes('shop')) {
    return [
      'Secure payment gateway',
      'Inventory management system',
      'Order tracking functionality',
      'Mobile shopping experience',
    ];
  }

  if (normalizedName.includes('hosting') || normalizedName.includes('server') || normalizedName.includes('cloud')) {
    return [
      '99.9% uptime guarantee',
      'Scalable infrastructure',
      '24/7 technical support',
      'Data backup and recovery',
    ];
  }

  // Marketing Services
  if (normalizedName.includes('marketing') || normalizedName.includes('digital marketing') || normalizedName.includes('promotion')) {
    return [
      'Social media campaign management',
      'Targeted ad optimization',
      'Performance tracking reports',
      'Lead generation strategy',
    ];
  }

  if (normalizedName.includes('seo') || normalizedName.includes('search engine')) {
    return [
      'Keyword research and optimization',
      'On-page and off-page SEO',
      'Monthly performance reports',
      'Google ranking improvement',
    ];
  }

  if (normalizedName.includes('social media') || normalizedName.includes('smm')) {
    return [
      'Content creation and scheduling',
      'Multi-platform management',
      'Engagement analytics',
      'Community growth strategy',
    ];
  }

  // Design Services
  if (normalizedName.includes('design') || normalizedName.includes('graphic') || normalizedName.includes('logo')) {
    return [
      'Professional design concepts',
      'Multiple revision rounds',
      'High-resolution deliverables',
      'Brand consistency',
    ];
  }

  if (normalizedName.includes('ui') || normalizedName.includes('ux') || normalizedName.includes('interface')) {
    return [
      'User-centered design approach',
      'Interactive prototypes',
      'Usability testing',
      'Design system creation',
    ];
  }

  // Consulting Services
  if (normalizedName.includes('consulting') || normalizedName.includes('consultant') || normalizedName.includes('advisory')) {
    return [
      'Expert industry knowledge',
      'Customized solutions',
      'Strategic planning',
      'Ongoing support',
    ];
  }

  if (normalizedName.includes('training') || normalizedName.includes('workshop') || normalizedName.includes('course')) {
    return [
      'Expert-led sessions',
      'Hands-on practice',
      'Course materials included',
      'Certificate of completion',
    ];
  }

  // Maintenance/Support
  if (normalizedName.includes('maintenance') || normalizedName.includes('support') || normalizedName.includes('service')) {
    return [
      'Regular system updates',
      '24/7 technical assistance',
      'Preventive maintenance',
      'Quick response time',
    ];
  }

  // Network/IT Services
  if (normalizedName.includes('network') || normalizedName.includes('it infrastructure') || normalizedName.includes('system')) {
    return [
      'Secure network setup',
      'Performance monitoring',
      'Backup and disaster recovery',
      'Remote access support',
    ];
  }

  // Security Services
  if (normalizedName.includes('security') || normalizedName.includes('cyber') || normalizedName.includes('firewall')) {
    return [
      'Threat detection and prevention',
      'Regular security audits',
      'Data encryption',
      'Compliance certification',
    ];
  }

  // Content Services
  if (normalizedName.includes('content') || normalizedName.includes('writing') || normalizedName.includes('copywriting')) {
    return [
      'SEO-optimized content',
      'Original and plagiarism-free',
      'Multiple content formats',
      'Fast turnaround time',
    ];
  }

  // Photography/Video
  if (normalizedName.includes('photography') || normalizedName.includes('video') || normalizedName.includes('photo')) {
    return [
      'Professional equipment',
      'High-resolution output',
      'Post-production editing',
      'Multiple format delivery',
    ];
  }

  // Default generic features for unknown services
  return [
    'Professional service delivery',
    'Quality assurance',
    'Timely completion',
    'Customer support',
  ];
};


