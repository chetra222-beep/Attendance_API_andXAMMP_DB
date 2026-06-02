function Navbar() {
  return (
    <nav className="fixed w-full bg-black/70 backdrop-blur-lg z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">

        <h1 className="text-2xl font-bold">
          Chetra<span className="text-orange-500">.</span>
        </h1>

        <ul className="hidden md:flex gap-8 text-sm">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <button className="bg-orange-500 px-5 py-2 rounded-full">
          Hire Me
        </button>

      </div>
    </nav>
  );
}

export default Navbar;