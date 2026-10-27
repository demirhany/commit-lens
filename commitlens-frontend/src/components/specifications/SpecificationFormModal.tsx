"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn, formatApiError } from "@/lib/utils";
import { createSpecification, updateSpecification } from "@/lib/specificationApi";
import type {
  ScopePolicy,
  SpecificationItemRequest,
  SpecificationResponse,
} from "@/lib/types";

interface SpecificationFormModalProps {
  open: boolean;
  /** When provided the form edits this spec, otherwise it creates a new one */
  editing: SpecificationResponse | null;
  onClose: () => void;
  onSaved: (spec: SpecificationResponse) => void;
}

interface ItemDraft {
  name: string;
  description: string;
}

const POLICIES: { value: ScopePolicy; label: string; hint: string }[] = [
  { value: "OPTIONAL", label: "Optional", hint: "Scopes may be used" },
  { value: "REQUIRED", label: "Required", hint: "At least one scope needed" },
  { value: "DISABLED", label: "Disabled", hint: "Scopes not allowed" },
];

const INPUT_BASE =
  "rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50";

const INPUT = cn(INPUT_BASE, "w-full");

const toDrafts = (items?: { name: string; description?: string | null }[]): ItemDraft[] =>
  (items ?? []).map((i) => ({ name: i.name, description: i.description ?? "" }));

const toRequests = (items: ItemDraft[]): SpecificationItemRequest[] =>
  items.map((i) => ({
    name: i.name.trim(),
    description: i.description.trim() || null,
  }));

function validate(
  profileName: string,
  description: string,
  policy: ScopePolicy,
  types: ItemDraft[],
  scopes: ItemDraft[]
): string[] {
  const errors: string[] = [];
  if (!profileName.trim()) {
    errors.push("Profile name is required.");
  } else if (profileName.trim().length > 50) {
    errors.push("Profile name must not exceed 50 characters.");
  }
  if (description.trim().length > 255) {
    errors.push("Description must not exceed 255 characters.");
  }
  if (types.length === 0) errors.push("At least one type is required.");
  if (types.some((t) => !t.name.trim())) errors.push("Every type needs a name.");
  if (types.some((t) => t.name.trim().length > 50)) {
    errors.push("Type name must not exceed 50 characters.");
  }
  if (types.some((t) => t.description.trim().length > 255)) {
    errors.push("Type description must not exceed 255 characters.");
  }
  const typeNames = types.map((t) => t.name.trim()).filter(Boolean);
  if (new Set(typeNames).size !== typeNames.length) errors.push("Type names must be unique.");
  if (policy !== "DISABLED") {
    if (scopes.some((s) => !s.name.trim())) errors.push("Every scope needs a name.");
    if (scopes.some((s) => s.name.trim().length > 50)) {
      errors.push("Scope name must not exceed 50 characters.");
    }
    if (scopes.some((s) => s.description.trim().length > 255)) {
      errors.push("Scope description must not exceed 255 characters.");
    }
    const scopeNames = scopes.map((s) => s.name.trim()).filter(Boolean);
    if (new Set(scopeNames).size !== scopeNames.length) errors.push("Scope names must be unique.");
  }
  if (policy === "REQUIRED" && scopes.length === 0)
    errors.push("At least one scope is required when the scope policy is REQUIRED.");
  return errors;
}

export function SpecificationFormModal(props: SpecificationFormModalProps) {
  // Re-mount the form body whenever the target changes so state is re-initialised.
  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      size="lg"
      title={
        <h2 className="text-base font-semibold">
          {props.editing ? "Edit specification" : "New specification"}
        </h2>
      }
    >
      <SpecificationForm key={props.editing?.id ?? "new"} {...props} />
    </Modal>
  );
}

function SpecificationForm({ editing, onClose, onSaved }: SpecificationFormModalProps) {
  const [profileName, setProfileName] = useState(editing?.profileName ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [scopePolicy, setScopePolicy] = useState<ScopePolicy>(editing?.scopePolicy ?? "OPTIONAL");
  const [types, setTypes] = useState<ItemDraft[]>(
    editing ? toDrafts(editing.types) : [{ name: "", description: "" }]
  );
  const [scopes, setScopes] = useState<ItemDraft[]>(toDrafts(editing?.scopes));
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const scopesDisabled = scopePolicy === "DISABLED";

  const handlePolicyChange = (policy: ScopePolicy) => {
    setScopePolicy(policy);
    if (policy === "DISABLED") setScopes([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validate(profileName, description, scopePolicy, types, scopes);
    setErrors(clientErrors);
    if (clientErrors.length > 0) return;

    const payload = {
      profileName: profileName.trim(),
      description: description.trim() || null,
      scopePolicy,
      types: toRequests(types),
      scopes: scopesDisabled ? [] : toRequests(scopes),
    };

    setSubmitting(true);
    try {
      const res = editing
        ? await updateSpecification(editing.id, payload)
        : await createSpecification(payload);
      if (!res.success || !res.data) {
        // Backend validation errors arrive in `details` (e.g. duplicate name)
        setErrors(
          res.details?.length
            ? res.details
            : [formatApiError(res, "Could not save the specification.")]
        );
      } else {
        onSaved(res.data);
      }
    } catch {
      setErrors(["Network error — could not reach the server."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* profileName */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Profile name <span className="text-rose-500">*</span>
        </label>
        <input
          className={INPUT}
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder="e.g. backend-team"
          maxLength={50}
          autoFocus
        />
      </div>

      {/* description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Description</label>
        <textarea
          className={cn(INPUT, "resize-none")}
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
          maxLength={255}
        />
      </div>

      {/* scopePolicy */}
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Scope policy
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {POLICIES.map((p) => (
            <label
              key={p.value}
              className={cn(
                "flex cursor-pointer flex-col gap-0.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                scopePolicy === p.value
                  ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              )}
            >
              <span className="flex items-center gap-2 font-medium">
                <input
                  type="radio"
                  name="scopePolicy"
                  className="accent-indigo-500"
                  checked={scopePolicy === p.value}
                  onChange={() => handlePolicyChange(p.value)}
                />
                {p.label}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{p.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* types */}
      <ItemListEditor
        label="Types"
        required
        hint="At least one type is required."
        items={types}
        onChange={setTypes}
        namePlaceholder="e.g. feat"
      />

      {/* scopes */}
      <ItemListEditor
        label="Scopes"
        hint={
          scopePolicy === "REQUIRED"
            ? "At least one scope is required for the REQUIRED policy."
            : scopesDisabled
            ? "Scopes are disabled for this policy."
            : "Optional."
        }
        hintTone={scopePolicy === "REQUIRED" && scopes.length === 0 ? "warn" : "muted"}
        items={scopes}
        onChange={setScopes}
        disabled={scopesDisabled}
        namePlaceholder="e.g. api"
      />

      {/* errors */}
      {errors.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-600 dark:text-rose-300"
        >
          <ul className="list-disc space-y-0.5 pl-4">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          {editing ? "Save changes" : "Create"}
        </Button>
      </div>
    </form>
  );
}

// ─── Dynamic name/description list ────────────────────────────────────────────
interface ItemListEditorProps {
  label: string;
  hint?: string;
  hintTone?: "muted" | "warn";
  required?: boolean;
  disabled?: boolean;
  items: ItemDraft[];
  onChange: (items: ItemDraft[]) => void;
  namePlaceholder: string;
}

function ItemListEditor({
  label,
  hint,
  hintTone = "muted",
  required,
  disabled,
  items,
  onChange,
  namePlaceholder,
}: ItemListEditorProps) {
  const update = (idx: number, patch: Partial<ItemDraft>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <div className={cn("flex flex-col gap-2", disabled && "opacity-60")}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {label} {required && <span className="text-rose-500">*</span>}
            <span className="ml-1.5 text-zinc-400">({items.length})</span>
          </span>
          {hint && (
            <p
              className={cn(
                "text-[11px]",
                hintTone === "warn"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              {hint}
            </p>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => onChange([...items, { name: "", description: "" }])}
        >
          <Plus size={12} /> Add
        </Button>
      </div>

      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            className={cn(INPUT_BASE, "w-36 sm:w-44 shrink-0 font-mono")}
            value={item.name}
            disabled={disabled}
            onChange={(e) => update(idx, { name: e.target.value })}
            placeholder={namePlaceholder}
            maxLength={50}
            aria-label={`${label} name`}
          />
          <input
            className={cn(INPUT_BASE, "flex-1 min-w-0")}
            value={item.description}
            disabled={disabled}
            onChange={(e) => update(idx, { description: e.target.value })}
            placeholder="Description (optional)"
            maxLength={255}
            aria-label={`${label} description`}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            aria-label={`Remove ${label} item`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer disabled:pointer-events-none"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
