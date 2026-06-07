/* global React, ReactDOM, APP, PBHome, PBPhase, PBDetail, PBAbout */
// AI PDLC Playbook — app shell + route switch.

const { NavProvider, useNav, SubmitProvider, Header, Footer } = APP;

function CurrentPage() {
  const { route } = useNav();
  switch (route.name) {
    case 'home': return <PBHome.Home />;
    case 'phase': return <PBPhase.PhasePage id={route.id} />;
    case 'activity': return <PBPhase.ActivityPage id={route.id} />;
    case 'usecase': return <PBDetail.UseCasePage id={route.id} />;
    case 'technique': return <PBDetail.TechniquePage id={route.id} />;
    case 'techniques': return <PBDetail.TechniquesIndex />;
    case 'about': return <PBAbout.AboutPage id={route.id} />;
    default: return <PBHome.Home />;
  }
}

function App() {
  return (
    <NavProvider>
      <SubmitProvider>
        <div className="pb-app">
          <Header />
          <main className="pb-app-main">
            <CurrentPage />
          </main>
          <Footer />
        </div>
      </SubmitProvider>
    </NavProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
