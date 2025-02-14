export const calculateExpiryDate = (dateSigned, validityYears) => {
  if (!dateSigned || !validityYears) return '';
  
  const date = new Date(dateSigned);
  date.setFullYear(date.getFullYear() + parseInt(validityYears));
  
  // Format date to YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

// Helper function to format date to YYYY-MM-DD
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

// Helper function to calculate remaining years
export const calculateRemainingTime = (dateExpired) => {
  if (!dateExpired) return 0;
  
  const today = new Date();
  const expiry = new Date(dateExpired);
  
  // Calculate years difference
  const diffYears = expiry.getFullYear() - today.getFullYear();
  const monthDiff = expiry.getMonth() - today.getMonth();
  const dayDiff = expiry.getDate() - today.getDate();
  
  // Adjust years based on months and days
  let years = diffYears;
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years--;
  }
  
  return Math.max(0, years);
};

// Helper function to get a more detailed time remaining
export const getDetailedTimeRemaining = (dateExpired) => {
  if (!dateExpired) return { years: 0, months: 0 };
  
  const today = new Date();
  const expiry = new Date(dateExpired);
  
  let years = expiry.getFullYear() - today.getFullYear();
  let months = expiry.getMonth() - today.getMonth();
  
  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Adjust for days
  if (expiry.getDate() < today.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  
  return {
    years: Math.max(0, years),
    months: Math.max(0, months)
  };
}; 