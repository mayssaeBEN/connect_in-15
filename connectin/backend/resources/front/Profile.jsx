import { useEffect, useMemo, useState } from "react";
import AppLayout from "./components/AppLayout";
import { apiFetch } from "./api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const userId = user?.id;

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Infos
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(true);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Delete account
  const [deleteMode, setDeleteMode] = useState("keep_content"); // keep_content | delete_content
  const [confirmText, setConfirmText] = useState("");

  // Styles (cohérents avec Feed.jsx)
  const card =
    "rounded-2xl border border-slate-300 bg-white p-6 shadow-md " +
    "dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40";

  const field =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none " +
    "ring-indigo-500/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950";

  const btnBlue =
    "inline-flex items-center justify-center rounded-xl border border-indigo-300 bg-indigo-100 " +
    "px-4 py-2.5 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-200 " +
    "dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-100 dark:hover:bg-indigo-950/60";

  const btnRed =
    "inline-flex items-center justify-center rounded-xl border border-rose-300 bg-rose-100 " +
    "px-4 py-2.5 text-sm font-semibold text-rose-900 transition hover:bg-rose-200 " +
    "dark:border-rose-800/60 dark:bg-rose-950/35 dark:text-rose-100 dark:hover:bg-rose-950/55";

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
      return;
    }

    const load = async () => {
      setError("");
      setSuccess("");
      try {
        const data = await apiFetch(`/users/${userId}`);
        const u = data?.user;
        if (u) {
          setName(u.name || "");
          setEmail(u.email || "");
          localStorage.setItem("user", JSON.stringify(u)); // sync localStorage
        }
      } catch (e) {
        setError(e.message || "Erreur");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, navigate]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = await apiFetch(`/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const updated = data?.user;
      if (updated) {
        localStorage.setItem("user", JSON.stringify(updated));
      }
      setSuccess("Profil mis à jour ✅");
    } catch (e) {
      setError(e.message || "Erreur");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/users/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      setCurrentPassword("");
      setNewPassword("");
      setSuccess("Mot de passe mis à jour ✅");
    } catch (e) {
      setError(e.message || "Erreur");
    }
  };

  const deleteAccount = async () => {
    setError("");
    setSuccess("");

    if (confirmText !== "SUPPRIMER") {
      setError("Tape SUPPRIMER pour confirmer.");
      return;
    }

    try {
      await apiFetch(`/users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: deleteMode }),
      });

      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    } catch (e) {
      setError(e.message || "Erreur");
    }
  };

  return (
    <AppLayout subtitle="Profil" requireAuth>
      <div className={card}>
        <div className="text-3xl font-extrabold tracking-tight">Profil</div>
        <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
          Modifie tes informations, ton mot de passe, ou supprime ton compte.
        </div>

        {loading && (
          <div className="mt-4 text-sm text-slate-700 dark:text-slate-300">
            Chargement...
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/35 dark:text-rose-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/35 dark:text-emerald-100">
            {success}
          </div>
        )}

        {/* Update info */}
        <form onSubmit={saveProfile} className="mt-6 space-y-3">
          <div className="text-lg font-bold">Informations</div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-sm font-semibold">Nom</div>
              <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <div className="mb-1 text-sm font-semibold">Email</div>
              <input className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <button type="submit" className={btnBlue}>
            Enregistrer
          </button>
        </form>

        {/* Password */}
        <form onSubmit={changePassword} className="mt-8 space-y-3">
          <div className="text-lg font-bold">Mot de passe</div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-sm font-semibold">Mot de passe actuel</div>
              <input
                className={field}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-1 text-sm font-semibold">Nouveau mot de passe</div>
              <input
                className={field}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className={btnBlue}>
            Changer le mot de passe
          </button>
        </form>

        {/* Delete */}
        <div className="mt-10 rounded-2xl border border-rose-300 bg-rose-50 p-5 dark:border-rose-800/60 dark:bg-rose-950/25">
          <div className="text-lg font-extrabold text-rose-900 dark:text-rose-100">
            Supprimer mon compte
          </div>

          <div className="mt-1 text-sm text-slate-800 dark:text-slate-200">
          Le sujet demande un choix : supprimer ton contenu (posts/commentaires) ou le garder en
          l’anonymisant (“Utilisateur supprimé”).
          </div>

          <div className="mt-4 space-y-2">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="deleteMode"
                value="keep_content"
                checked={deleteMode === "keep_content"}
                onChange={() => setDeleteMode("keep_content")}
                className="mt-1"
              />
              <div>
                <div className="font-semibold">Garder mon contenu</div>
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  Mes posts/commentaires restent, mon nom devient “Utilisateur supprimé”.
                </div>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="deleteMode"
                value="delete_content"
                checked={deleteMode === "delete_content"}
                onChange={() => setDeleteMode("delete_content")}
                className="mt-1"
              />
              <div>
                <div className="font-semibold">Supprimer mon contenu</div>
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  Mes posts/commentaires sont supprimés.
                </div>
              </div>
            </label>
          </div>

          <div className="mt-4">
            <div className="mb-1 text-sm font-semibold">
              Tape <span className="font-extrabold">SUPPRIMER</span> pour confirmer
            </div>
            <input
              className={field}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="SUPPRIMER"
            />
          </div>

          <div className="mt-4">
            <button type="button" onClick={deleteAccount} className={btnRed}>
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 