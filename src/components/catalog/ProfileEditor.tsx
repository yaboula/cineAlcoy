"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ProfileEditor — inline editable display name + emoji avatar picker
// Sprint R4
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { updateProfile } from "@/lib/supabase/profile";
import type { Profile } from "@/lib/supabase/types";

const AVATAR_EMOJIS = [
  "🎬", "🍿", "🎥", "🎞️", "📽️", "🎭", "🎪", "🌟",
  "🦊", "🐱", "🐶", "🦁", "🐻", "🐼", "🦉", "🐸",
  "🚀", "⚡", "🔥", "💎", "🎵", "🎮", "👾", "🤖",
];

interface ProfileEditorProps {
  profile: Profile;
  onUpdate: (changes: Partial<Pick<Profile, "display_name" | "avatar_emoji">>) => void;
}

export default function ProfileEditor({ profile, onUpdate }: ProfileEditorProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.display_name);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  // Focus on edit start
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;
    function onClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showEmojiPicker]);

  async function handleSaveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === profile.display_name) {
      setName(profile.display_name);
      setEditing(false);
      return;
    }
    setSaving(true);
    await updateProfile(profile.id, { display_name: trimmed });
    onUpdate({ display_name: trimmed });
    setSaving(false);
    setEditing(false);
  }

  async function handleEmojiSelect(emoji: string) {
    setShowEmojiPicker(false);
    if (emoji === profile.avatar_emoji) return;
    setSaving(true);
    await updateProfile(profile.id, { avatar_emoji: emoji });
    onUpdate({ avatar_emoji: emoji });
    setSaving(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSaveName();
    if (e.key === "Escape") { setName(profile.display_name); setEditing(false); }
  }

  return (
    <div className="flex items-center gap-5">
      {/* ── Avatar ── */}
      <div className="relative" ref={emojiRef}>
        <button
          onClick={() => setShowEmojiPicker((v) => !v)}
          className={cn(
            "w-20 h-20 rounded-full bg-surface border-2 border-border flex items-center justify-center text-4xl",
            "hover:border-accent-primary/50 transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
            saving && "opacity-60 pointer-events-none"
          )}
          aria-label="Cambiar avatar"
        >
          {profile.avatar_emoji}
        </button>

        {/* Emoji picker dropdown */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 p-3 bg-surface border border-border rounded-xl shadow-2xl shadow-black/50 z-30 grid grid-cols-8 gap-1.5 w-max"
            >
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center text-xl transition-all",
                    "hover:bg-surface-hover hover:scale-110",
                    emoji === profile.avatar_emoji && "bg-accent-primary/20 ring-1 ring-accent-primary"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Name ── */}
      <div>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={30}
              className="bg-surface border border-border rounded-lg px-3 py-1.5 text-lg font-bold text-text-primary outline-none focus:border-accent-primary transition-colors w-48"
            />
            <button
              onClick={handleSaveName}
              disabled={saving}
              className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors"
              aria-label="Guardar nombre"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setName(profile.display_name); setEditing(false); }}
              className="p-1.5 rounded-lg text-text-muted hover:bg-surface-hover transition-colors"
              aria-label="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              {profile.display_name}
            </h1>
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
              aria-label="Editar nombre"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
        <p className="text-sm text-text-muted mt-0.5">
          Miembro desde {new Date(profile.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}
