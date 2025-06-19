const Header = () => {
    return (
        <header className="relative flex items-center justify-between px-8 py-5 bg-black z-10">
            <div className="absolute inset-0  opacity-5 mix-blend-overlay"></div>
            
            <div className="flex items-center relative">
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1.5 h-6 bg-teal-400 rounded-full opacity-80"></div>
                <span className="font-bold text-white text-xl tracking-tight">Langgraph Search Agent</span>
            </div>

         
        </header>
    )
}

export default Header