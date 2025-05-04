class Navbar {
    constructor() {
        this.isMenuExpanded = false;
    }

    render() {
        return `
            <nav class="bg-gradient-to-r from-[#4a0000] via-[#800000] to-[#4a0000] text-white p-4 fixed w-full top-0 z-50 shadow-lg rounded-b-2xl gradient-flow">
                <div class="container mx-auto flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                        <i class="fas fa-atom text-2xl animate-spin-slow mt-1"></i>
                        <h1 class="text-2xl font-bold tracking-wider">Slink</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button id="nav-toggle" class="text-white transition-all hover:scale-105">
                            <i class="fas fa-chevron-down text-xl"></i>
                        </button>
                    </div>
                </div>
                <div id="nav-menu" class="hidden mt-4 transition-all duration-300 ease-in-out">
                    <div class="flex flex-col space-y-2">
                        <a href="index.html" class="flex items-center space-x-2 hover:text-gray-200 transition-all hover:scale-105 p-2">
                            <i class="fas fa-home"></i>
                            <span>Home</span>
                        </a>
                        <a href="directory.html" class="flex items-center space-x-2 hover:text-gray-200 transition-all hover:scale-105 p-2">
                            <i class="fas fa-users"></i>
                            <span>Directory</span>
                        </a>
                        <a href="#" class="flex items-center space-x-2 hover:text-gray-200 transition-all hover:scale-105 p-2">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Events</span>
                        </a>
                        <a href="#" class="flex items-center space-x-2 hover:text-gray-200 transition-all hover:scale-105 p-2">
                            <i class="fas fa-book"></i>
                            <span>Resources</span>
                        </a>
                        <a href="#" class="flex items-center space-x-2 hover:text-gray-200 transition-all hover:scale-105 p-2">
                            <i class="fas fa-info-circle"></i>
                            <span>About</span>
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