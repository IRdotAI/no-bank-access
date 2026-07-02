/* Optional Google/Firebase cloud sync.
   Does nothing unless window.NBA_FIREBASE_CONFIG is filled in with a real
   Firebase web config. Firebase is only loaded when configured. */
const $ = (s) => document.querySelector(s);
const statusEl = $("#cloudStatus");
const signInBtn = $("#cloudSignIn");
const signOutBtn = $("#cloudSignOut");

const cfg = window.NBA_FIREBASE_CONFIG;
const configured = cfg && cfg.apiKey && !String(cfg.apiKey).includes("PASTE");

if (!configured) {
  if (statusEl) statusEl.textContent = "Not set up on this build.";
  if (signInBtn) signInBtn.hidden = true;
} else {
  init().catch(() => { if (statusEl) statusEl.textContent = "Cloud sync unavailable offline."; });
}

async function init() {
  const V = "https://www.gstatic.com/firebasejs/10.12.2/";
  const [{ initializeApp }, {
    getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged,
  }, {
    getFirestore, doc, setDoc, onSnapshot,
  }] = await Promise.all([
    import(V + "firebase-app.js"),
    import(V + "firebase-auth.js"),
    import(V + "firebase-firestore.js"),
  ]);

  const app = initializeApp(cfg);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const STORE = "nba.v1";

  let uid = null;
  let applying = false;     // true while writing a remote change into local (don't echo back)
  let firstSnap = true;
  let pushTimer = null;
  let unsub = null;

  const setStatus = (t) => { if (statusEl) statusEl.textContent = t; };
  function markCloudActive() {
    try {
      localStorage.setItem("nba.cloudOn", "1");
      localStorage.setItem("nba.lastBackup", Date.now().toString());
      const b = document.getElementById("backupBanner");
      if (b) b.hidden = true;   // no need to nag about local backups when synced
    } catch (_) {}
  }

  // finish a redirect sign-in if one was in progress (mobile fallback)
  getRedirectResult(auth).catch(() => {});

  signInBtn.onclick = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (_) { try { await signInWithRedirect(auth, new GoogleAuthProvider()); } catch (e) { setStatus("Sign-in failed."); } }
  };
  signOutBtn.onclick = () => signOut(auth);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      uid = user.uid;
      signInBtn.hidden = true;
      signOutBtn.hidden = false;
      signOutBtn.textContent = `Sign out (${user.email || "signed in"})`;
      setStatus("Syncing…");
      markCloudActive();
      startSync();
    } else {
      uid = null; firstSnap = true;
      if (unsub) { unsub(); unsub = null; }
      localStorage.removeItem("nba.cloudOn");
      signInBtn.hidden = false;
      signOutBtn.hidden = true;
      setStatus("Not signed in — data stays on this device.");
    }
  });

  function pushNow() {
    if (!uid) return;
    const state = window.nbaGetState ? window.nbaGetState() : null;
    if (!state) return;
    setDoc(doc(db, "users", uid), { state: JSON.stringify(state), updatedAt: Date.now() })
      .then(() => { markCloudActive(); setStatus("Synced ✓"); })
      .catch(() => setStatus("Sync error — will retry."));
  }

  // app.js calls this (via save()) whenever local data changes
  window.nbaCloudPush = () => {
    if (!uid || applying) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushNow, 800);
  };

  function startSync() {
    const ref = doc(db, "users", uid);
    unsub = onSnapshot(ref, (snap) => {
      if (snap.metadata.hasPendingWrites) return;   // ignore our own writes
      const data = snap.data();
      const remote = data && data.state ? data.state : null;
      const localStr = localStorage.getItem(STORE);

      if (firstSnap) {
        firstSnap = false;
        let localHasData = false;
        try { localHasData = !!(JSON.parse(localStr || "{}").cards || []).length; } catch (_) {}
        if (remote && localHasData && remote !== localStr) {
          const useCloud = confirm(
            "Cloud backup found for this account.\n\nOK = use the CLOUD copy on this device.\nCancel = upload THIS device's data to the cloud instead.");
          if (useCloud) applyRemote(remote); else pushNow();
        } else if (remote && !localHasData) {
          applyRemote(remote);
        } else if (!remote) {
          pushNow();
        }
        setStatus("Synced ✓");
        return;
      }
      // later changes from another device
      if (remote && remote !== localStorage.getItem(STORE)) applyRemote(remote);
    }, () => setStatus("Sync error."));
  }

  function applyRemote(remoteStr) {
    try {
      applying = true;
      window.nbaApplyCloud(JSON.parse(remoteStr));
    } catch (_) { /* ignore */ }
    finally { applying = false; setStatus("Synced ✓"); }
  }
}
