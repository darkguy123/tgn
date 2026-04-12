export default function PageCarcass() {
  return (
    <div className="fb-loader-shell">
      <div className="fb-loader-header">
        <div className="fb-loader-brand fb-shimmer" />
        <div className="fb-loader-header-search fb-shimmer" />
        <div className="fb-loader-header-actions">
          <div className="fb-loader-chip fb-shimmer" />
          <div className="fb-loader-chip fb-shimmer" />
          <div className="fb-loader-avatar sm fb-shimmer" />
        </div>
      </div>

      <div className="fb-loader-body">
        <aside className="fb-loader-sidebar">
          <div className="fb-loader-side-title fb-shimmer" />
          <div className="fb-loader-side-item fb-shimmer" />
          <div className="fb-loader-side-item fb-shimmer" />
          <div className="fb-loader-side-item fb-shimmer" />
          <div className="fb-loader-side-item short fb-shimmer" />
          <div className="fb-loader-side-divider" />
          <div className="fb-loader-side-item fb-shimmer" />
          <div className="fb-loader-side-item tiny fb-shimmer" />
        </aside>

        <main className="fb-loader-main-layout">
          <section className="fb-loader-panel hero">
            <div className="fb-loader-line lg fb-shimmer" />
            <div className="fb-loader-line md fb-shimmer" />
            <div className="fb-loader-kpis">
              <div className="fb-loader-kpi fb-shimmer" />
              <div className="fb-loader-kpi fb-shimmer" />
              <div className="fb-loader-kpi fb-shimmer" />
            </div>
          </section>

          <section className="fb-loader-card-grid">
            <div className="fb-loader-panel">
              <div className="fb-loader-line md fb-shimmer" />
              <div className="fb-loader-chart fb-shimmer" />
              <div className="fb-loader-line short fb-shimmer" />
            </div>
            <div className="fb-loader-panel">
              <div className="fb-loader-line md fb-shimmer" />
              <div className="fb-loader-block lg fb-shimmer" />
              <div className="fb-loader-line tiny fb-shimmer" />
            </div>
          </section>

          <section className="fb-loader-panel">
            <div className="fb-loader-line md fb-shimmer" />
            <div className="fb-loader-table-row fb-shimmer" />
            <div className="fb-loader-table-row fb-shimmer" />
            <div className="fb-loader-table-row fb-shimmer" />
            <div className="fb-loader-table-row short fb-shimmer" />
          </section>
        </main>

        <aside className="fb-loader-rightbar">
          <div className="fb-loader-panel compact">
            <div className="fb-loader-line md fb-shimmer" />
            <div className="fb-loader-line short fb-shimmer" />
            <div className="fb-loader-line tiny fb-shimmer" />
          </div>
          <div className="fb-loader-panel compact">
            <div className="fb-loader-line md fb-shimmer" />
            <div className="fb-loader-block fb-shimmer" style={{ minHeight: 120 }} />
          </div>
        </aside>
      </div>
    </div>
  );
}
