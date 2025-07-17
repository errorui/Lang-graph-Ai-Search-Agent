
import React from 'react';
import { Send, Search, AlertCircle, CheckCircle } from 'lucide-react';
const PremiumTypingAnimation = () => {
  return (
    <div className="flex items-center space-x-1">
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDuration: "1.4s", animationDelay: "0ms" }}></div>
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDuration: "1.4s", animationDelay: "200ms" }}></div>
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDuration: "1.4s", animationDelay: "400ms" }}></div>
    </div>
  );
};

// Search Stages Component
const SearchStages = ({ searchInfo }:{searchInfo:any}) => {
  if (!searchInfo || !searchInfo.stages || searchInfo.stages.length === 0) return null;

  const getStageIcon = (stage:string) => {
    switch (stage) {
      case 'searching':
        return <Search className="w-3 h-3 text-emerald-600" />;
      case 'reading':
        return <CheckCircle className="w-3 h-3 text-emerald-600" />;
      case 'writing':
        return <CheckCircle className="w-3 h-3 text-emerald-600" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>;
    }
  };

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
      <div className="flex flex-col space-y-3 text-sm" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
        
        {/* Searching Stage */}
        {searchInfo.stages.includes('searching') && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
              {getStageIcon('searching')}
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-700 mb-2">Searching the web</div>
              {searchInfo.query && (
                <div className="inline-flex items-center bg-white px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600">
                  <Search className="w-3 h-3 mr-1.5" />
                  {searchInfo.query}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reading Stage */}
        {searchInfo.stages.includes('reading') && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
              {getStageIcon('reading')}
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-700 mb-2">Reading sources</div>
              {searchInfo.urls && searchInfo.urls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(searchInfo.urls) ? (
                    searchInfo.urls.slice(0, 3).map((url:string, index:number) => (
                      <div key={index} className="bg-white text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 max-w-[200px] truncate">
                        {typeof url === 'string' ? url.replace(/^https?:\/\//, '') : 'Source'}
                      </div>
                    ))
                  ) : (
                    <div className="bg-white text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600">
                      Source found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Writing Stage */}
        {searchInfo.stages.includes('writing') && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
              {getStageIcon('writing')}
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-700">Generating response</div>
            </div>
          </div>
        )}

        {/* Error Stage */}
        {searchInfo.stages.includes('error') && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              {getStageIcon('error')}
            </div>
            <div className="flex-1">
              <div className="font-medium text-red-700">Search error</div>
              <div className="text-xs text-red-600 mt-1">
                {searchInfo.error || "An error occurred during search."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Message Area Component
const MessageArea = ({ messages }:{
    messages:any
}) => {
  return (
    <div className="flex-grow overflow-y-auto bg-gradient-to-b from-slate-50 to-white" style={{ minHeight: 0 }}>
      <div className="max-w-full mx-auto p-6 space-y-6">
        {messages.map((message:any) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className="flex flex-col max-w-2xl w-full">
              {/* Search Status Display - Above the message */}
              {!message.isUser && message.searchInfo && (
                <SearchStages searchInfo={message.searchInfo} />
              )}

              {/* Message Content */}
              <div
                className={`rounded-2xl py-4 px-6 ${
                  message.isUser
                    ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg ml-12'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                }`}
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              >
                {message.isLoading && message.content === "" ? (
                  <PremiumTypingAnimation />
                ) : (
                  <div className="leading-relaxed">
                    {message.content || (message.isLoading ? (
                      <span className="text-slate-400 text-sm italic">Generating response...</span>
                    ) : "")}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageArea;