"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Clock,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquare,
} from "lucide-react";

/* ─── Types ─── */
interface Tweet {
  position: number;
  content: string;
  type: "hook" | "value" | "cta";
}

interface Thread {
  id: string;
  title: string;
  content: Tweet[];
  platform: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function HistoryPage() {
  const { status } = useSession();
  const router = useRouter();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Thread | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchThreads = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/threads?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads);
        setPagination(data.pagination);
      }
    } catch {
      // API not available — try localStorage fallback
      if (typeof window === "undefined") return;
      let stored: { id: string; topic: string; tweets: Tweet[]; createdAt: string }[] = [];
      try { stored = JSON.parse(localStorage.getItem("threadHistory") || "[]"); } catch { /* corrupted */ }
      const start = (page - 1) * 10;
      const sliced = stored.slice(start, start + 10);
      setThreads(
        sliced.map((s: { id: string; topic: string; tweets: Tweet[]; createdAt: string }) => ({
          id: s.id,
          title: s.topic,
          content: s.tweets,
          platform: "twitter",
          createdAt: s.createdAt,
        }))
      );
      setPagination({
        page,
        limit: 10,
        total: stored.length,
        totalPages: Math.ceil(stored.length / 10),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetchThreads(1);
    }
  }, [status, router, fetchThreads]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/threads/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setThreads((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
        toast("Thread deleted");
      }
    } catch {
      // localStorage fallback
      if (typeof window === "undefined") return;
      let stored: { id: string }[] = [];
      try { stored = JSON.parse(localStorage.getItem("threadHistory") || "[]"); } catch { /* corrupted */ }
      const filtered = stored.filter(
        (s: { id: string }) => s.id !== deleteTarget.id
      );
      localStorage.setItem("threadHistory", JSON.stringify(filtered));
      setThreads((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    } finally {
      setDeleteTarget(null);
      setIsDeleting(false);
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchThreads(page);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800 p-6">
              <div className="flex justify-between">
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2 ml-4">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Empty state ─── */
  if (threads.length === 0 && !isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">History</h1>
        <p className="text-gray-400 mb-8">
          View and manage your previously generated threads.
        </p>
        <Card className="bg-gray-900 border-gray-800 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No threads yet</p>
          <p className="text-gray-600 text-sm mb-6">
            Generate your first thread and it will appear here.
          </p>
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Link href="/generate">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Thread
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  /* ─── Main view ─── */
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">History</h1>
        <p className="text-gray-400">
          {pagination.total} thread{pagination.total !== 1 ? "s" : ""} generated
        </p>
      </div>

      {/* Thread cards */}
      <div className="space-y-4 mb-8">
        {threads.map((thread) => {
          const firstTweet = thread.content?.[0];
          const preview = firstTweet?.content || "No preview available";

          return (
            <Card
              key={thread.id}
              className="bg-gray-900 border-gray-800 p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="text-white font-semibold text-base mb-2 truncate">
                    {thread.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {preview}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(thread.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {thread.content?.length || 0} tweets
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                      {thread.platform}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={() => setSelectedThread(thread)}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    onClick={() => setDeleteTarget(thread)}
                    size="sm"
                    variant="outline"
                    className="border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              size="sm"
              variant="outline"
              className="border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              size="sm"
              variant="outline"
              className="border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-30"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── View Thread Modal ─── */}
      <Dialog
        open={!!selectedThread}
        onOpenChange={(open) => !open && setSelectedThread(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedThread?.title}</DialogTitle>
            <DialogDescription>
              {selectedThread?.content?.length} tweets &middot;{" "}
              {selectedThread && formatDate(selectedThread.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mt-4">
            {selectedThread?.content?.map((tweet) => {
              const typeLabel =
                tweet.type === "hook"
                  ? "Hook"
                  : tweet.type === "cta"
                  ? "CTA"
                  : "Value";

              return (
                <div
                  key={tweet.position}
                  className="flex gap-3 p-4 rounded-lg bg-gray-900 border border-gray-800"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-400 flex-shrink-0">
                    {tweet.position}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          tweet.type === "hook"
                            ? "bg-amber-500/10 text-amber-400"
                            : tweet.type === "cta"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-indigo-500/10 text-indigo-400"
                        }`}
                      >
                        {typeLabel}
                      </span>
                      <span className="text-xs text-gray-600">
                        {tweet.content.length}/280
                      </span>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {tweet.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Modal ─── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Thread</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() => setDeleteTarget(null)}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
