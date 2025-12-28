import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("task procedures", () => {
  it("creates a task successfully", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.task.create({
      name: "Test Task",
      description: "This is a test task",
      dueDate: "2025-12-28",
      dueTime: "14:30",
    });

    expect(result).toBeDefined();
  });

  it("lists tasks by date", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a task first
    await caller.task.create({
      name: "Task for Today",
      description: "Test",
      dueDate: "2025-12-28",
      dueTime: "10:00",
    });

    const tasks = await caller.task.listByDate({
      date: "2025-12-28",
    });

    expect(Array.isArray(tasks)).toBe(true);
  });

  it("lists all tasks", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const tasks = await caller.task.listAll();

    expect(Array.isArray(tasks)).toBe(true);
  });

  it("updates a task", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a task first
    const created = await caller.task.create({
      name: "Task to Update",
      description: "Test",
      dueDate: "2025-12-28",
      dueTime: "15:00",
    });

    // Get the task ID from the result
    const tasks = await caller.task.listByDate({
      date: "2025-12-28",
    });

    if (tasks.length > 0) {
      const taskId = tasks[tasks.length - 1].id;
      const result = await caller.task.update({
        id: taskId,
        completed: 1,
      });

      expect(result).toBeDefined();
    }
  });

  it("deletes a task", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a task first
    await caller.task.create({
      name: "Task to Delete",
      description: "Test",
      dueDate: "2025-12-28",
      dueTime: "16:00",
    });

    const tasks = await caller.task.listByDate({
      date: "2025-12-28",
    });

    if (tasks.length > 0) {
      const taskId = tasks[tasks.length - 1].id;
      const result = await caller.task.delete({
        id: taskId,
      });

      expect(result).toBeDefined();
    }
  });
});

describe("feedback procedures", () => {
  it("submits feedback successfully", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.feedback.submit({
      rating: 5,
      comment: "Great app!",
    });

    expect(result).toBeDefined();
  });

  it("submits feedback with rating only", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.feedback.submit({
      rating: 4,
    });

    expect(result).toBeDefined();
  });
});
