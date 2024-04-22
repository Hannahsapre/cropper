import { Link, Outlet } from "react-router-dom";

function Layout() {
  return (
    <div>
      <nav className="bg-gray-900 text-white fixed w-full z-10 top-0 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            {/* <img src="your-logo.png" alt="Logo" className="h-8 mr-2" /> */}
            <span className="text-lg font-semibold">PixelScale</span>
          </div>
          <div className="flex-grow text-center">
            <Link
              to="/"
              className="mr-6 text-gray-300 hover:text-white py-2 px-4 border-b-2 border-transparent hover:border-white"
            >
              Gallery
            </Link>
            <Link
              to="/upload"
              className="text-gray-300 hover:text-white py-2 px-4 border-b-2 border-transparent hover:border-white"
            >
              Upload
            </Link>
          </div>
        </div>
      </nav>

      <br />
      <br />
      <Outlet />
    
    </div>
  );
}

export default Layout;
