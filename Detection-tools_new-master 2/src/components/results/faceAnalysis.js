/** @format */
// src/components/results/faceAnalysis.js
import React from "react";
import { User, Plus, MoveDiagonal, CheckCircle } from "lucide-react";

function FaceAnalysis({ details }) {
  if (!details) return null;

  const face_detected = details.face_features.face_detected;
  const face_symmetry = details.face_features.face_symmetry;
  const face_size_ratio = details.face_features.face_size_ratio;

  // Safe calculation with fallback to 0
  const calculatePercent = (value) => {
    if (typeof value !== "number") return "0.0";
    return (value * 100).toFixed(1);
  };

  const symmetryPercent = calculatePercent(face_symmetry);
  const sizeRatioPercent = calculatePercent(face_size_ratio);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-pink-500 p-2 rounded-lg">
          <User className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Face Analysis</h3>
      </div>

      <div className="space-y-6">
        {/* Face Detected Row */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                face_detected ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span className="font-bold text-gray-600 text-sm uppercase">
              Face Detected
            </span>
          </div>
          <span
            className={`px-4 py-1 rounded-full text-sm font-bold ${
              face_detected
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {face_detected ? "Yes" : "No"}
          </span>
        </div>

        {/* Face Symmetry */}
        <div className="bg-purple-50/30 rounded-xl p-5 border border-[#d3c6e8]/60">
          <div className="flex items-start gap-4 mb-3">
            <div className="mt-1">
              <Plus className="w-6 h-6 text-[#914ffc]" />
            </div>

            <div className="flex-1">
              {/* Heading in black (strong contrast) */}
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Face Symmetry
              </div>

              {/* ← This is the ratio line you wanted in light purple */}
              <div className="text-3xl md:text-4xl font-bold text-[#914ffc] mb-4 tracking-tight">
                {symmetryPercent}%
              </div>

              {/* Soft purple progress bar */}
              <div className="h-2 bg-[#d3c6e8]/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#914ffc] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${symmetryPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Face Size Ratio */}
        <div className="bg-purple-50/30 rounded-xl p-5 border border-[#d3c6e8]/60">
          <div className="flex items-start gap-4 mb-3">
            <MoveDiagonal className="w-6 h-6 text-[#914ffc]" />{" "}
            {/* main accent for icon */}
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Face Size Ratio
              </div>
              <div className="text-3xl md:text-4xl font-bold text-[#914ffc] mb-4">
                {sizeRatioPercent}%
              </div>
              <div className="h-2 bg-[#d3c6e8]/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#914ffc] rounded-full"
                  style={{ width: `${sizeRatioPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="bg-purple-50 rounded-xl p-4 flex items-center gap-3">
          <div className="bg-purple-500 rounded-full p-1">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-800 text-sm">
              Comprehensive Analysis
            </div>
            <div className="text-xs text-gray-500">
              All facial metrics processed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FaceAnalysis;
