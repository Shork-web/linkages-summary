import React from 'react';
import * as XLSX from 'xlsx';
import './ExcelExport.css';

const ExcelExport = ({ agreements }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = agreements.map(agreement => ({
      'Name': agreement.name,
      'Address': agreement.address,
      'Signed By': agreement.signedBy,
      'Designation': agreement.designation,
      'Agreement Type': agreement.agreementType,
      'Partner Type': agreement.partnerType,
      'Date Signed': formatDate(agreement.dateSigned),
      'Validity': `${agreement.validity} years`,
      'Date Expired': formatDate(agreement.dateExpired),
      'For Renewal': agreement.forRenewal ? 'Yes' : 'No',
      'Status': agreement.status,
      'Description': agreement.description,
      'Links': agreement.links
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 30 }, // Name
      { wch: 30 }, // Address
      { wch: 20 }, // Signed By
      { wch: 20 }, // Designation
      { wch: 15 }, // Agreement Type
      { wch: 15 }, // Partner Type
      { wch: 20 }, // Date Signed
      { wch: 12 }, // Validity
      { wch: 20 }, // Date Expired
      { wch: 12 }, // For Renewal
      { wch: 12 }, // Status
      { wch: 40 }, // Description
      { wch: 30 }  // Links
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agreements");

    // Generate file name with current date
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
    
    const fileName = `agreements_${date}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  return (
    <button className="excel-export-btn" onClick={exportToExcel}>
      <i className="fas fa-file-excel"></i>
      Export to Excel
    </button>
  );
};

export default ExcelExport; 