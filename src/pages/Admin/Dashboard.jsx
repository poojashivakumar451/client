import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../api';
import { 
  Users, CheckCircle, AlertOctagon, Download, 
  BarChart3, Search, Filter, FileSpreadsheet, FileText 
} from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data);
    } catch (err) {
      toast.error("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, "Assessment_Results.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("TechMasters Assessment Results", 14, 15);
    const tableColumn = ["Email", "Score", "Percentage", "Status", "Date"];
    const tableRows = results.map(r => [
      r.studentEmail, 
      r.score, 
      r.percentage + "%", 
      r.status, 
      new Date(r.timestamp?.seconds * 1000).toLocaleDateString()
    ]);
    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save("Assessment_Results.pdf");
  };

  const stats = {
    total: results.length,
    passed: results.filter(r => r.percentage >= 60).length,
    violations: results.filter(r => r.status === 'terminated').length,
    average: Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / (results.length || 1))
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 p-4 sm:p-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Admin Command Center</h1>
            <p className="text-xs sm:text-sm text-slate-500">TechMasters Innovations Private Limited</p>
          </div>
          <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
            <button onClick={exportExcel} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-green-700 transition-all">
              <FileSpreadsheet className="w-4 h-4 shrink-0" /> Export Excel
            </button>
            <button onClick={exportPDF} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-red-700 transition-all">
              <FileText className="w-4 h-4 shrink-0" /> Export PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Total Candidates</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Qualified</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.passed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertOctagon className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Violations</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.violations}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 text-accent rounded-xl"><BarChart3 className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Avg. Score</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.average}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search by student email..." 
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 text-slate-500 font-medium px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm">
              <Filter className="w-4 h-4" /> Sort & Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase">Student Email</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase">Marks</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase">Percentage</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.filter(r => r.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())).map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="font-semibold text-slate-700 text-sm sm:text-base">{result.studentEmail}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 font-mono text-xs sm:text-sm">{result.score}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full w-24">
                          <div 
                            className={`h-full rounded-full ${result.percentage >= 60 ? 'bg-green-500' : 'bg-amber-500'}`} 
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-700">{result.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className={`text-[10px] uppercase font-black px-2 py-1 rounded ${
                        result.status === 'passed' ? 'bg-green-100 text-green-700' :
                        result.status === 'terminated' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-500">
                      {new Date(result.timestamp?.seconds * 1000).toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <button className="text-secondary hover:underline font-bold text-xs uppercase">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
