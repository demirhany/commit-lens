"use client";

import { useState } from "react";
import { AlertTriangle, ListChecks, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer, toast } from "@/components/ui/Toast";
import { SpecificationCard } from "@/components/specifications/SpecificationCard";
import { SpecificationFormModal } from "@/components/specifications/SpecificationFormModal";
import { useSpecifications } from "@/hooks/useSpecifications";
import { deleteSpecification } from "@/lib/specificationApi";
import { formatApiError } from "@/lib/utils";
import type { SpecificationResponse } from "@/lib/types";

export function SpecificationsView() {
  const { specifications, loading, error, refetch } = useSpecifications();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SpecificationResponse | null>(null);
  const [toDelete, setToDelete] = useState<SpecificationResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (spec: SpecificationResponse) => {
    setEditing(spec);
    setFormOpen(true);
  };

  const handleSaved = (spec: SpecificationResponse) => {
    setFormOpen(false);
    toast(`Specification "${spec.profileName}" ${editing ? "updated" : "created"}.`, "success");
    void refetch();
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await deleteSpecification(toDelete.id);
      if (!res.success) {
        toast(formatApiError(res, "Could not delete the specification."), "error");
      } else {
        toast(`Specification "${toDelete.profileName}" deleted.`, "success");
        setToDelete(null);
        void refetch();
      }
    } catch {
      toast("Network error — could not reach the server.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 px-5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <ListChecks size={16} className="text-indigo-500" />
          <h1 className="text-sm font-semibold">Specifications</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={openCreate}>
            <Plus size={13} /> New specification
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto mt-16 flex max-w-sm flex-col items-center gap-3 text-center">
            <AlertTriangle className="text-rose-500" size={28} />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCw size={13} /> Retry
            </Button>
          </div>
        ) : specifications.length === 0 ? (
          <div className="mx-auto mt-16 flex max-w-sm flex-col items-center gap-3 text-center">
            <ListChecks className="text-zinc-400" size={28} />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No specifications yet. Create a custom commit profile to get started.
            </p>
            <Button size="sm" onClick={openCreate}>
              <Plus size={13} /> New specification
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {specifications.map((spec) => (
              <SpecificationCard
                key={spec.id}
                spec={spec}
                onEdit={openEdit}
                onDelete={setToDelete}
              />
            ))}
          </div>
        )}
      </main>

      <SpecificationFormModal
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <Modal
        open={!!toDelete}
        onClose={() => !deleting && setToDelete(null)}
        size="md"
        title={<h2 className="text-base font-semibold">Delete specification</h2>}
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Are you sure you want to delete{" "}
          <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {toDelete?.profileName}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={deleting} onClick={handleConfirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  );
}
