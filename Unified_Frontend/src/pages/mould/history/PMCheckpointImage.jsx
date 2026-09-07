import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../partials/dashboardLayout/DashboardLayout";
import axios from "axios";
import Select from "react-select";
import {
  MdPhotoLibrary,
  MdSearch,
  MdTune,
  MdArrowBack,
  MdClose,
  MdFileDownload,
} from "react-icons/md";

const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");

export default function PMCheckpointImages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mould List for Searcher
  const [mouldList, setMouldList] = useState([]);
  const [selectedMouldOption, setSelectedMouldOption] = useState(null);

  // Available Instances for selected mould
  const [instanceList, setInstanceList] = useState([]);
  const [selectedInstanceOption, setSelectedInstanceOption] = useState(null);
  const [loadingInstances, setLoadingInstances] = useState(false);

  // Active Parameters
  const [activeMouldID, setActiveMouldID] = useState(searchParams.get("mouldID") || "");
  const [activeMouldName, setActiveMouldName] = useState(
    searchParams.get("mouldName") || searchParams.get("mouldname") || ""
  );
  const [activeInstance, setActiveInstance] = useState(searchParams.get("instance") || "");

  // Image Gallery State
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const guessMimeFromBase64 = (base64) => {
    const s = (base64 || "").replace(/\s/g, "");
    if (s.startsWith("/9j/")) return "image/jpeg";
    if (s.startsWith("iVBORw0KGgo")) return "image/png";
    if (s.startsWith("R0lGOD")) return "image/gif";
    if (s.startsWith("UklGR")) return "image/webp";
    if (s.startsWith("Qk")) return "image/bmp";
    return "image/jpeg";
  };

  const toDataUrl = (imageValue) => {
    if (!imageValue) return null;
    if (typeof imageValue === "string" && imageValue.startsWith("data:image/")) {
      return imageValue;
    }
    if (typeof imageValue === "string") {
      const trimmed = imageValue.trim();
      const clean = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed.replace(/\s/g, "");
      if (!clean) return null;
      const mime = guessMimeFromBase64(clean);
      return `data:${mime};base64,${clean}`;
    }
    return null;
  };

  // 1. Fetch all available moulds on mount
  useEffect(() => {
    const fetchMoulds = async () => {
      try {
        const res = await axios.get(`${BASE}/MouldSummary/MouldName`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          const options = res.data.data.map((m) => ({
            value: m.MouldID,
            label: `${m.MouldName} (${m.MouldID})`,
            mouldID: m.MouldID,
            mouldName: m.MouldName,
          }));
          setMouldList(options);

          // If query param exists, auto-select it
          const qName = searchParams.get("mouldName") || searchParams.get("mouldname");
          const qID = searchParams.get("mouldID");
          if (qName || qID) {
            const found = options.find((o) => (qID && o.mouldID === qID) || (qName && o.mouldName === qName));
            if (found) {
              setSelectedMouldOption(found);
              setActiveMouldID(found.mouldID);
              setActiveMouldName(found.mouldName);
            }
          }
        }
      } catch (err) {
        console.error("Error loading mould list:", err);
      }
    };
    fetchMoulds();
  }, [searchParams]);

  // 2. When Mould is selected, fetch instances
  useEffect(() => {
    if (!activeMouldID && !activeMouldName) return;

    const fetchInstances = async () => {
      setLoadingInstances(true);
      try {
        const res = await axios.get(`${BASE}/MouldMaintenanceHistoryPM/PmHistoryDetailTable`, {
          params: { mouldID: activeMouldID },
        });

        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const instances = res.data.data.map((item) => ({
            value: item.Instance,
            label: `Instance ${item.Instance} (Life: ${item.AtMouldLife || "-"})`,
            instance: item.Instance,
            mouldID: item.MouldID,
            mouldName: item.MouldName,
          }));

          setInstanceList(instances);

          const qInstance = searchParams.get("instance");
          const target = qInstance
            ? instances.find((i) => String(i.instance) === String(qInstance)) || instances[0]
            : instances[0];

          if (target) {
            setSelectedInstanceOption(target);
            setActiveInstance(target.instance);
          }
        } else {
          setInstanceList([]);
          setSelectedInstanceOption(null);
        }
      } catch (err) {
        console.error("Error fetching instances:", err);
        setInstanceList([]);
      } finally {
        setLoadingInstances(false);
      }
    };

    fetchInstances();
  }, [activeMouldID, activeMouldName]);

  // 3. Fetch images when mould & instance are active
  useEffect(() => {
    if (!activeMouldName || !activeInstance) return;

    setErrorMsg("");
    setLoading(true);

    axios
      .get(`${BASE}/MouldMaintenanceHistoryPM/PMCheckpointDetails/get-checkpoint-images`, {
        params: { mouldName: activeMouldName, instance: activeInstance, _: Date.now() },
        
      })
      .then((res) => {
        if (res.data?.status === 200 || res.data?.success) {
          setImages(Array.isArray(res.data.data) ? res.data.data : []);
        } else {
          setErrorMsg("");
          setImages([]);
        }
      })
      .catch((err) => {
        console.warn("Checkpoint image fetch notice:", err?.message);
        setErrorMsg("");
        setImages([]);
      })
      .finally(() => setLoading(false));
  }, [activeMouldName, activeInstance]);

  const handleMouldSelect = (option) => {
    setSelectedMouldOption(option);
    if (option) {
      setActiveMouldID(option.mouldID);
      setActiveMouldName(option.mouldName);
    } else {
      setActiveMouldID("");
      setActiveMouldName("");
      setInstanceList([]);
      setImages([]);
    }
  };

  const handleInstanceSelect = (option) => {
    setSelectedInstanceOption(option);
    if (option) {
      setActiveInstance(option.instance);
    }
  };

    const selectDarkStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#ffffff',
      borderColor: state.isFocused ? '#0284c7' : '#cbd5e1',
      boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
      '&:hover': { borderColor: '#94a3b8' },
      borderRadius: '0.5rem',
      fontSize: '12px',
    }),
    input: (base) => ({
      ...base,
      color: '#0f172a',
      fontWeight: '500',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#0f172a',
      fontWeight: '600',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#94a3b8',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      borderRadius: '0.5rem',
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#0284c7'
        : state.isFocused
        ? '#f1f5f9'
        : '#ffffff',
      color: state.isSelected ? '#ffffff' : '#1e293b',
      fontSize: '12px',
      fontWeight: state.isSelected ? '600' : '500',
      cursor: 'pointer',
    }),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Top Control Bar */}
        <div className="bg-white  border border-slate-200  rounded-xl p-5 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800  flex items-center gap-2">
                <MdPhotoLibrary className="text-cyan-400" size={24} />
                <span>PM Checkpoint Inspection Images</span>
              </h1>
              
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/PMCheckPointReport?mouldName=${encodeURIComponent(activeMouldName)}&instance=${activeInstance}&mouldID=${activeMouldID}`
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100  hover:bg-gray-200  text-slate-700  transition-colors"
              >
                <MdArrowBack size={15} />
                <span>View Report</span>
              </button>
            </div>
          </div>

          {/* MOULD SEARCHER & INSTANCE SELECTOR CONTROLS */}
          <div className="mt-5 pt-4 border-t border-slate-200  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
            {/* Searchable Mould Dropdown */}
            <div>
              <label className="text-xs font-semibold text-slate-700  mb-1.5 block flex items-center gap-1.5">
                <MdSearch className="text-cyan-400" size={16} />
                <span>Select / Search Mould ({mouldList.length} Moulds)</span>
              </label>
              <Select
                options={mouldList}
                value={selectedMouldOption}
                onChange={handleMouldSelect}
                isSearchable
                isClearable
                placeholder="Search by Mould Name or ID..."
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                styles={selectDarkStyles}
              />
            </div>

            {/* PM Instance Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700  mb-1.5 block flex items-center gap-1.5">
                <MdTune className="text-emerald-400" size={16} />
                <span>Select PM Instance</span>
              </label>
              <Select
                options={instanceList}
                value={instanceList.find((i) => String(i.instance) === String(activeInstance)) || selectedInstanceOption || null}
                onChange={handleInstanceSelect}
                isDisabled={!activeMouldName || loadingInstances}
                placeholder={
                  loadingInstances
                    ? "Loading instances..."
                    : instanceList.length === 0
                    ? "No instances available"
                    : "Select Instance..."
                }
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                styles={selectDarkStyles}
              />
            </div>

            {/* Active Status Pill */}
            <div className="flex flex-col justify-end">
              <span className="text-[11px] text-slate-400 block mb-1">Target Checkpoint Run</span>
              <div className="bg-gray-100  border border-slate-200  px-3.5 py-2 rounded-lg text-xs flex items-center justify-between">
                <span className="truncate font-medium text-slate-800 ">
                  {activeMouldName || "No mould selected"}
                </span>
                <span className="font-mono font-bold text-cyan-400 shrink-0 ml-2">
                  {activeInstance ? `Instance #${activeInstance}` : "--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* IMAGE GALLERY GRID */}
        <div className="bg-white  border border-slate-200  rounded-xl p-6 shadow-2xs min-h-[360px]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-800  tracking-wide">
              Attached Inspection Photographs ({images.length} photos)
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs gap-2">
              <span className="animate-spin text-cyan-400 text-lg">⏳</span>
              <span>Loading checkpoint images...</span>
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center">
              {errorMsg}
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((img, index) => {
                const dataUrl = toDataUrl(img?.image);

                return (
                  <div
                    key={index}
                    onClick={() => setPreview(img)}
                    className="group bg-slate-50  border border-slate-200  rounded-xl p-2.5 cursor-pointer transition-all hover:border-cyan-500 hover:shadow-lg flex flex-col items-center"
                  >
                    <div className="w-full h-36 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center relative">
                      {dataUrl ? (
                        <img
                          src={dataUrl}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          alt={`CP ${img.checkpoint || index + 1}`}
                        />
                      ) : (
                        <span className="text-slate-500 text-xs">No image data</span>
                      )}
                      <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-colors" />
                    </div>

                    <span className="text-xs font-bold text-slate-800  mt-2 font-mono">
                      Checkpoint #{img.checkpoint || index + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-full">
                      {img.mouldName || activeMouldName}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs gap-1">
              <MdPhotoLibrary size={36} className="text-slate-600 mb-2" />
              <span className="font-semibold text-slate-700 font-bold">No photographic records found for this instance.</span>
              <span className="text-[11px] text-slate-500">
                {activeMouldName
                  ? "This instance did not log any camera checkpoint uploads."
                  : "Please select a Mould and PM Instance from the searcher above to inspect images."}
              </span>
            </div>
          )}
        </div>

        {/* FULLSCREEN LIGHTBOX MODAL */}
        {preview && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setPreview(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-[#181b21] border border-[#333a48] rounded-xl p-4 shadow-2xl flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[#262a34]">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Checkpoint Inspection Photo #{preview.checkpoint}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {preview.mouldName || activeMouldName} | Instance {preview.instance || activeInstance}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <MdClose size={20} />
                </button>
              </div>

              <div className="max-h-[75vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
                <img
                  src={toDataUrl(preview?.image) || ""}
                  className="max-h-[70vh] w-auto object-contain rounded-lg"
                  alt="inspection preview"
                />
              </div>

              <div className="w-full pt-3 mt-3 border-t border-[#262a34] flex justify-end">
                <a
                  href={toDataUrl(preview?.image) || "#"}
                  download={`Checkpoint_${preview.checkpoint}_${activeMouldName}.jpg`}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <MdFileDownload size={16} />
                  <span>Download Image</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
