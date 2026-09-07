// src/partials/BreakdownByLossCategory.jsx
import React from "react";
import { useSelector } from "react-redux";
import HorizontalBarChart from "../partials/charts/HorizontalBarChart";

export default function BreakdownByLossCategory() {
  const fourMLossData = useSelector((state) => state.machine.fourMLossData) || [];

  // Support both shapes:
  // - flat array: [ { LossID/4MLossID, LossName/4MLossName, MinutesLost, Occurrences }, ... ]
  // - object: { FourM: [...], TPM: [...] }
  const isFlat = Array.isArray(fourMLossData);

  const fourMLosses = isFlat ? fourMLossData : (fourMLossData.FourM || []);
  const tpmLosses = isFlat ? [] : (fourMLossData.TPM || []);

  // Normalize accessors for 4M items
  const getName = (item) => item["4MLossName"] ?? item.LossName ?? item.name ?? "Unknown";
  const getMinutes = (item) => item.MinutesLost ?? item.Duration ?? item.DurationMinutes ?? 0;
  const getOccurrences = (item) => item.Occurrences ?? item.Occurrence ?? item.Count ?? 0;

  const labels = fourMLosses.map(getName);
  const durationValues = fourMLosses.map(getMinutes);
  const occurrenceValues = fourMLosses.map(getOccurrences);

  // TPM: normalize to LossName / MinutesLost / Occurrences
  const tpmLabels = tpmLosses.map((l) => l.LossName ?? l["4MLossName"] ?? "Unknown");
  const tpmDurationValues = tpmLosses.map((l) => l.MinutesLost ?? l.Duration ?? 0);
  const tpmOccurrenceValues = tpmLosses.map((l) => l.Occurrences ?? l.Occurrence ?? 0);

  return (
    <div>
      <h2 className="bg-[#3c51d2] p-3 rounded-lg text-white text-center shadow-sm font-bold text-lg mb-4">
        Breakdown by Loss Category
      </h2>

      <h2 className="bg-white p-3 rounded-lg text-[#3c51d2] text-center shadow-sm font-bold text-lg mb-4">
        4M Losses
      </h2>

      {labels.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 mt-3">
          <HorizontalBarChart title="Duration (mins)" labels={labels} values={durationValues} />
          <HorizontalBarChart title="Occurrence" labels={labels} values={occurrenceValues} />
        </div>
      ) : (
        <p className="text-center text-gray-500">No 4M Loss Data Available</p>
      )}

      {/* TPM Section */}
      <h2 className="bg-white mt-6 p-3 rounded-lg text-[#3c51d2] text-center shadow-sm font-bold text-lg mb-4">
        TPM Losses
      </h2>

      {tpmLabels.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 mt-3">
          <HorizontalBarChart title="Duration (mins)" labels={tpmLabels} values={tpmDurationValues} />
          <HorizontalBarChart title="Occurrence" labels={tpmLabels} values={tpmOccurrenceValues} />
        </div>
      ) : (
        <p className="text-center text-gray-500">No TPM Loss Data Available</p>
      )}
    </div>
  );
}
