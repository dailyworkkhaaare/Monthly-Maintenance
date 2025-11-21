import React, { useState, useEffect } from 'react';
import { Plus, Download, Trash2, FileSpreadsheet, DollarSign } from 'lucide-react';

const MaintenanceMaker = () => {
  // State for the list of items
  const [items, setItems] = useState([]);

  // State for the form inputs
  const [newItem, setNewItem] = useState({
    item: '',
    month: '',
    amount: '',
    deadline: '',
    status: 'Pending'
  });

  // State for the editable report title
  const [reportTitle, setReportTitle] = useState('OFFICE MAINTENANCE SPENDING JULY 2025');

  // Calculate Total Amount from all items
  const totalAmount = items.reduce((sum, curr) => sum + (parseFloat(curr.amount) || 0), 0);

  // Generate Month Options (Next month + Last 3 months)
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    // i = -1 : Next Month (Future)
    // i = 0  : Current Month
    // i = 1,2,3 : Past 3 Months
    for (let i = -1; i <= 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthShort = d.toLocaleString('en-US', { month: 'short' });
      const yearShort = d.getFullYear().toString().slice(-2);
      options.push(`${monthShort}-${yearShort}`);
    }
    return options;
  };

  const monthOptions = getMonthOptions();

  // Handle Input Change for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add New Item to the list
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.item || !newItem.amount) return;

    setItems(prev => [
      ...prev,
      {
        id: Date.now(), // simple unique id
        ...newItem,
        amount: parseFloat(newItem.amount)
      }
    ]);

    // Reset form inputs for the next entry
    setNewItem({
      item: '',
      month: newItem.month, // keep month selected for convenience
      amount: '',
      deadline: '',
      status: 'Pending'
    });
  };

  // Delete Item by ID
  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Utility to Format Currency in Indian Rupees (INR)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0 // Show whole numbers
    }).format(amount);
  };

  // Utility to Format Date for Display (DD Month YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Export data to a well-formatted Excel (XLS) file using HTML table
  const exportToExcel = () => {
    const tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Maintenance Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          /* Basic styles for Excel output */
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #E5E7EB; color: #000; border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; }
          td { border: 1px solid #000; padding: 8px; text-align: center; vertical-align: middle; }
          .text-left { text-align: left; }
          .total-row { background-color: #E5E7EB; font-weight: bold; font-size: 1.1em; }
          .title-row { font-size: 18px; font-weight: bold; text-align: center; border: none; padding: 20px; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="6" class="title-row" style="border: none;">${reportTitle.toUpperCase()}</td>
          </tr>
          <tr>
            <th style="width: 60px;">Sr.No</th>
            <th style="width: 300px;">Item</th>
            <th style="width: 100px;">Month</th>
            <th style="width: 120px;">Amount</th>
            <th style="width: 150px;">Payment deadline</th>
            <th style="width: 100px;">Status</th>
          </tr>
          ${items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td class="text-left">${item.item}</td>
              <td>${item.month}</td>
              <td>${formatCurrency(item.amount)}</td>
              <td>${formatDate(item.deadline)}</td>
              <td>${item.status}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3" style="text-align: center;">TOTAL</td>
            <td>${formatCurrency(totalAmount)}</td>
            <td colspan="2"></td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Create a Blob with the BOM for proper UTF-8 handling in Excel
    const blob = new Blob(['\uFEFF', tableHTML], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Maintenance_Report.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Component Render
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header & Download Button */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileSpreadsheet size={32} className="text-blue-600"/>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">Monthly Maintenance Maker</h1>
              <p className="text-slate-500 text-sm">Create, manage, and export monthly expense reports</p>
            </div>
          </div>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.02] shadow-lg shadow-green-500/50"
          >
            <Download size={20} />
            Download Excel Report
          </button>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-slate-800 text-white p-4 flex items-center gap-2">
            <Plus size={20} />
            <h2 className="font-semibold">Add New Expense Entry</h2>
          </div>
          <form onSubmit={handleAddItem} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Item Name */}
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><span className="text-blue-500"><DollarSign size={14} /></span> Item Name</label>
              <input
                type="text"
                name="item"
                value={newItem.item}
                onChange={handleInputChange}
                placeholder="e.g., HVAC Filter Change"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                required
              />
            </div>

            {/* Month */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><span className="text-blue-500"><Calendar size={14} /></span> Bill Month</label>
              <select
                name="month"
                value={newItem.month}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-colors text-slate-700"
                required
              >
                <option value="">Select</option>
                {monthOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><span className="text-blue-500"><DollarSign size={14} /></span> Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                <input
                  type="number"
                  name="amount"
                  value={newItem.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full pl-8 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><span className="text-blue-500"><Calendar size={14} /></span> Deadline</label>
              <input
                type="date"
                name="deadline"
                value={newItem.deadline}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors text-slate-600"
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><span className="text-blue-500"><Tag size={14} /></span> Status</label>
              <select
                name="status"
                value={newItem.status}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-colors text-slate-700"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-12 flex justify-end mt-2">
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-transform duration-150 ease-in-out hover:scale-[1.02] shadow-lg shadow-blue-500/50"
              >
                <Plus size={18} /> Add to List
              </button>
            </div>
          </form>
        </div>

        {/* Report Preview */}
        <div className="bg-white shadow-xl border border-slate-300 overflow-hidden rounded-xl">
          
          {/* Editable Title */}
          <div className="p-4 md:p-6 text-center border-b border-slate-300 bg-white">
            <input 
              type="text" 
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="text-xl md:text-2xl font-extrabold text-center w-full uppercase tracking-wider focus:bg-slate-50 outline-none border-b border-transparent focus:border-blue-400 placeholder-slate-300 transition-colors"
              placeholder="ENTER REPORT TITLE HERE..."
            />
          </div>

          {/* The Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-slate-700 uppercase text-sm">
                  <th className="border-x border-slate-300 px-4 py-3 font-bold w-16 text-center">Sr.No</th>
                  <th className="border-x border-slate-300 px-4 py-3 font-bold text-left">Item</th>
                  <th className="border-x border-slate-300 px-4 py-3 font-bold text-center w-32">Month</th>
                  <th className="border-x border-slate-300 px-4 py-3 font-bold text-center w-32">Amount</th>
                  <th className="border-x border-slate-300 px-4 py-3 font-bold text-center w-48">Payment deadline</th>
                  <th className="border-x border-slate-300 px-4 py-3 font-bold text-center w-32">Status</th>
                  <th className="border-x border-slate-300 px-2 py-3 font-bold w-12 bg-white border-none print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="group border-b border-slate-200 hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 text-center font-medium">{index + 1}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{item.item}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{item.month}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800 tracking-wide">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {formatDate(item.deadline)}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      <span className={`p-1 rounded-full text-xs ${
                        item.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                        item.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center print:hidden border-none">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove Entry"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {/* Empty State if no items */}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 italic">
                      No entries yet. Add an item above to start creating your report.
                    </td>
                  </tr>
                )}
              </tbody>
              
              {/* Total Row */}
              <tfoot className="bg-gray-200 font-extrabold text-slate-900 border-t-2 border-slate-800">
                <tr>
                  <td colSpan="3" className="px-4 py-4 text-center uppercase tracking-wider text-xl">
                    TOTAL EXPENSES
                  </td>
                  <td className="px-4 py-4 text-center text-xl">
                    {formatCurrency(totalAmount)}
                  </td>
                  <td className="bg-gray-200"></td>
                  <td className="bg-gray-200"></td>
                  <td className="bg-white border-none"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="text-center text-slate-400 text-sm italic">
          Tip: You can change the Report Title by clicking and editing the large text above the table.
        </div>

      </div>
    </div>
  );
};

export default MaintenanceMaker;