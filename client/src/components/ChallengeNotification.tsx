import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { toast } from "sonner";
import { Bell, Trophy, Zap } from "lucide-react";

// Atom to store notifications
export const notificationsAtom = atomWithStorage<
  Array<{
    id: string;
    title: string;
    message: string;
    points: number;
    timestamp: number;
    read: boolean;
  }>
>("competency_notifications", []);

/**
 * Hook to trigger challenge completion notification
 */
export function useChallengeNotification() {
  const [notifications, setNotifications] = useAtom(notificationsAtom);

  const showChallengeComplete = (challengeName: string, pointsAwarded: number) => {
    const notificationId = `challenge-${Date.now()}`;

    // Add to notifications list
    setNotifications((prev) => [
      {
        id: notificationId,
        title: "أحسنت! 🎉",
        message: `أتممت تحدي "${challengeName}" وربحت ${pointsAwarded} نقطة`,
        points: pointsAwarded,
        timestamp: Date.now(),
        read: false,
      },
      ...prev,
    ]);

    // Show toast notification
    toast.success(
      <div className="flex items-center gap-3">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <div className="text-right">
          <p className="font-semibold">أحسنت! 🎉</p>
          <p className="text-sm">{`أتممت تحدي "${challengeName}" وربحت ${pointsAwarded} نقطة`}</p>
        </div>
      </div>,
      {
        duration: 4000,
        position: "top-left",
      }
    );
  };

  return { showChallengeComplete };
}

/**
 * Notification Bell Component for Navbar
 */
export function NotificationBell() {
  const [notifications] = useAtom(notificationsAtom);
  const [showDropdown, setShowDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 text-right">الإشعارات</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                    <div className="flex-1 text-right">
                      <p className="font-semibold text-slate-900">{notification.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500">
                          {new Date(notification.timestamp).toLocaleTimeString("ar-TN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          +{notification.points}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Example usage in a challenge completion handler
 */
export function useChallengeCompletionHandler() {
  const { showChallengeComplete } = useChallengeNotification();

  const handleChallengeCompletion = async (
    challengeName: string,
    pointsAwarded: number
  ) => {
    try {
      // Call backend to verify and record completion
      // await trpc.weeklyChallenges.completeChallenge.mutate({ challengeName });

      // Show notification
      showChallengeComplete(challengeName, pointsAwarded);

      // Optional: Trigger confetti animation
      if (typeof window !== "undefined" && "confetti" in window) {
        // @ts-ignore
        window.confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (error) {
      console.error("Error completing challenge:", error);
      toast.error("فشل في تسجيل إتمام التحدي");
    }
  };

  return { handleChallengeCompletion };
}
