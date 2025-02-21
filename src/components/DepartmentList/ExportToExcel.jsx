import React from 'react';
import * as XLSX from 'xlsx';

const ExportToExcel = ({ data }) => {
  const exportToExcel = () => {
    // Prepare the data for export
    const exportData = data.map(item => ({
      'Company Name': item.companyName || '',
      'Status': item.moaStatus || '',
      'College': item.college || '',
      'Department': item.department || ''
    }));

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Departments');

    // Generate the Excel file
    const fileName = `department_list_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <button 
      className="dept-export-button" 
      onClick={exportToExcel}
      title="Export to Excel"
    >
      <i className="fas fa-file-excel"></i> Export to Excel
    </button>
  );
};

export default ExportToExcel; 