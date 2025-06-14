class Navbar {
    constructor() {
        this.isMenuExpanded = false;
    }

    render() {
        return `
            <nav class="navbar-gradient text-white px-6 py-4 fixed w-full top-0 z-50 shadow-lg">
                <div class="max-w-7xl mx-auto flex items-center justify-between">
                    <div class="flex items-center space-x-3 min-w-[160px] pr-8">
                        <i class="fas fa-atom text-3xl animate-spin-slow mt-1"></i>
                        <h1 class="text-3xl font-extrabold tracking-wider ml-1">Slink</h1>
                    </div>
                    <div class="flex-1 flex justify-end">
                        <div class="hidden md:flex space-x-8">
                            <a href="/" class="nav-link flex items-center space-x-2 font-semibold text-lg text-white hover:text-gray-200">
                                <i class="fas fa-home"></i>
                                <span>Home</span>
                            </a>
                            <a href="/directory" class="nav-link flex items-center space-x-2 font-semibold text-lg text-white hover:text-gray-200">
                                <i class="fas fa-users"></i>
                                <span>Directory</span>
                            </a>
                            <a href="/forum" class="nav-link flex items-center space-x-2 font-semibold text-lg text-white hover:text-gray-200">
                                <i class="fas fa-comments"></i>
                                <span>Forum</span>
                            </a>
                            <a href="/profile" class="nav-link flex items-center space-x-2 font-semibold text-lg text-white hover:text-gray-200">
                                <i class="fas fa-user"></i>
                                <span>Profile</span>
                            </a>
                            <a href="/logout" class="nav-link flex items-center space-x-2 font-semibold text-lg text-white hover:text-gray-200">
                                <i class="fas fa-sign-out-alt"></i>
                            </a>
                        </div>
                        <button id="nav-toggle" class="text-white transition-all hover:scale-110 md:hidden ml-2">
                            <i class="fas fa-chevron-down text-2xl"></i>
                        </button>
                    </div>
                </div>
                <div id="nav-menu" class="hidden mt-4 transition-all duration-300 ease-in-out md:hidden max-w-7xl mx-auto">
                    <div class="flex flex-col space-y-2">
                        <a href="/" class="nav-link flex items-center space-x-2 font-semibold text-lg text-white hover:text-gray-200 p-2">
                            <i class="fas fa-home"></i>
                            <span>Home</span>
                        </a>
                        <a href="/directory" class="nav-link flex items-center space-x-2 font-semibold text-lg text-white hover:text-gray-200 p-2">
                            <i class="fas fa-users"></i>
                            <span>Directory</span>
                        </a>
                        <a href="/forum" class="nav-link flex items-center space-x-2 font-semibold text-lg text-white hover:text-gray-200 p-2">
                            <i class="fas fa-comments"></i>
                            <span>Forum</span>
                        </a>
                        <a href="/profile" class="nav-link flex items-center space-x-2 font-semibold text-lg text-white hover:text-gray-200 p-2">
                            <i class="fas fa-user"></i>
                            <span>Profile</span>
                        </a>
                        <a href="/logout" class="nav-link flex items-center space-x-2 font-semibold text-lg text-white hover:text-gray-200 p-2">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Log Out</span>
                        </a>
                    </div>
                </div>
            </nav>
            <style>
                @keyframes gradient-flow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .navbar-gradient {
                    background: linear-gradient(45deg, #8a3242, #602234);
                    background-size: 200% 200%;
                    animation: gradient-flow 3s ease-in-out infinite;
                }
                .nav-link {
                    position: relative;
                    transition: all 0.3s ease;
                }
                .nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: -2px;
                    left: 0;
                    background-color: white;
                    transition: width 0.3s ease;
                }
                .nav-link:hover::after {
                    width: 100%;
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