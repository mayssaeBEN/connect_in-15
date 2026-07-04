import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { apiFetch } from "./api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Même style de card que Feed
  const card =
    "rounded-2xl border border-slate-300 bg-white p-6 shadow-md " +
    "dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40";

  const field =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none " +
    "ring-indigo-500/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950";

  // ✅ bouton bleu pâle (comme Publier/Envoyer)
  const btnBluePale =
    "w-full rounded-xl border border-indigo-300 bg-indigo-100 px-4 py-3 text-sm font-semibold " +
    "text-indigo-900 transition hover:bg-indigo-200 " +
    "dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-100 dark:hover:bg-indigo-950/60";

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await apiFetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/feed", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppLayout subtitle="Connexion">
      <div className="mx-auto max-w-lg">
        <div className={card}>
          <h1 className="text-2xl font-bold">Se connecter</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Entre ton email et ton mot de passe.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-3">
            <input
              className={field}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
            <input
              className={field}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />

            <button type="submit" className={btnBluePale}>
              Connexion
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link className="font-medium text-indigo-600 hover:underline" to="/register">
              Créer un compte
            </Link>
            <Link className="font-medium text-indigo-600 hover:underline" to="/feed">
              Voir le feed
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 