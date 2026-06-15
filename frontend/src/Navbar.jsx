const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
        <h1 className="text-xl font-bold text-green-700">
          HimShakti AI
        </h1>

        <ul className="flex gap-6">
          <li><a href="#">Home</a></li>
          <li><a href="#">Generator</a></li>
          <li><a href="#">History</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;