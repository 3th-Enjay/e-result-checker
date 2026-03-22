import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, Check, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);

  const { data: unreadCount = { count: 0 } } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30000,
  });

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: open,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/notifications/${id}/read`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/notifications/mark-all-read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-xl" data-testid="button-notifications">
          <Bell className="w-5 h-5" />
          {unreadCount.count > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full border-0 bg-primary px-1 text-[10px] text-primary-foreground shadow-md">
              {unreadCount.count > 99 ? "99+" : unreadCount.count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[23rem] rounded-2xl border border-border/70 bg-background/92 p-0 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 text-base font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount.count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto rounded-full px-3 py-1 text-xs"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              {markAllReadMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="mr-1 h-3 w-3" /> Mark all read</>}
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="px-4 py-3 text-xs text-muted-foreground">
          <span className="status-dot text-chart-3">Secure alerts for approvals, rejections, and PIN activity</span>
        </div>
        <ScrollArea className="h-[320px] px-2 pb-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="mx-2 my-3 rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
              <ShieldCheck className="mx-auto mb-3 h-5 w-5 text-primary" />
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`mx-2 mb-2 flex cursor-pointer flex-col items-start gap-2 rounded-2xl border border-transparent p-0 outline-none ${!notification.isRead ? "bg-primary/5" : "bg-card/70"}`}
                onClick={() => {
                  if (!notification.isRead) {
                    markReadMutation.mutate(notification.id);
                  }
                }}
                data-testid={`notification-${notification.id}`}
              >
                <div className="w-full rounded-2xl border border-white/8 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1.5 h-2.5 w-2.5 rounded-full ${notification.isRead ? "bg-border" : "bg-primary"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold leading-5">{notification.title}</p>
                        {!notification.isRead && <Badge className="rounded-full border-0 bg-primary/12 text-primary">New</Badge>}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{notification.message}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

