export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="hero min-h-[40vh] bg-base-200 rounded-box">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold">SITE_TITLE</h1>
            <p className="py-6 text-lg text-base-content/70">SITE_DESCRIPTION</p>
            {/* Search bar scaffold */}
            <div className="form-control w-full max-w-lg mx-auto">
              <div className="input-group flex">
                <input
                  type="text"
                  placeholder="Search..."
                  className="input input-bordered flex-1"
                />
                <button className="btn btn-primary">Search</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats scaffold */}
      <section className="stats stats-vertical lg:stats-horizontal shadow w-full">
        <div className="stat">
          <div className="stat-title">Total Records</div>
          <div className="stat-value">0</div>
          <div className="stat-desc">From public data sources</div>
        </div>
        <div className="stat">
          <div className="stat-title">Categories</div>
          <div className="stat-value">0</div>
        </div>
        <div className="stat">
          <div className="stat-title">Last Updated</div>
          <div className="stat-value text-lg">2026</div>
        </div>
      </section>

      {/* Card grid scaffold */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Browse</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow border border-base-300">
              <div className="card-body">
                <h3 className="card-title">Item {i}</h3>
                <p className="text-base-content/60">Description placeholder</p>
                <div className="card-actions justify-end">
                  <a className="btn btn-primary btn-sm">View Details</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
