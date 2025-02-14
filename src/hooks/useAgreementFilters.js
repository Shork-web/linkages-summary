import { useState, useMemo } from 'react';

export const useAgreementFilters = (agreements) => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    partnerType: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredAgreements = useMemo(() => {
    return agreements.filter(agreement => {
      const searchTerm = filters.search.toLowerCase().trim();
      
      // If no search term, only apply type filters
      if (!searchTerm) {
        return (!filters.type || agreement.agreementType === filters.type) &&
               (!filters.partnerType || agreement.partnerType === filters.partnerType);
      }

      // Check if any field matches the search term
      const isMatch = [
        agreement.name,
        agreement.address,
        agreement.signedBy,
        agreement.designation,
        agreement.description,
        agreement.agreementType,
        agreement.partnerType,
        agreement.status,
        agreement.validity,
        agreement.dateSigned,
        agreement.dateExpired
      ].some(field => 
        String(field || '').toLowerCase().includes(searchTerm)
      );

      // Apply both search and type filters
      return isMatch && 
             (!filters.type || agreement.agreementType === filters.type) &&
             (!filters.partnerType || agreement.partnerType === filters.partnerType);
    });
  }, [agreements, filters]);

  return {
    filters,
    handleFilterChange,
    filteredAgreements
  };
}; 