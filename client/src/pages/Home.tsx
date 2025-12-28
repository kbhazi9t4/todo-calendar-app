import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  // Form states
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskTime, setTaskTime] = useState("09:00");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  // tRPC queries and mutations
  const { data: tasks = [], refetch: refetchTasks } = trpc.task.listByDate.useQuery(
    { date: selectedDate },
    { enabled: isAuthenticated }
  );

  const createTaskMutation = trpc.task.create.useMutation({
    onSuccess: () => {
      toast.success("Task created successfully!");
      setTaskName("");
      setTaskDescription("");
      setTaskTime("09:00");
      setShowCreateTask(false);
      refetchTasks();
      requestNotificationPermission();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    },
  });

  const updateTaskMutation = trpc.task.update.useMutation({
    onSuccess: () => {
      refetchTasks();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update task");
    },
  });

  const deleteTaskMutation = trpc.task.delete.useMutation({
    onSuccess: () => {
      toast.success("Task deleted");
      refetchTasks();
      setTaskToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete task");
    },
  });

  const submitFeedbackMutation = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
      setFeedbackRating(5);
      setFeedbackComment("");
      setShowFeedback(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit feedback");
    },
  });

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationPermission("granted");
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }
    }
  };

  // Check notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Schedule notifications for tasks
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAndNotify = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      tasks.forEach((task) => {
        if (task.dueTime === currentTime && !task.notificationSent && Notification.permission === "granted") {
          new Notification("Task Reminder", {
            body: `Time for: ${task.name}`,
            icon: "/favicon.ico",
          });
          updateTaskMutation.mutate({ id: task.id, notificationSent: 1 });
        }
      });
    };

    const interval = setInterval(checkAndNotify, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, isAuthenticated]);

  // Handle task creation
  const handleCreateTask = async () => {
    if (!taskName.trim()) {
      toast.error("Task name is required");
      return;
    }

    await createTaskMutation.mutateAsync({
      name: taskName,
      description: taskDescription,
      dueDate: selectedDate,
      dueTime: taskTime,
    });
  };

  // Handle task completion toggle
  const handleToggleTask = (taskId: number, completed: number) => {
    updateTaskMutation.mutate({
      id: taskId,
      completed: completed === 1 ? 0 : 1,
    });
  };

  // Handle task deletion
  const handleDeleteTask = (taskId: number) => {
    deleteTaskMutation.mutate({ id: taskId });
  };

  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    await submitFeedbackMutation.mutateAsync({
      rating: feedbackRating,
      comment: feedbackComment,
    });
  };

  // Calendar navigation
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === new Date().toISOString().split("T")[0];

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(dateStr)}
          className={`p-2 text-center rounded-lg text-sm font-semibold transition-all ${
            isSelected
              ? "bg-accent text-accent-foreground"
              : isToday
              ? "bg-muted text-foreground border-2 border-accent"
              : "hover:bg-muted text-foreground"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="mb-4">Welcome to Todo Calendar</h1>
          <p className="subtitle mb-8">Organize your tasks, stay on schedule, and never miss a deadline.</p>
          <a href={getLoginUrl()} className="inline-block px-8 py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl md:text-4xl">Todo Calendar</h1>
          <p className="subtitle mt-2">Stay organized and on schedule</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Calendar</h2>
                <div className="flex gap-2">
                  <button onClick={handlePrevMonth} className="p-1 hover:bg-muted rounded-lg transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={handleNextMonth} className="p-1 hover:bg-muted rounded-lg transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="mb-4 text-center font-semibold">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
            </Card>
          </div>

          {/* Tasks Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h2>
                <p className="subtitle mt-1">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</p>
              </div>
              <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus size={20} />
                    New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="task-name">Task Name *</Label>
                      <Input
                        id="task-name"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        placeholder="Enter task name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-description">Description</Label>
                      <Textarea
                        id="task-description"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="Enter task description (optional)"
                        className="mt-2 resize-none"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-time">Time (HH:MM format)</Label>
                      <Input
                        id="task-time"
                        type="time"
                        value={taskTime}
                        onChange={(e) => setTaskTime(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateTask(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateTask}
                        disabled={createTaskMutation.isPending}
                        className="flex-1"
                      >
                        {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No tasks for this date. Create one to get started!</p>
                </Card>
              ) : (
                tasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`p-4 transition-all ${task.completed ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => handleToggleTask(task.id, task.completed)}
                        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          task.completed
                            ? "bg-accent border-accent"
                            : "border-muted hover:border-accent"
                        }`}
                      >
                        {task.completed && <Check size={16} className="text-accent-foreground" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.name}
                        </h3>
                        {task.description && (
                          <p className={`text-sm mt-1 ${task.completed ? "text-muted-foreground" : "text-muted-foreground"}`}>
                            {task.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {task.dueTime}
                        </p>
                      </div>
                      <AlertDialog open={taskToDelete === task.id} onOpenChange={(open) => !open && setTaskToDelete(null)}>
                        <button
                          onClick={() => setTaskToDelete(task.id)}
                          className="flex-shrink-0 p-2 hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{task.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex gap-3">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTask(task.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Share Your Feedback</h3>
              <p className="subtitle mt-1">Help us improve your experience</p>
            </div>
            <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Star size={20} />
                  Give Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Share Your Feedback</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Rating</Label>
                    <div className="flex gap-2 mt-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          className={`text-2xl transition-transform ${
                            star <= feedbackRating ? "text-accent scale-110" : "text-muted"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="feedback-comment">Comments (optional)</Label>
                    <Textarea
                      id="feedback-comment"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Tell us what you think..."
                      className="mt-2 resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowFeedback(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitFeedback}
                      disabled={submitFeedbackMutation.isPending}
                      className="flex-1"
                    >
                      {submitFeedbackMutation.isPending ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Todo Calendar App. Designed with minimalism in mind.</p>
        </div>
      </footer>
    </div>
  );
}
