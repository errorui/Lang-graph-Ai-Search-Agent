"use client"
import {Send} from "lucide-react"
interface InputBarProps {
  currentMessage: string;
  setCurrentMessage: (msg: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const InputBar: React.FC<InputBarProps> = ({ currentMessage, setCurrentMessage, onSubmit }) => {
  const handleChange = (e:any) => {
    setCurrentMessage(e.target.value);
  };

  return (
    <form onSubmit={onSubmit} className="p-6 bg-white border-t border-slate-200">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-2 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
          <input
            type="text"
            placeholder="Ask me anything..."
            value={currentMessage}
            onChange={handleChange}
            className="flex-grow px-6 py-4 bg-transparent focus:outline-none text-slate-700 placeholder-slate-400 text-base"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          />
          <button
            type="submit"
            disabled={!currentMessage.trim()}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-green-300 disabled:to-slate-400 disabled:cursor-not-allowed rounded-xl p-4 shadow-md transition-all duration-200 group"
          >
            <Send className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default InputBar