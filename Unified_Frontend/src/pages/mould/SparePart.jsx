import { getBackendBaseUrl } from "../../utils/apiConfig";
import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../partials/dashboardLayout/DashboardLayout";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  MdBuild,
  MdSearch,
  MdFileDownload,
  MdCategory,
  MdInventory2,
  MdWarning,
  MdVerified,
  MdLocationOn,
} from "react-icons/md";

const BASE = getBackendBaseUrl();

export default function SparePart() {
  const [spareParts, setSpareParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [10, 25, 50, 100];

  // 1. Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${BASE}/MouldMaintenanceHistorySparePart/SparePartCategoryName`
        );
        if (res.data?.success && Array.isArray(res.data.data)) {
          const uniqueCats = [
            ...new Set(
              res.data.data
                .map((c) => c.SparePartCategory)
                .filter(Boolean)
            ),
          ];
          setCategories(uniqueCats);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch spare parts inventory
  useEffect(() => {
    const fetchSpareParts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE}/MouldMaintenanceHistorySparePart/SparePartName`
        );
        if (res.data?.success && Array.isArray(res.data.data)) {
          setSpareParts(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching spare parts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpareParts();
  }, []);

  // Filtered parts
  const filteredParts = useMemo(() => {
    return spareParts.filter((item) => {
      const matchCat =
        selectedCategory === "All" ||
        item.SparePartCategoryID === selectedCategory;

      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.SparePartName && item.SparePartName.toLowerCase().includes(q)) ||
        (item.SparePartID && String(item.SparePartID).includes(q)) ||
        (item.SparePartMake && item.SparePartMake.toLowerCase().includes(q)) ||
        (item.MouldName && item.MouldName.toLowerCase().includes(q)) ||
        (item.SparePartLoc && item.SparePartLoc.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [spareParts, selectedCategory, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredParts.length / pageSize) || 1;
  const paginatedParts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredParts.slice(start, start + pageSize);
  }, [filteredParts, currentPage, pageSize]);

  // KPI calculations
  const totalCount = spareParts.length;
  const commonCount = spareParts.filter(
    (p) => p.SparePartCategoryID === "Common"
  ).length;
  const consumableCount = spareParts.filter(
    (p) => p.SparePartCategoryID === "Consumable"
  ).length;
  const reorderAlertCount = spareParts.filter(
    (p) =>
      p.ReorderLevel &&
      p.MinQuantity &&
      Number(p.MinQuantity) <= Number(p.ReorderLevel)
  ).length;

  // Chart data: Distribution by Category
  const categoryChartData = useMemo(() => {
    const counts = {};
    spareParts.forEach((p) => {
      const cat = p.SparePartCategoryID || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.keys(counts).map((name) => ({
      category: name,
      count: counts[name],
    }));
  }, [spareParts]);

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredParts.map((p) => ({
      "Spare Part ID": p.SparePartID,
      "Spare Part Name": p.SparePartName,
      Description: p.SparePartDescription || "",
      Category: p.SparePartCategoryID || "",
      "Mould Name": p.MouldName || "",
      "Storage Location": p.SparePartLoc || "",
      "Min Quantity": p.MinQuantity || 0,
      "Max Quantity": p.MaxQuantity || 0,
      "Reorder Level": p.ReorderLevel || 0,
      Make: p.SparePartMake || "",
      "Lead Time (Days)": p.LeadTime || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SpareParts_Inventory");
    XLSX.writeFile(
      workbook,
      `SpareParts_Inventory_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Header & Filter Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white flex items-center justify-center shadow-xs shrink-0">
                <MdInventory2 size={22} />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-800 tracking-tight leading-tight">
                  Spare Parts Inventory
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={exportToExcel}
                disabled={filteredParts.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-xs transition-colors"
              >
                <MdFileDownload size={15} />
                <span>Export Master Inventory ({filteredParts.length})</span>
              </button>
            </div>
          </div>

          {/* KPI Mini-Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-200 ">
            <div className="bg-gray-50  border border-gray-200  p-3 rounded-xl flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-sky-50 text-[#0284c7]">
                <MdInventory2 size={20} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  Total Spares Tracked
                </span>
                <span className="text-lg font-black text-gray-900  font-mono">
                  {totalCount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-gray-50  border border-gray-200  p-3 rounded-xl flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                <MdCategory size={20} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  Common Spares
                </span>
                <span className="text-lg font-black text-cyan-400 font-mono">
                  {commonCount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-gray-50  border border-gray-200  p-3 rounded-xl flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                <MdVerified size={20} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  Consumable Spares
                </span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {consumableCount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-gray-50  border border-gray-200  p-3 rounded-xl flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-400">
                <MdWarning size={20} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  Reorder Threshold
                </span>
                <span className="text-lg font-black text-amber-400 font-mono">
                  {reorderAlertCount} Items
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white  border border-gray-200  rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <MdSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by part name, ID, make, mould..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-gray-50  border border-gray-300  rounded-xl text-xs text-gray-900  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === "All"
                  ? "bg-[#0284c7] text-white shadow-xs"
                  : "bg-gray-100  text-gray-600  hover:bg-gray-200 "
              }`}
            >
              All Categories ({totalCount})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#0284c7] text-white shadow-xs"
                    : "bg-gray-100  text-gray-600  hover:bg-gray-200 "
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Master Inventory Table */}
        <div className="bg-white  border border-gray-200  rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-gray-900 tracking-wide">
              Spare Parts Registry ({filteredParts.length} matching)
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-3">Part ID</th>
                  <th className="py-3 px-3">Spare Part Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Target Mould</th>
                  <th className="py-3 px-3">Storage Location</th>
                  <th className="py-3 px-3 text-center">Min Qty</th>
                  <th className="py-3 px-3 text-center">Max Qty</th>
                  <th className="py-3 px-3 text-center">Reorder Lvl</th>
                  <th className="py-3 px-3">Make / Supplier</th>
                  <th className="py-3 px-3">Lead Time</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-gray-400 text-xs">
                      Loading spare parts catalog...
                    </td>
                  </tr>
                ) : paginatedParts.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-gray-400 text-xs">
                      No spare parts match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedParts.map((item, idx) => {
                    const isReorder =
                      item.ReorderLevel &&
                      item.MinQuantity &&
                      Number(item.MinQuantity) <= Number(item.ReorderLevel);

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#0284c7]">
                          #{item.SparePartID}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-gray-900">
                          {item.SparePartName}
                          {item.SparePartSize && (
                            <span className="block text-[10px] text-gray-400 font-normal">
                              Size: {item.SparePartSize}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                              item.SparePartCategoryID === "Common"
                                ? "bg-cyan-500/15 text-cyan-400"
                                : item.SparePartCategoryID === "Consumable"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-gray-500/15 text-gray-400"
                            }`}
                          >
                            {item.SparePartCategoryID || "General"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 font-medium">
                          {item.MouldName || "--"}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">
                          {item.SparePartLoc ? (
                            <span className="inline-flex items-center gap-1">
                              <MdLocationOn size={12} className="text-rose-400" />
                              {item.SparePartLoc}
                            </span>
                          ) : (
                            "--"
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-gray-800">
                          {item.MinQuantity ?? "--"}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-gray-800">
                          {item.MaxQuantity ?? "--"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`font-mono font-bold ${
                              isReorder ? "text-amber-500 font-bold" : "text-gray-400"
                            }`}
                          >
                            {item.ReorderLevel ?? "--"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 truncate max-w-[140px]">
                          {item.SparePartMake || "--"}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">
                          {item.LeadTime ? `${item.LeadTime} days` : "--"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-gray-500">
                Showing {filteredParts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredParts.length)} of{" "}
                <span className="font-bold text-gray-800">{filteredParts.length}</span> spares
              </span>

              {/* Rows per page selector buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 font-medium">Show:</span>
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  {pageSizeOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setPageSize(opt);
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        pageSize === opt
                          ? "bg-white text-[#0284c7] shadow-xs font-bold"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-700 disabled:opacity-40 hover:bg-gray-100 font-medium shadow-2xs"
                title="First Page"
              >
                First
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-700 disabled:opacity-40 hover:bg-gray-100 font-medium shadow-2xs"
              >
                Previous
              </button>
              <span className="font-mono text-gray-700 font-semibold px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || filteredParts.length === 0}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-700 disabled:opacity-40 hover:bg-gray-100 font-medium shadow-2xs"
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || filteredParts.length === 0}
                className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-700 disabled:opacity-40 hover:bg-gray-100 font-medium shadow-2xs"
                title="Last Page"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
