import hero from "../assets/images/hero.png";

function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center px-8">

        <div>

          <span className="bg-zinc-800 px-4 py-2 rounded-full text-sm">
            Full Stack Developer
          </span>

          <h1 className="text-5xl md:text-7xl font-bold mt-6 leading-tight">
            Build Amazing
            <span className="text-orange-500"> Websites </span>
            With ReactJS
          </h1>

          <p className="text-gray-400 mt-6 text-lg">
            I create responsive and modern websites using
            ReactJS, TailwindCSS and Laravel.
          </p>

          <div className="flex gap-5 mt-8">
            <button className="bg-orange-500 px-8 py-4 rounded-full">
              View Work
            </button>

            <button className="border border-gray-600 px-8 py-4 rounded-full">
              Contact
            </button>
          </div>

        </div>

        <div>
          <img src={hero} alt="" className="w-full" />
        </div>

      </div>
    </section>
  );
}

export default Hero;