import { Link } from "react-router-dom";
import AppLayout from "./components/AppLayout";

export default function Home() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const heroCard =
    "rounded-2xl border border-slate-300 bg-white p-8 shadow-md " +
    "dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40";

  const btnBluePale =
    "inline-flex items-center justify-center rounded-xl border border-indigo-300 bg-indigo-100 " +
    "px-4 py-2.5 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-200 " +
    "dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-100 dark:hover:bg-indigo-950/60";

  const btnOutline =
    "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white " +
    "px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 " +
    "dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900";

  const featureCard =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm " +
    "dark:border-slate-800 dark:bg-slate-950/50";

  return (
    <AppLayout subtitle="Accueil">
      <div className={heroCard}>
        <div className="text-4xl font-extrabold tracking-tight">Bienvenue sur ConnectIn</div>
        <div className="mt-2 max-w-2xl text-sm text-slate-700 dark:text-slate-300">
          Un mini réseau social : publier des posts (texte + image), commenter (texte + image), liker,
          gérer ton profil et ton compte.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/feed" className={btnBluePale}>
            Aller au feed
          </Link>

          {!user ? (
            <>
              <Link to="/login" className={btnOutline}>
                Connexion
              </Link>
              <Link to="/register" className={btnOutline}>
                Inscription
              </Link>
            </>
          ) : (
            <Link to="/profile" className={btnOutline}>
              Mon profil
            </Link>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={featureCard}>
            <div className="text-lg font-bold">Posts</div>
            <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              Publie du texte, ajoute une image, modifie et supprime.
            </div>
          </div>

          <div className={featureCard}>
            <div className="text-lg font-bold">Commentaires</div>
            <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              Réponds aux posts, ajoute une image, modifie et supprime.
            </div>
          </div>

          <div className={featureCard}>
            <div className="text-lg font-bold">Profil</div>
            <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              Change email/nom, mot de passe, et supprime le compte.
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 