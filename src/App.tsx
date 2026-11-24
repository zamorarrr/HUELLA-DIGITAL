import { useEffect, useState } from 'react';
import { AboutView, ClosingView } from './components/AboutAndClosingView';
import { ArtifactKey, ArtifactPreviewCard } from './components/ArtifactPreviewCard';
import { FinalChallengeView } from './components/FinalChallengeView';
import { HomeView } from './components/HomeView';
import { ModuleWorkspace } from './components/ModuleWorkspace';
import { Navbar } from './components/Navbar';
import { PortfolioView } from './components/PortfolioView';
import { ResourcesView } from './components/ResourcesView';
import { RouteMapView } from './components/RouteMapView';
import { useHuellaStorage } from './hooks/useHuellaStorage';
import { AppView, ModuleId } from './types/huella';

const ALL_ARTIFACT_KEYS: ArtifactKey[] = [
  'm1',
  'm2',
  'm3',
  'm4',
  'm5',
  'm6',
  'final',
];

function parseLocationToRoute(pathname: string): {
  view: AppView;
  moduleId?: ModuleId;
} {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return { view: 'inicio' };
  if (clean === '/modulos') return { view: 'recorrido' };
  if (clean === '/desafio-final') return { view: 'desafio' };
  if (clean === '/mis-creaciones') return { view: 'creaciones' };
  if (clean === '/recursos') return { view: 'recursos' };
  if (clean === '/acerca') return { view: 'acerca' };
  if (clean === '/cierre') return { view: 'cierre' };

  const modMatch = clean.match(/^\/modulo\/([1-6])$/);
  if (modMatch) {
    return {
      view: 'modulo',
      moduleId: Number(modMatch[1]) as ModuleId,
    };
  }
  return { view: 'inicio' };
}

function routeToPathname(view: AppView, moduleId?: ModuleId): string {
  switch (view) {
    case 'inicio':
      return '/';
    case 'recorrido':
      return '/modulos';
    case 'modulo':
      return `/modulo/${moduleId ?? 1}`;
    case 'desafio':
      return '/desafio-final';
    case 'creaciones':
      return '/mis-creaciones';
    case 'recursos':
      return '/recursos';
    case 'acerca':
      return '/acerca';
    case 'cierre':
      return '/cierre';
  }
}

export default function App() {
  const {
    store,
    updateCentralCase,
    updateModule,
    updateFinalChallenge,
    updateArtifact,
    setNavigationState,
    resetAllProgress,
    isModuleUnlocked,
    isFinalChallengeUnlocked,
    completedModulesCount,
    createdArtifactsCount,
  } = useHuellaStorage();

  const resolveGuardedRoute = (
    view: AppView,
    moduleId?: ModuleId
  ): { view: AppView; moduleId?: ModuleId; redirected: boolean } => {
    if (view === 'modulo') {
      const targetMod = moduleId ?? 1;
      if (!isModuleUnlocked(targetMod)) {
        return { view: 'recorrido', redirected: true };
      }
      return { view: 'modulo', moduleId: targetMod, redirected: false };
    }
    if (view === 'desafio' && !isFinalChallengeUnlocked) {
      return { view: 'recorrido', redirected: true };
    }
    if (view === 'cierre' && !store.finalChallenge.completed) {
      return { view: 'recorrido', redirected: true };
    }
    return { view, moduleId, redirected: false };
  };

  const initialResolved = (() => {
    const parsed = parseLocationToRoute(window.location.pathname);
    return resolveGuardedRoute(parsed.view, parsed.moduleId);
  })();

  const [activeView, setActiveView] = useState<AppView>(initialResolved.view);
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>(
    initialResolved.moduleId ?? store.lastActiveModule ?? 1
  );
  const [printTarget, setPrintTarget] = useState<'all' | ArtifactKey>('all');

  useEffect(() => {
    const targetPath = routeToPathname(activeView, activeModuleId);
    if (window.location.pathname !== targetPath && initialResolved.redirected) {
      window.history.replaceState(null, '', targetPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseLocationToRoute(window.location.pathname);
      const resolved = resolveGuardedRoute(parsed.view, parsed.moduleId);
      setActiveView(resolved.view);
      if (resolved.moduleId) setActiveModuleId(resolved.moduleId);
      setNavigationState(resolved.view, resolved.moduleId);
      if (resolved.redirected) {
        window.history.replaceState(
          null,
          '',
          routeToPathname(resolved.view, resolved.moduleId)
        );
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModuleUnlocked, isFinalChallengeUnlocked, store.finalChallenge.completed]);

  const navigate = (view: AppView, moduleId?: ModuleId) => {
    const resolved = resolveGuardedRoute(view, moduleId);
    const targetPath = routeToPathname(resolved.view, resolved.moduleId);

    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }

    setActiveView(resolved.view);
    if (resolved.moduleId) setActiveModuleId(resolved.moduleId);
    setNavigationState(resolved.view, resolved.moduleId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerPrint = (target: 'all' | ArtifactKey) => {
    setPrintTarget(target);
    // Permitir que React renderice la hoja de impresión específica antes de abrir el diálogo PDF
    setTimeout(() => {
      window.print();
    }, 80);
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintTarget('all');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const keysToPrint =
    printTarget === 'all' ? ALL_ARTIFACT_KEYS : [printTarget];

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#17314F]">
      <Navbar
        activeView={activeView}
        onNavigate={(v) => navigate(v)}
        completedCount={completedModulesCount}
        centralCompleted={store.centralCase.completed}
      />

      {/* Contenido interactivo de pantalla (se oculta al imprimir PDF) */}
      <div className="no-print flex-1">
        {activeView === 'inicio' && (
          <HomeView
            centralCase={store.centralCase}
            onUpdateCentralCase={updateCentralCase}
            onStartJourney={() => navigate('modulo', 1)}
            onGoToRoute={() => navigate('recorrido')}
          />
        )}

        {activeView === 'recorrido' && (
          <RouteMapView
            store={store}
            isModuleUnlocked={isModuleUnlocked}
            isFinalChallengeUnlocked={isFinalChallengeUnlocked}
            completedModulesCount={completedModulesCount}
            onOpenModule={(id) => navigate('modulo', id)}
            onOpenCentralCase={() => {
              navigate('inicio');
              setTimeout(() => {
                document
                  .getElementById('caso-central')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }, 120);
            }}
            onOpenFinalChallenge={() => navigate('desafio')}
            onOpenClosing={() => navigate('cierre')}
          />
        )}

        {activeView === 'modulo' && (
          <ModuleWorkspace
            moduleId={activeModuleId}
            progress={store.modules[activeModuleId]}
            artifacts={store.artifacts}
            onUpdateModule={updateModule}
            onUpdateArtifact={updateArtifact}
            onBackToRoute={() => navigate('recorrido')}
            onCompleteModule={(nextId) => {
              if (nextId) {
                navigate('modulo', nextId);
              } else {
                navigate('desafio');
              }
            }}
            onPrintSingle={(k) => triggerPrint(k)}
          />
        )}

        {activeView === 'desafio' && (
          <FinalChallengeView
            state={store.finalChallenge}
            artifacts={store.artifacts}
            onUpdateState={updateFinalChallenge}
            onUpdateArtifact={updateArtifact}
            onBackToRoute={() => navigate('recorrido')}
            onFinishChallenge={() => navigate('cierre')}
            onPrintSingle={(k) => triggerPrint(k)}
          />
        )}

        {activeView === 'creaciones' && (
          <PortfolioView
            store={store}
            createdCount={createdArtifactsCount}
            isModuleUnlocked={isModuleUnlocked}
            isFinalUnlocked={isFinalChallengeUnlocked}
            onUpdateArtifact={updateArtifact}
            onGoToModuleWorkshop={(id) => {
              updateModule(id, (curr) => ({ ...curr, currentStep: 8 }));
              navigate('modulo', id);
            }}
            onGoToFinalChallenge={() => {
              updateFinalChallenge({ currentMoment: 6 });
              navigate('desafio');
            }}
            onGoToRoute={() => navigate('recorrido')}
            onPrintTarget={(t) => triggerPrint(t)}
          />
        )}

        {activeView === 'recursos' && <ResourcesView />}

        {activeView === 'acerca' && (
          <AboutView
            onGoToRoute={() => navigate('recorrido')}
            onResetProgress={() => {
              resetAllProgress();
              navigate('inicio');
            }}
          />
        )}

        {activeView === 'cierre' && (
          <ClosingView
            completedCount={completedModulesCount}
            createdCount={createdArtifactsCount}
            onViewPortfolio={() => navigate('creaciones')}
            onPrintPortfolio={() => triggerPrint('all')}
            onReviewModules={() => navigate('recorrido')}
            onGoHome={() => navigate('inicio')}
          />
        )}
      </div>

      {/* Hoja dedicada exclusiva para impresión y guardado en PDF */}
      <div className="print-only hidden bg-white p-2 text-[#17314F]">
        <div className="border-b-2 border-[#092E5D] pb-4">
          <p className="text-xs font-semibold text-[#1557A6]">
            Colegio Diego Montaña Cuéllar IED · Usme, Bogotá D. C. · Grado
            Undécimo
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-[#092E5D]">
            HUELLA DIGITAL: Portafolio de ciudadanía digital
          </h1>
          <p className="mt-1 text-xs text-[#52677F]">
            Áreas: Tecnología e Informática y Educación Ética y en Valores
            Humanos
          </p>
        </div>

        <div className="mt-6 space-y-6">
          {keysToPrint.map((key, index) => (
            <div
              key={key}
              className={`print-break-inside-avoid ${
                index > 0 && printTarget === 'all' ? 'mt-6' : ''
              }`}
            >
              <ArtifactPreviewCard
                artifactKey={key}
                artifacts={store.artifacts}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pie de página limpio */}
      <footer className="no-print border-t border-[#D6E4F2] bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 text-xs text-[#52677F] sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>
            <strong className="text-[#092E5D]">
              HUELLA DIGITAL: Piensa antes de publicar
            </strong>{' '}
            · Colegio Diego Montaña Cuéllar IED · Usme, Bogotá D. C.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => navigate('recursos')}
              className="hover:text-[#1557A6] hover:underline"
            >
              Recursos y glosario
            </button>
            <button
              type="button"
              onClick={() => navigate('creaciones')}
              className="hover:text-[#1557A6] hover:underline"
            >
              Mis creaciones
            </button>
            <button
              type="button"
              onClick={() => navigate('acerca')}
              className="hover:text-[#1557A6] hover:underline"
            >
              Acerca del proyecto
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
