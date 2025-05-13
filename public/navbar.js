class Navbar {
    constructor() {
        this.isMenuExpanded = false;
    }

    render() {
        return `
            <nav class="bg-gradient-to-r from-[#4a0000] via-[#800000] to-[#4a0000] text-white px-6 py-4 fixed w-full top-0 z-50 shadow-lg rounded-b-2xl gradient-flow">
                <div class="max-w-6xl mx-auto flex items-center justify-between">
                    <div class="flex items-center space-x-3 min-w-[160px] pr-8">
                        <i class="fas fa-atom text-3xl animate-spin-slow mt-1"></i>
                        <h1 class="text-3xl font-extrabold tracking-wider ml-1">Slink</h1>
                    </div>
                    <div class="flex-1 flex justify-end">
                        <div class="hidden md:flex space-x-8">
                            <a href="/" class="flex items-center space-x-2 font-semibold text-lg bg-gradient-to-r from-[#fff] via-[#e0e0e0] to-[#fff] bg-clip-text text-transparent hover:underline hover:underline-offset-8 transition-all duration-200 drop-shadow-md">
                                <i class="fas fa-home"></i>
                                <span>Home</span>
                            </a>
                            <a href="/directory" class="flex items-center space-x-2 font-semibold text-lg bg-gradient-to-r from-[#fff] via-[#e0e0e0] to-[#fff] bg-clip-text text-transparent hover:underline hover:underline-offset-8 transition-all duration-200 drop-shadow-md">
                                <i class="fas fa-users"></i>
                                <span>Directory</span>
                            </a>
                            <a href="/profile" class="flex items-center space-x-2 font-semibold text-lg bg-gradient-to-r from-[#fff] via-[#e0e0e0] to-[#fff] bg-clip-text text-transparent hover:underline hover:underline-offset-8 transition-all duration-200 drop-shadow-md">
                                <i class="fas fa-user"></i>
                                <span>My Profile</span>
                            </a>
                            <a href="/about" class="flex items-center space-x-2 font-semibold text-lg bg-gradient-to-r from-[#fff] via-[#e0e0e0] to-[#fff] bg-clip-text text-transparent hover:underline hover:underline-offset-8 transition-all duration-200 drop-shadow-md">
                                <i class="fas fa-info-circle"></i>
                                <span>About</span>
                            </a>
                            <a href="/logout" class="flex items-center space-x-2 font-semibold text-lg bg-gradient-to-r from-[#fff] via-[#e0e0e0] to-[#fff] bg-clip-text text-transparent hover:underline hover:underline-offset-8 transition-all duration-200 drop-shadow-md">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>Logout</span>
                            </a>
                        </div>
                        <button id="nav-toggle" class="text-white transition-all hover:scale-110 md:hidden ml-2">
                            <i class="fas fa-chevron-down text-2xl"></i>
                        </button>
                    </div>
                </div>
                <div id="nav-menu" class="hidden mt-4 transition-all duration-300 ease-in-out md:hidden max-w-6xl mx-auto">
                    <div class="flex flex-col space-y-2">
                        <a href="/" class="flex items-center space-x-2 font-semibold text-lg bg-gradient-to-r from-[#fff] via-[#e0e0e0] to-[#fff] bg-clip-text text-transparent hover:underline hover:underline-offset-8 transition-all duration-200 drop-shadow-md p-2">
                            <i class="fas fa-home"></i>
                            <span>Home</span>
                        </a>
                        <a href="/directory" class="flex items-center space-x-2 font-semibold text-lg bg-gradient-to-r from-[#fff] via-[#e0e0e0] to-[#fff] bg-clip-text text-transparent hover:underline hover:underline-offset-8 transition-all duration-200 drop-shadow-md p-2">
                            <i class="fas fa-users"></i>
                            <span>Directory</span>
                        </a>
                        <a href="/profile" class="flex items-center space-x-2 font-semibold text-lg bg-gradient-to-r from-[#fff] via-[#e0e0e0] to-[#fff] bg-clip-text text-transparent hover:underline hover:underline-offset-8 transition-all duration-200 drop-shadow-md p-2">
                            <i class="fas fa-user"></i>
                            <span>My Profile</span>
                        </a>
                        <a href="/about" class="flex items-center space-x-2 font-semibold text-lg bg-gradient-to-r from-[#fff] via-[#e0e0e0] to-[#fff] bg-clip-text text-transparent hover:underline hover:underline-offset-8 transition-all duration-200 drop-shadow-md p-2">
                            <i class="fas fa-info-circle"></i>
                            <span>About</span>
                        </a>
                        <a href="/logout" class="flex items-center space-x-2 font-semibold text-lg bg-gradient-to-r from-[#fff] via-[#e0e0e0] to-[#fff] bg-clip-text text-transparent hover:underline hover:underline-offset-8 transition-all duration-200 drop-shadow-md p-2">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </a>
                    </div>
                </div>
            </nav>
            <style>
                @keyframes gradient-flow {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                .gradient-flow {
                    background-size: 200% 200%;
                    animation: gradient-flow 15s ease infinite;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            </style>
        `;
    }

    init() {
        document.getElementById('nav-toggle').addEventListener('click', () => {
            this.isMenuExpanded = !this.isMenuExpanded;
            const menu = document.getElementById('nav-menu');
            const icon = document.querySelector('#nav-toggle i');
            menu.classList.toggle('hidden');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });
    }
}

export default Navbar; 