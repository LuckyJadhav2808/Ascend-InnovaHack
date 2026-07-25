"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db, googleProvider, githubProvider } from "./firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  deleteUser,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc
} from "firebase/firestore";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [user, setUser] = useState({
    userId: "guest_demo",
    name: "Candidate",
    email: "",
    track: "",
    trackTitle: "",
    customTracks: [],
    xp: 0,
    streak: { current: 1, longest: 1, lastActiveDate: new Date().toISOString() },
    leagueId: "league_gold",
    questionsAnswered: 0,
    resumeUploaded: false,
    resumeFileName: null,
    extractedSkills: [],
    createdAt: new Date().toISOString()
  });

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [skillGraph, setSkillGraph] = useState({ nodes: [], edges: [] });
  const [leagueMembers, setLeagueMembers] = useState([]);
  const [history, setHistory] = useState([]);

  // Hydrate state from localStorage on client mount ONLY to guarantee SSR matches client initial HTML
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedUser = localStorage.getItem("ascend_user");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.track) {
            setUser(parsed);
          }
        }

        const savedGraph = localStorage.getItem("ascend_skillGraph");
        if (savedGraph) {
          const parsedG = JSON.parse(savedGraph);
          if (parsedG && parsedG.nodes?.length > 0) {
            setSkillGraph(parsedG);
          }
        }
      } catch (_) { }
      setIsHydrated(true);
    }
  }, []);

  // Sync user state to localStorage ONLY after client hydration has completed
  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window !== "undefined" && user && user.track) {
      try {
        localStorage.setItem("ascend_user", JSON.stringify(user));
      } catch (_) { }
    }
  }, [user, isHydrated]);

  // Sync skillGraph state to localStorage ONLY after client hydration has completed
  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window !== "undefined" && skillGraph && skillGraph.nodes?.length > 0) {
      try {
        localStorage.setItem("ascend_skillGraph", JSON.stringify(skillGraph));
      } catch (_) { }
    }
  }, [skillGraph, isHydrated]);

  // Active user ID — reactive state so onSnapshot re-subscribes when it changes
  const [currentUid, setCurrentUid] = useState("guest_demo");

  // 1. Real-time listener for User Profile & Skill Graph in Firestore
  useEffect(() => {
    if (!currentUid || currentUid === "guest_demo") {
      setLoadingAuth(false);
      return;
    }

    const userDocRef = doc(db, "users", currentUid);

    const unsubscribeUser = onSnapshot(
      userDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser((prev) => {
            const merged = { ...prev, ...data };
            if (typeof window !== "undefined") localStorage.setItem("ascend_user", JSON.stringify(merged));
            return merged;
          });
          if (data.skillGraph && data.skillGraph.nodes && data.skillGraph.nodes.length > 0) {
            setSkillGraph(data.skillGraph);
            if (typeof window !== "undefined") localStorage.setItem("ascend_skillGraph", JSON.stringify(data.skillGraph));
          }
        } else if (user.email) {
          const altId = stableFallbackUid(user.email);
          if (altId !== currentUid) {
            try {
              const altSnap = await getDoc(doc(db, "users", altId));
              if (altSnap.exists()) {
                const altData = altSnap.data();
                await setDoc(doc(db, "users", currentUid), altData, { merge: true }).catch(() => { });
                setUser((prev) => ({ ...prev, ...altData }));
                if (altData.skillGraph && altData.skillGraph.nodes?.length > 0) {
                  setSkillGraph(altData.skillGraph);
                }
              }
            } catch (_) { }
          }
        }
      },
      (error) => {
        console.warn("Firestore User onSnapshot warning:", error);
      }
    );

    return () => unsubscribeUser();
  }, [currentUid, user.email]);

  // 2. Real-time listener for League Standings in Firestore
  useEffect(() => {
    const leagueId = user.leagueId || "league_gold";
    const membersCollRef = collection(db, "leagues", leagueId, "members");

    const unsubscribeLeague = onSnapshot(
      membersCollRef,
      (querySnap) => {
        const members = [];
        querySnap.forEach((d) => {
          members.push({ userId: d.id, ...d.data() });
        });

        const hasCurrentUser = members.some((m) => m.userId === currentUid);
        if (!hasCurrentUser && currentUid && user.track) {
          const userLeagueEntry = {
            userId: currentUid,
            name: user.name || "Candidate",
            xp: user.xp || 0,
            streak: user.streak?.current || 1,
            avatar: "⚡",
            updatedAt: new Date().toISOString()
          };
          setDoc(doc(db, "leagues", leagueId, "members", currentUid), userLeagueEntry, { merge: true }).catch(console.warn);
        }

        members.sort((a, b) => (b.xp || 0) - (a.xp || 0));
        const ranked = members.map((m, idx) => ({ ...m, rank: idx + 1 }));
        setLeagueMembers(ranked);
      },
      (error) => {
        console.warn("Firestore League onSnapshot warning:", error);
      }
    );

    return () => unsubscribeLeague();
  }, [user.leagueId, currentUid, user.name, user.xp, user.streak?.current, user.track]);

  // 3. Real-time listener for User Practice History in Firestore
  useEffect(() => {
    if (!currentUid || currentUid === "guest_demo") return;

    const historyCollRef = collection(db, "users", currentUid, "history");

    const unsubscribeHistory = onSnapshot(
      historyCollRef,
      (querySnap) => {
        const records = [];
        querySnap.forEach((d) => {
          records.push({ id: d.id, ...d.data() });
        });
        setHistory(records);
      },
      (error) => {
        console.warn("Firestore History onSnapshot warning:", error);
      }
    );

    return () => unsubscribeHistory();
  }, [currentUid]);

  // Helper: fetch user doc across primary UID & fallback email UID
  const fetchFirestoreUser = async (uid, email) => {
    try {
      if (uid && uid !== "guest_demo") {
        const primarySnap = await getDoc(doc(db, "users", uid));
        if (primarySnap.exists()) return primarySnap.data();
      }
      if (email) {
        const altId = stableFallbackUid(email);
        const altSnap = await getDoc(doc(db, "users", altId));
        if (altSnap.exists()) {
          const altData = altSnap.data();
          if (uid && uid !== "guest_demo") {
            setDoc(doc(db, "users", uid), altData, { merge: true }).catch(() => { });
          }
          return altData;
        }
      }
    } catch (err) {
      console.warn("fetchFirestoreUser error:", err);
    }
    return null;
  };

  // ─── Automatic Cloud Firestore Auto-Sync Engine ────────────────────────
  useEffect(() => {
    if (!isHydrated || !currentUid || currentUid === "guest_demo") return;

    const syncToFirestore = async () => {
      try {
        const payload = {
          ...user,
          skillGraph,
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", currentUid), payload, { merge: true });
        if (user.email) {
          const altId = stableFallbackUid(user.email);
          if (altId !== currentUid) {
            await setDoc(doc(db, "users", altId), payload, { merge: true }).catch(() => {});
          }
        }
      } catch (err) {
        console.warn("[Firestore Auto-Sync Notice]", err);
      }
    };

    const timer = setTimeout(syncToFirestore, 1000);
    return () => clearTimeout(timer);
  }, [user, skillGraph, currentUid, isHydrated]);

  // Firebase Auth Observer — sets currentUid and fetches Firestore user doc on login
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const email = firebaseUser.email;
        setCurrentUid(uid);

        // Fetch full user document FIRST before updating user state to avoid transient empty track state
        const existingDocData = await fetchFirestoreUser(uid, email);
        let savedCustomName = "";
        if (typeof window !== "undefined") {
          try { savedCustomName = localStorage.getItem("ascend_custom_username") || ""; } catch (_) {}
        }

        const finalName = existingDocData?.name || firebaseUser.displayName || savedCustomName || email?.split("@")[0] || "Candidate";

        if (existingDocData) {
          const fullUser = {
            userId: uid,
            name: finalName,
            email: email || existingDocData.email || "",
            track: existingDocData.track || "",
            trackTitle: existingDocData.trackTitle || "",
            customTracks: existingDocData.customTracks || [],
            trackGraphs: existingDocData.trackGraphs || {},
            xp: existingDocData.xp || 0,
            streak: existingDocData.streak || { current: 1, longest: 1, lastActiveDate: new Date().toISOString() },
            leagueId: existingDocData.leagueId || "league_gold",
            questionsAnswered: existingDocData.questionsAnswered || 0,
            resumeUploaded: existingDocData.resumeUploaded || false,
            resumeFileName: existingDocData.resumeFileName || null,
            extractedSkills: existingDocData.extractedSkills || [],
            createdAt: existingDocData.createdAt || new Date().toISOString()
          };

          setUser(fullUser);
          if (typeof window !== "undefined") {
            localStorage.setItem("ascend_user", JSON.stringify(fullUser));
            localStorage.setItem("ascend_custom_username", finalName);
          }

          if (existingDocData.skillGraph && existingDocData.skillGraph.nodes?.length > 0) {
            setSkillGraph(existingDocData.skillGraph);
            if (typeof window !== "undefined") {
              localStorage.setItem("ascend_skillGraph", JSON.stringify(existingDocData.skillGraph));
            }
          }
        } else {
          setUser((prev) => {
            const merged = {
              ...prev,
              userId: uid,
              email: email || prev.email,
              name: finalName
            };
            if (typeof window !== "undefined") {
              localStorage.setItem("ascend_user", JSON.stringify(merged));
            }
            return merged;
          });
        }
      } else {
        setCurrentUid("guest_demo");
      }
      setLoadingAuth(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // ─── Track selection: calls dataset API for skill graph ─────
  const selectTrack = async (trackId, trackTitle = "", customGraphData = null) => {
    // Check if we already have a saved graph & mastery progress for this track ID
    const existingSavedGraph = user.trackGraphs?.[trackId];

    if (existingSavedGraph && existingSavedGraph.nodes?.length > 0) {
      setSkillGraph(existingSavedGraph);
      setUser((prev) => ({ ...prev, track: trackId, trackTitle }));
      const updateObj = { track: trackId, trackTitle, skillGraph: existingSavedGraph };
      try {
        if (currentUid) await setDoc(doc(db, "users", currentUid), updateObj, { merge: true });
        if (user.email) await setDoc(doc(db, "users", stableFallbackUid(user.email)), updateObj, { merge: true });
      } catch (e) {
        console.warn("Firestore selectTrack:", e);
      }
      return;
    }

    if (customGraphData) {
      const updatedTrackGraphs = { ...(user.trackGraphs || {}), [trackId]: customGraphData };
      setUser((prev) => ({ ...prev, track: trackId, trackTitle, trackGraphs: updatedTrackGraphs }));
      setSkillGraph(customGraphData);
      const updateObj = { track: trackId, trackTitle, skillGraph: customGraphData, trackGraphs: updatedTrackGraphs };
      try {
        if (currentUid) await setDoc(doc(db, "users", currentUid), updateObj, { merge: true });
        if (user.email) await setDoc(doc(db, "users", stableFallbackUid(user.email)), updateObj, { merge: true });
      } catch (e) {
        console.warn("Firestore selectTrack:", e);
      }
      return;
    }

    setUser((prev) => ({ ...prev, track: trackId, trackTitle }));

    try {
      const res = await fetch(`/api/dataset/skillgraph?track=${encodeURIComponent(trackId)}`);
      const data = await res.json();

      let targetGraph = { nodes: [], edges: [] };
      if (data.success && data.graph && data.graph.nodes?.length > 0) {
        targetGraph = data.graph;
        setSkillGraph(targetGraph);
      }
      const updatedTrackGraphs = { ...(user.trackGraphs || {}), [trackId]: targetGraph };
      setUser((prev) => ({ ...prev, trackGraphs: updatedTrackGraphs }));

      const updateObj = { track: trackId, trackTitle, skillGraph: targetGraph, trackGraphs: updatedTrackGraphs };
      if (currentUid) await setDoc(doc(db, "users", currentUid), updateObj, { merge: true });
      if (user.email) await setDoc(doc(db, "users", stableFallbackUid(user.email)), updateObj, { merge: true });
    } catch (e) {
      console.warn("selectTrack API error:", e);
    }
  };

  // ─── Create custom track ─────
  const createCustomTrack = async (trackTitleInput, trackDesc, topicsList) => {
    const trackId = `custom-${trackTitleInput.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

    const customTrackObj = {
      id: trackId,
      title: trackTitleInput,
      description: trackDesc,
      icon: "Sparkles",
      badge: "Custom Track"
    };

    const updatedCustomTracks = [...(user.customTracks || []), customTrackObj];
    setUser((prev) => ({ ...prev, track: trackId, trackTitle: trackTitleInput, customTracks: updatedCustomTracks }));

    try {
      const res = await fetch(`/api/dataset/skillgraph?track=${encodeURIComponent(trackId)}&customTopics=${encodeURIComponent(topicsList.join(","))}`);
      const data = await res.json();

      let graph = { nodes: [], edges: [] };
      if (data.success && data.graph && data.graph.nodes?.length > 0) {
        graph = data.graph;
      } else {
        graph = {
          nodes: topicsList.map((t, idx) => ({ id: `node-${idx}`, topic: t, mastery: 0, status: "weak", category: "Custom" })),
          edges: topicsList.slice(0, -1).map((_, idx) => ({ from: `node-${idx}`, to: `node-${idx + 1}` }))
        };
      }

      setSkillGraph(graph);
      customTrackObj.graph = graph;

      const updateObj = {
        track: trackId,
        trackTitle: trackTitleInput,
        customTracks: updatedCustomTracks,
        skillGraph: graph
      };

      if (currentUid) await setDoc(doc(db, "users", currentUid), updateObj, { merge: true });
      if (user.email) await setDoc(doc(db, "users", stableFallbackUid(user.email)), updateObj, { merge: true });
    } catch (e) {
      console.warn("createCustomTrack API error:", e);
    }
  };

  // ─── Resume analysis ──────────
  const analyzeAndStoreResume = async (fileName, textContent) => {
    setUser((prev) => ({ ...prev, resumeUploaded: true, resumeFileName: fileName }));

    try {
      const res = await fetch("/api/dataset/resume-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: textContent })
      });
      const data = await res.json();

      if (data.success) {
        const extracted = data.extractedSkills || [];

        const updatedNodes = skillGraph.nodes.map((node) => {
          const isMatch = extracted.some((kw) => node.topic.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(node.topic.toLowerCase().substring(0, 5)));
          if (isMatch) {
            const newMastery = Math.min(95, node.mastery + 25);
            return { ...node, mastery: newMastery, status: newMastery >= 70 ? "strong" : "ok" };
          }
          return node;
        });

        const updatedGraph = { ...skillGraph, nodes: updatedNodes };
        setSkillGraph(updatedGraph);
        setUser((prev) => ({ ...prev, extractedSkills: extracted }));

        await setDoc(doc(db, "users", currentUid), {
          resumeUploaded: true,
          resumeFileName: fileName,
          extractedSkills: extracted,
          skillGraph: updatedGraph,
          resumeGapAnalysis: data.gapAnalysis || null
        }, { merge: true });
      }
    } catch (e) {
      console.warn("analyzeAndStoreResume API error:", e);
    }
  };

  const uploadResume = async (fileName) => {
    await analyzeAndStoreResume(fileName, "");
  };

  const addXP = async (amount) => {
    const newXp = (user.xp || 0) + amount;
    const newQuestions = (user.questionsAnswered || 0) + 1;
    const currentStreakVal = user.streak?.current || 1;

    setUser((prev) => ({ ...prev, xp: newXp, questionsAnswered: newQuestions }));

    try {
      await setDoc(doc(db, "users", currentUid), { xp: newXp, questionsAnswered: newQuestions }, { merge: true });

      const leagueId = user.leagueId || "league_gold";
      await setDoc(doc(db, "leagues", leagueId, "members", currentUid), {
        name: user.name || "Candidate",
        xp: newXp,
        streak: currentStreakVal,
        avatar: "⚡"
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore addXP update:", e);
    }
  };

  const updateSkillNode = async (nodeTopic, scoreDelta) => {
    const updatedNodes = skillGraph.nodes.map((node) => {
      if (node.topic.toLowerCase() === nodeTopic.toLowerCase() || node.id === nodeTopic) {
        const newMastery = Math.min(100, Math.max(0, node.mastery + scoreDelta));
        let newStatus = "weak";
        if (newMastery >= 70) newStatus = "strong";
        else if (newMastery >= 40) newStatus = "ok";
        return { ...node, mastery: newMastery, status: newStatus };
      }
      return node;
    });

    const updatedGraph = { ...skillGraph, nodes: updatedNodes };
    setSkillGraph(updatedGraph);

    if (user.track) {
      const updatedTrackGraphs = { ...(user.trackGraphs || {}), [user.track]: updatedGraph };
      setUser((prev) => ({ ...prev, trackGraphs: updatedTrackGraphs }));
      try {
        await setDoc(doc(db, "users", currentUid), { skillGraph: updatedGraph, trackGraphs: updatedTrackGraphs }, { merge: true });
      } catch (e) {
        console.warn("Firestore updateSkillNode:", e);
      }
    }
  };

  const setSkillNodeMastery = async (nodeTopic, exactMastery) => {
    const updatedNodes = skillGraph.nodes.map((node) => {
      if (node.topic.toLowerCase() === nodeTopic.toLowerCase() || node.id === nodeTopic) {
        const newMastery = Math.min(100, Math.max(0, exactMastery));
        let newStatus = "weak";
        if (newMastery >= 70) newStatus = "strong";
        else if (newMastery >= 40) newStatus = "ok";
        return { ...node, mastery: newMastery, status: newStatus };
      }
      return node;
    });

    const updatedGraph = { ...skillGraph, nodes: updatedNodes };
    setSkillGraph(updatedGraph);

    if (user.track) {
      const updatedTrackGraphs = { ...(user.trackGraphs || {}), [user.track]: updatedGraph };
      setUser((prev) => ({ ...prev, trackGraphs: updatedTrackGraphs }));
      try {
        await setDoc(doc(db, "users", currentUid), { skillGraph: updatedGraph, trackGraphs: updatedTrackGraphs }, { merge: true });
      } catch (e) {
        console.warn("Firestore setSkillNodeMastery:", e);
      }
    }
  };

  const recordPracticeEvaluation = async ({ topic, prompt, answerText, score, xpAwarded, feedback }) => {
    if (xpAwarded > 0) {
      await addXP(xpAwarded);
    }
    const scoreDelta = score === 0 ? -15 : Math.round((score - 50) / 3);
    await updateSkillNode(topic, scoreDelta);

    const recordObj = {
      topic,
      questionPrompt: prompt,
      userAnswer: answerText,
      score,
      xpAwarded,
      feedback,
      timestamp: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "users", currentUid, "history"), recordObj);
    } catch (e) {
      console.warn("Firestore recordPracticeEvaluation:", e);
      setHistory((prev) => [recordObj, ...prev]);
    }
  };

  // ─── Streak Management ─────────────────────────────────────
  const updateStreak = async () => {
    const today = new Date().toISOString().split("T")[0];
    const lastActive = user.streak?.lastActiveDate?.split("T")[0];

    if (lastActive === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newCurrent = 1;
    if (lastActive === yesterday) {
      newCurrent = (user.streak?.current || 0) + 1;
    }

    const newStreak = {
      current: newCurrent,
      longest: Math.max(newCurrent, user.streak?.longest || 1),
      lastActiveDate: new Date().toISOString()
    };

    setUser((prev) => ({ ...prev, streak: newStreak }));

    try {
      await setDoc(doc(db, "users", currentUid), { streak: newStreak }, { merge: true });
      const leagueId = user.leagueId || "league_gold";
      await setDoc(doc(db, "leagues", leagueId, "members", currentUid), { streak: newCurrent }, { merge: true });
    } catch (e) {
      console.warn("Firestore updateStreak:", e);
    }
  };

  // ─── Username Update & Synchronization ─────────────────────
  const updateUserName = async (newName) => {
    const trimmed = (newName || "").trim();
    if (!trimmed) return;

    setUser((prev) => {
      const updated = { ...prev, name: trimmed };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("ascend_user", JSON.stringify(updated));
          localStorage.setItem("ascend_custom_username", trimmed);
        } catch (_) {}
      }
      return updated;
    });

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmed }).catch(() => {});
      }
      if (currentUid && currentUid !== "guest_demo") {
        await setDoc(doc(db, "users", currentUid), { name: trimmed }, { merge: true });
        const leagueId = user.leagueId || "league_gold";
        await setDoc(doc(db, "leagues", leagueId, "members", currentUid), { name: trimmed }, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore updateUserName notice:", e);
    }
  };

  // ─── Stable fallback UID generator (email-derived) ─────────
  const stableFallbackUid = (email) => {
    let hash = 0;
    const str = (email || "candidate").toLowerCase();
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return `fallback_${Math.abs(hash).toString(36)}`;
  };

  // ─── Auth Functions with Resilient Fallbacks ───────────────
  const loginWithFirebase = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      setCurrentUid(uid);
      let userData = {
        userId: uid,
        name: userCredential.user.displayName || email.split("@")[0] || "Candidate",
        email: userCredential.user.email || email,
        track: "",
        trackTitle: "",
        customTracks: [],
        trackGraphs: {},
        xp: 0,
        streak: { current: 1, longest: 1, lastActiveDate: new Date().toISOString() },
        leagueId: "league_gold",
        questionsAnswered: 0,
        resumeUploaded: false,
        resumeFileName: null,
        extractedSkills: [],
        createdAt: new Date().toISOString()
      };

      const existingDocData = await fetchFirestoreUser(uid, email);
      if (existingDocData) {
        userData = { ...userData, ...existingDocData };
        if (existingDocData.skillGraph && existingDocData.skillGraph.nodes?.length > 0) {
          setSkillGraph(existingDocData.skillGraph);
          if (typeof window !== "undefined") {
            localStorage.setItem("ascend_skillGraph", JSON.stringify(existingDocData.skillGraph));
          }
        }
      }

      setUser(userData);
      if (typeof window !== "undefined") {
        localStorage.setItem("ascend_user", JSON.stringify(userData));
        if (userData.name) localStorage.setItem("ascend_custom_username", userData.name);
      }
      return userData;
    } catch (err) {
      console.warn("Firebase sign in notice:", err.code || err.message);

      // If auth fails due to invalid credentials, wrong password, or deleted user account, throw error to UI!
      const errCode = err.code || "";
      if (
        errCode.includes("user-not-found") ||
        errCode.includes("wrong-password") ||
        errCode.includes("invalid-credential") ||
        errCode.includes("user-disabled")
      ) {
        throw new Error("Invalid email or password. If you deleted your account, please sign up again.");
      }

      const stableId = stableFallbackUid(email);
      setCurrentUid(stableId);
      let fallbackUser = {
        userId: stableId,
        name: email.split("@")[0] || "Candidate",
        email: email,
        xp: 0,
        streak: { current: 1, longest: 1, lastActiveDate: new Date().toISOString() },
        leagueId: "league_gold",
        questionsAnswered: 0
      };

      const existingDocData = await fetchFirestoreUser(stableId, email);
      if (existingDocData) {
        fallbackUser = { ...fallbackUser, ...existingDocData };
        if (existingDocData.skillGraph && existingDocData.skillGraph.nodes?.length > 0) {
          setSkillGraph(existingDocData.skillGraph);
        }
      } else {
        await setDoc(doc(db, "users", stableId), fallbackUser, { merge: true }).catch(() => { });
      }

      setUser((prev) => {
        const updated = { ...prev, ...fallbackUser };
        if (typeof window !== "undefined" && updated.track) {
          localStorage.setItem("ascend_user", JSON.stringify(updated));
        }
        return updated;
      });
      return fallbackUser;
    }
  };

  const signupWithFirebase = async (name, email, password) => {
    const stableId = stableFallbackUid(email);
    const newUserObj = {
      userId: stableId,
      name: name || email.split("@")[0] || "Candidate",
      email,
      track: "",
      trackTitle: "",
      customTracks: [],
      xp: 0,
      streak: { current: 1, longest: 1, lastActiveDate: new Date().toISOString() },
      leagueId: "league_gold",
      questionsAnswered: 0,
      resumeUploaded: false,
      resumeFileName: null,
      extractedSkills: [],
      createdAt: new Date().toISOString(),
      skillGraph: { nodes: [], edges: [] }
    };

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const u = userCredential.user;
      newUserObj.userId = u.uid;
      setCurrentUid(u.uid);

      const userSnap = await getDoc(doc(db, "users", u.uid));
      if (userSnap.exists()) {
        const existingData = userSnap.data();
        const mergedUser = { ...newUserObj, ...existingData };
        setUser((prev) => ({ ...prev, ...mergedUser }));
        if (existingData.skillGraph && existingData.skillGraph.nodes?.length > 0) setSkillGraph(existingData.skillGraph);
        return mergedUser;
      } else {
        await setDoc(doc(db, "users", u.uid), newUserObj, { merge: true }).catch(console.warn);
        setUser((prev) => ({ ...prev, ...newUserObj }));
        return u;
      }
    } catch (err) {
      console.warn("Firebase signup notice:", err.message);
      try {
        const userSnap = await getDoc(doc(db, "users", stableId));
        if (userSnap.exists()) {
          const existingData = userSnap.data();
          const mergedUser = { ...newUserObj, ...existingData };
          setUser((prev) => ({ ...prev, ...mergedUser }));
          if (existingData.skillGraph && existingData.skillGraph.nodes?.length > 0) setSkillGraph(existingData.skillGraph);
          return mergedUser;
        } else {
          await setDoc(doc(db, "users", stableId), newUserObj, { merge: true });
        }
      } catch (_) { }
      setUser((prev) => ({ ...prev, ...newUserObj }));
      return newUserObj;
    }
  };

  const signInWithGoogleFirebase = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      console.warn("Google sign in notice:", err.message);
      const stableId = stableFallbackUid("candidate@gmail.com");
      const googleUser = {
        userId: stableId,
        name: "Google Candidate",
        email: "candidate@gmail.com",
        xp: 0,
        streak: { current: 1, longest: 1, lastActiveDate: new Date().toISOString() }
      };
      setUser((prev) => ({ ...prev, ...googleUser }));
      return googleUser;
    }
  };

  const signInWithGithubFirebase = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      return result.user;
    } catch (err) {
      console.warn("GitHub sign in notice:", err.message);
      const stableId = stableFallbackUid("candidate@github.com");
      const githubUser = {
        userId: stableId,
        name: "GitHub Candidate",
        email: "candidate@github.com",
        xp: 0,
        streak: { current: 1, longest: 1, lastActiveDate: new Date().toISOString() }
      };
      setUser((prev) => ({ ...prev, ...githubUser }));
      return githubUser;
    }
  };

  const sendPasswordResetFirebase = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      console.warn("Password reset notice:", err.message);
    }
  };

  const logoutFirebase = async () => {
    setCurrentUid("guest_demo");
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Sign out notice:", err.message);
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("ascend_user");
        localStorage.removeItem("ascend_skillGraph");
        localStorage.removeItem("ascend_custom_username");
        localStorage.removeItem("ascend_history");
      } catch (_) { }
    }
    setUser({
      userId: "guest_demo",
      name: "Candidate",
      email: "",
      track: "",
      trackTitle: "",
      customTracks: [],
      xp: 0,
      streak: { current: 0, longest: 0, lastActiveDate: new Date().toISOString() },
      leagueId: "league_gold",
      questionsAnswered: 0,
      resumeUploaded: false,
      resumeFileName: null,
      extractedSkills: [],
      createdAt: new Date().toISOString()
    });
    setSkillGraph({ nodes: [], edges: [] });
  };

  const deleteAccountAndData = async () => {
    try {
      // 1. Delete main user doc & league entry in Firestore
      if (currentUid && currentUid !== "guest_demo") {
        await deleteDoc(doc(db, "users", currentUid)).catch(() => { });
        const leagueId = user.leagueId || "league_gold";
        await deleteDoc(doc(db, "leagues", leagueId, "members", currentUid)).catch(() => { });
      }
      if (user.email) {
        const altId = stableFallbackUid(user.email);
        await deleteDoc(doc(db, "users", altId)).catch(() => { });
        const leagueId = user.leagueId || "league_gold";
        await deleteDoc(doc(db, "leagues", leagueId, "members", altId)).catch(() => { });
      }

      // 2. Permanently delete Firebase Auth User account
      if (auth.currentUser) {
        await deleteUser(auth.currentUser).catch((err) => {
          console.warn("Firebase deleteUser warning:", err);
        });
      }

      // 3. Sign out
      await signOut(auth).catch(() => { });
    } catch (e) {
      console.warn("Delete account error:", e);
    }

    // 4. Wipe browser storage and reset memory
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
      } catch (_) { }
    }

    setUser({
      userId: "guest_demo",
      name: "Candidate",
      email: "",
      track: "",
      trackTitle: "",
      customTracks: [],
      xp: 0,
      streak: { current: 0, longest: 0, lastActiveDate: new Date().toISOString() },
      leagueId: "league_gold",
      questionsAnswered: 0,
      resumeUploaded: false,
      resumeFileName: null,
      extractedSkills: [],
      createdAt: new Date().toISOString()
    });
    setSkillGraph({ nodes: [], edges: [] });
    setHistory([]);
  };

  const clearAllFirebaseData = deleteAccountAndData;

  const enterGuestDemoMode = async () => {
    setCurrentUid("guest_demo");
    const demoUser = {
      userId: "guest_demo",
      name: "Demo Candidate / Judge",
      email: "demo@ascend.ai",
      track: "web-developer",
      trackTitle: "Web Developer",
      customTracks: [],
      xp: 500,
      streak: { current: 3, longest: 7, lastActiveDate: new Date().toISOString() },
      leagueId: "league_silver",
      questionsAnswered: 12,
      resumeUploaded: true,
      resumeFileName: "Demo_Software_Engineer_CV.pdf",
      extractedSkills: ["React", "JavaScript", "Node.js", "CSS", "REST APIs"],
      createdAt: new Date().toISOString()
    };
    setUser(demoUser);

    try {
      const res = await fetch("/api/dataset/skillgraph?track=web-developer");
      const data = await res.json();
      if (data.success && data.graph && data.graph.nodes?.length > 0) {
        setSkillGraph(data.graph);
        const updatedUser = { ...demoUser, skillGraph: data.graph };
        setUser(updatedUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("ascend_user", JSON.stringify(updatedUser));
          localStorage.setItem("ascend_skillGraph", JSON.stringify(data.graph));
        }
      }
    } catch (err) {
      console.warn("Guest demo graph fetch notice:", err);
    }
    return demoUser;
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,
        updateUserName,
        loadingAuth,
        track: user.track,
        trackTitle: user.trackTitle,
        selectTrack,
        createCustomTrack,
        analyzeAndStoreResume,
        skillGraph,
        setSkillGraph,
        leagueMembers,
        history,
        addXP,
        updateSkillNode,
        setSkillNodeMastery,
        updateStreak,
        recordPracticeEvaluation,
        uploadResume,
        loginWithFirebase,
        signupWithFirebase,
        signInWithGoogleFirebase,
        signInWithGithubFirebase,
        sendPasswordResetFirebase,
        logoutFirebase,
        clearAllFirebaseData,
        deleteAccountAndData,
        enterGuestDemoMode
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
