const services = [
  {
    title: "Frontend Development",
    desc: "Modern responsive website using ReactJS."
  },
  {
    title: "Backend Development",
    desc: "Laravel API and MySQL database."
  },
  {
    title: "UI/UX Design",
    desc: "Modern clean interface design."
  }
];

function Services() {
  return (
    <section className="py-24 px-8">

      <div className="max-w-7xl mx-auto">

        <h2 className="text-5xl font-bold">
          My <span className="text-orange-500">Services</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-14">

          {services.map((item, index) => (
            <div
              key={index}
              className="border border-zinc-700 rounded-3xl p-8 hover:border-orange-500 transition"
            >

              <div className="w-16 h-16 bg-orange-500 rounded-2xl"></div>

              <h3 className="text-2xl font-bold mt-6">
                {item.title}
              </h3>

              <p className="text-gray-400 mt-4">
                {item.desc}
              </p>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}

export default Services;