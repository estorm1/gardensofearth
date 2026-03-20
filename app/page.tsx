export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="flex flex-col items-center justify-center h-screen text-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Gardens of Earth
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-2xl text-gray-300">
          Reimagining Earth through technology, ecology, and human intention.
        </p>

        <div className="mt-10 flex gap-4">
          <button className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition">
            Explore the World
          </button>
          <button className="px-6 py-3 border border-white rounded-full hover:bg-white hover:text-black transition">
            View Projects
          </button>
        </div>
      </section>
    </main>
  );
}