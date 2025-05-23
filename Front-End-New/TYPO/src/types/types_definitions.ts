// Auth types
export type User = {
  id: string;
  email: string;
  accountType: 'user' | 'serviceProvider';
  token: string;
};

// Portfolio types
export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  clientDetails: string;
  serviceProviderId: string; // Links to your backend model
};

// Service Provider types (matches your backend DTOs)
export type ServiceProviderDetails = {
  name: string;
  profession: string;
  email: string;
  contact: string;
  // ...other fields from your ServiceProviderDetails model
};