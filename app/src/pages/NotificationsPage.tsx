import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Notification } from "@/types/database";
import { formatRelative } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 30;

export function NotificationsPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [page, setPage] = useState(0);

  const { data } = useQuery({
    queryKey: ["all-notifications", session?.user.id, page],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { rows: (data ?? []) as Notification[], total: count ?? 0 };
    },
  });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Thông báo</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (!session) return;
            await supabase
              .from("notifications")
              .update({ is_read: true })
              .eq("user_id", session.user.id)
              .eq("is_read", false);
            qc.invalidateQueries({ queryKey: ["all-notifications", session.user.id] });
            qc.invalidateQueries({ queryKey: ["notifications", session.user.id] });
          }}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <BellOff className="h-8 w-8" />
            <p className="text-sm">Bạn chưa có thông báo nào.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-1">
          {rows.map((n) => (
            <li key={n.id}>
              <Card
                className="cursor-pointer transition-colors hover:bg-accent/40"
                onClick={async () => {
                  if (!n.is_read) {
                    await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
                    qc.invalidateQueries({ queryKey: ["all-notifications", session!.user.id] });
                    qc.invalidateQueries({ queryKey: ["notifications", session!.user.id] });
                  }
                  if (n.task_id) navigate(`/tasks/${n.task_id}`);
                }}
              >
                <CardContent className="flex items-start gap-3 p-3">
                  {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-info" />}
                  <div className="flex-1">
                    <p className={n.is_read ? "text-muted-foreground" : ""}>{n.message}</p>
                    <p className="text-xs text-muted-foreground">{formatRelative(n.created_at)}</p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {total > 0 && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      )}
    </div>
  );
}
