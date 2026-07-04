import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";

export default function AppLayout({ subtitle, children, requireAuth = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (requireAuth && !user) {
      navigate("/login", { replace: true });
    }
  }, [requireAuth, user, navigate]);

  const isActive = (path) => location.pathname === path;

  const logout = async () => {
    try {
      await apiFetch("/logout", { method: "POST" });
    } catch {}

    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const navBtn = (active) =>
    [
      "rounded-full px-3 py-1 text-sm font-semibold transition",
      active
        ? "bg-indigo-600 text-white"
        : "text-slate-800 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-800",
    ].join(" ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50 text-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-50">

      {/* NAVBAR */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">

          {/* LEFT */}
          <div className="flex items-center gap-3">

            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,.18)] dark:shadow-[0_0_0_6px_rgba(16,185,129,.12)]" />

            {/* ✅ Logo / titre cliquable */}
            <Link to="/" className="block">
              <div className="text-lg font-semibold leading-tight hover:text-indigo-600 transition">
                ConnectIn
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {subtitle}
              </div>
            </Link>

            <Link
              to="/feed"
              className={navBtn(isActive("/feed")) + " ml-3 hidden sm:inline-flex"}
            >
              Feed
            </Link>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">

            {!user ? (
              <>
                <Link to="/login" className={navBtn(isActive("/login"))}>
                  Connexion
                </Link>

                <Link to="/register" className={navBtn(isActive("/register"))}>
                  Inscription
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className={navBtn(isActive("/profile"))}>
                  Profil
                </Link>

                <span className="hidden sm:inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                  👤 {user.name || "Utilisateur"}
                </span>
              </>
            )}

            {/* THEME BUTTON */}
            <button
              type="button"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>

            {/* LOGOUT */}
            {user && (
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-rose-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-rose-500"
              >
                Déconnexion
              </button>
            )}

          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {children}
      </div>

    </div>
  );
} 