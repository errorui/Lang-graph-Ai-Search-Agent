"use client"
const InputBar = ({ currentMessage, setCurrentMessage, onSubmit }: {
    currentMessage: string;
    setCurrentMessage: (message: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) => {

    const handleChange = (e:any) => {
        setCurrentMessage(e.target.value)
    }

    return (
        <form onSubmit={onSubmit} className="p-4 bg-white">
            <div className="flex items-center bg-[#F9F9F5] rounded-full p-3 shadow-md border border-gray-200">
                <button
                    type="button"
                    className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                   
                </button>
                <input
                    type="text"
                    placeholder="Type a message"
                    value={currentMessage}
                    onChange={handleChange}
                    className="flex-grow px-4 py-2 bg-transparent focus:outline-none text-gray-700"
                />
              
                <button
                    type="submit"
                    className="bg-gradient-to-r from-gray-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 rounded-full p-3 ml-2 shadow-md transition-all duration-200 group"
                >
                    <svg className="w-6 h-6 text-white transform rotate-45 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                </button>
            </div>
        </form>
    )
}

export default InputBar