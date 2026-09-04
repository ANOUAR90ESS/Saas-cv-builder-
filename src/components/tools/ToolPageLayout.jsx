import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { getToolById } from "../../tools/toolsData";
import { logToolUsage } from "../../lib/careerStorage";

export default function ToolPageLayout({ tool, children }) {
  useEffect(() => {
    if (tool?.id) {
      logToolUsage(tool.id, tool.name);
      document.title = tool.metaTitle || `${tool.name} | DexaCV`;
    }
  }, [tool]);

  if (!tool) return <div className="p-8 text-center text-slate-600">Tool not found</div>;

  const relatedTools = (tool.relatedToolIds || [])
    .map((id) => getToolById(id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 overflow-x-auto">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link to="/tools" className="hover:text-indigo-600 transition-colors">Career & File Tools</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-semibold truncate">{tool.name}</span>
          </nav>
          <div className="hidden sm:flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
            <span>Runs locally in browser</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          {tool.badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70 mb-3.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tool.badge}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            {tool.h1}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {tool.shortDesc}
          </p>
        </div>

        {/* The Interactive Tool Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden mb-16 p-4 sm:p-8">
          {children}
        </div>

        {/* How It Works Section */}
        {tool.howItWorks && tool.howItWorks.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                How It Works
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Fast, reliable execution in three simple steps.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tool.howItWorks.map((step) => (
                <div 
                  key={step.step}
                  className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs relative flex flex-col"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Assurance Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 mb-16 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Zero Cloud Storage • Local Privacy Guarantee
              </h3>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {tool.privacyNote || "Your files and documents are processed locally in your browser memory. We never sell your personal information, train AI models on your files, or store your documents on our servers."}
              </p>
            </div>
          </div>
          <Link
            to="/builder"
            className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm"
          >
            <span>Create New CV</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Frequently Asked Questions */}
        {tool.faq && tool.faq.length > 0 && (
          <div className="mb-16 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                <HelpCircle className="w-4 h-4" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Common Questions about {tool.name}
              </h2>
            </div>
            <div className="space-y-4">
              {tool.faq.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs"
                >
                  <h3 className="text-base font-semibold text-slate-900 mb-2 flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">Q:</span>
                    <span>{item.q}</span>
                  </h3>
                  <p className="text-sm text-slate-600 pl-5 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Related Career & Document Tools
                </h2>
                <p className="text-xs text-slate-500">Complementary utilities to prepare your application</p>
              </div>
              <Link 
                to="/tools" 
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <span>View All 20+ Tools</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedTools.map((rel) => (
                <Link
                  key={rel.id}
                  to={rel.path}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-medium text-indigo-600 mb-1 block">
                      {rel.category.replace("-", " ").toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {rel.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {rel.shortDesc}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Use tool</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
