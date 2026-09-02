import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { deleteAccount } from "@/api/backend";
import { useToast } from "@/components/ui/use-toast";

const LOCAL_KEYS = ["cvforge.cvs.v1", "cvforge.active.v1", "cvforge.activeid.v1"];

export default function AccountSettingsDialog({ open, onClose }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const doDelete = async () => {
    setLoading(true);
    try {
      await deleteAccount();
      // Clear local-first CV data on this device.
      LOCAL_KEYS.forEach((k) => { try { localStorage.removeItem(k); } catch {} });
      toast({ title: "Account deleted", description: "Your account and local data have been removed." });
      onClose();
      setConfirm("");
      logout(false);
      window.location.href = "/";
    } catch (err) {
      toast({
        title: "Could not delete account",
        description: err?.message || "Please contact support to remove your account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setConfirm(""); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account settings</DialogTitle>
          <DialogDescription>Manage your account and data.</DialogDescription>
        </DialogHeader>
        {!user ? (
          <p className="text-sm text-muted-foreground py-2">
            You are not signed in. Account settings are only available for signed-in users.
          </p>
        ) : (
          <div className="space-y-4 py-2">
            <div className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{user.email}</span>
            </div>
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-destructive">
                <Trash2 size={16} /> Delete account
              </div>
              <p className="text-sm text-muted-foreground">
                This permanently deletes your account and the CVs saved on this device. This action cannot be undone.
              </p>
              <p className="text-sm">
                Type <span className="font-semibold">DELETE</span> to confirm:
              </p>
              <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" autoComplete="off" />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => { setConfirm(""); onClose(); }}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={loading || !user || confirm !== "DELETE"}
            onClick={doDelete}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}