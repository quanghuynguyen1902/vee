export default function AppHeader() {
  return (
    <header className="masthead">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <img src="/favicon.svg" alt="" />
        </div>
        <div>
          <div className="logo">vee<span className="logo-accent">.</span></div>
          <div className="brand-tagline">Luyện dịch thông minh</div>
        </div>
      </div>
      <div className="header-status">
        <span className="header-status-dot" />
        Học mỗi ngày, tiến bộ mỗi câu
      </div>
    </header>
  );
}
