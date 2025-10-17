"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Share2, Copy, Trash2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageShare } from "@/types/applicationTypes";

interface ShareDialogProps {
  pageId: string;
}

export function ShareDialog({ pageId }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState<PageShare[]>([]);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"view" | "comment" | "edit">(
    "view",
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadShares();
    }
  }, [open]);

  const loadShares = async () => {
    try {
      const response = await fetch(`/api/pages/${pageId}/shares`);
      if (response.ok) {
        const data = await response.json();
        setShares(data);
      }
    } catch (error) {
      console.error("Failed to load shares:", error);
    }
  };

  const handleShareWithEmail = async () => {
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/pages/${pageId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shared_with_email: email, permission }),
      });

      if (response.ok) {
        toast({ title: "Page shared successfully" });
        setEmail("");
        loadShares();
      }
    } catch (error) {
      toast({ title: "Failed to share page", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePublicLink = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pages/${pageId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: true, permission: "view" }),
      });

      if (response.ok) {
        toast({ title: "Public link created" });
        loadShares();
      }
    } catch (error) {
      toast({ title: "Failed to create public link", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
  };

  const handleDeleteShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/shares/${shareId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Share removed" });
        loadShares();
      }
    } catch (error) {
      toast({ title: "Failed to remove share", variant: "destructive" });
    }
  };

  const publicShare = shares.find((s) => s.is_public);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share page</DialogTitle>
          <DialogDescription>
            Share this page with others or create a public link
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Share with email</Label>
            <div className="flex gap-2">
              <Input
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Select
                value={permission}
                onValueChange={(v: "view" | "comment" | "edit") =>
                  setPermission(v)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleShareWithEmail}
              disabled={loading || !email}
              className="w-full"
            >
              Share
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Public link</Label>
            {publicShare ? (
              <div className="flex items-center gap-2 rounded-md border p-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 truncate text-sm">
                  Anyone with the link can view
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyLink(publicShare.public_token!)}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteShare(publicShare.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleCreatePublicLink}
                disabled={loading}
                variant="outline"
                className="w-full bg-transparent"
              >
                Create public link
              </Button>
            )}
          </div>

          {shares.filter((s) => !s.is_public).length > 0 && (
            <div className="space-y-2">
              <Label>Shared with</Label>
              <div className="space-y-2">
                {shares
                  .filter((s) => !s.is_public)
                  .map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {share.shared_with_email}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {share.permission}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteShare(share.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
