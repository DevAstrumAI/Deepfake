/** @format */

import React from "react";
import { Sparkles, CheckCircle, XCircle, AlertCircle } from "lucide-react";

function Explainability({ details, result }) {
  // Extract explainability/reasoning from different possible locations
  const reasoning =
    details?.openai_analysis?.reasoning ||
    details?.reasoning ||
    result?.explanation ||
    "No explanation available.";

  const prediction = result?.prediction || details?.prediction || "UNKNOWN";
  const confidence = result?.confidence || details?.ensemble_confidence || 0;
  const isFake = prediction === "FAKE" || prediction === 1;

  // Format confidence
  const formatConfidence = (conf) => {
    if (conf <= 1) {
      return Math.round(conf * 100);
    }
    return Math.round(conf);
  };

  const confPercent = formatConfidence(confidence);

  // Extract artifacts and confidence factors if available
  const artifacts = details?.openai_analysis?.artifacts_detected || [];
  const confidenceFactors = details?.openai_analysis?.confidence_factors || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">AI Explanation</h3>
      </div>

      {/* Prediction Summary */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {isFake ? (
                <XCircle className="w-6 h-6 text-red-500" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
              <div>
                <span className="text-sm text-gray-500 block">
                  Detection Result
                </span>
                <span
                  className={`text-lg font-bold ${
                    isFake ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {prediction === "FAKE" || prediction === 1
                    ? "DEEPFAKE DETECTED"
                    : "AUTHENTIC MEDIA"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500 block">Confidence</span>
              <span className="text-2xl font-bold text-purple-600">
                {confPercent}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFake
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-green-500 to-green-600"
              }`}
              style={{ width: `${confPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Explanation */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-purple-600" />
          <h4 className="font-semibold text-gray-800">
            Why this media was detected as{" "}
            {isFake ? (
              <span className="text-red-600">deepfake</span>
            ) : (
              <span className="text-green-600">authentic</span>
            )}
          </h4>
        </div>
        <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {reasoning}
          </p>
        </div>
      </div>

      {/* Artifacts Detected */}
      {artifacts && artifacts.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">
            Detected Artifacts
          </h4>
          <div className="space-y-2">
            {artifacts.map((artifact, index) => (
              <div
                key={index}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2"
              >
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-700">{artifact}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Factors */}
      {confidenceFactors && confidenceFactors.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">
            Key Factors Influencing Confidence
          </h4>
          <div className="space-y-2.5">
            {confidenceFactors.map((factor, index) => (
              <div
                key={index}
                className="
          bg-green-50/70 
          border border-green-200/80 
          rounded-lg 
          p-3.5 
          flex 
          items-start 
          gap-3
          shadow-sm
          hover:bg-green-50 
          transition-colors
        "
              >
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-800 leading-relaxed">
                  {factor}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Explainability;
