import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createTask, getTasksByUserAndDate, getTasksByUser, updateTask, deleteTask, submitFeedback } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  task: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Task name is required"),
        description: z.string().optional(),
        dueDate: z.string(),
        dueTime: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createTask({
          userId: ctx.user.id,
          name: input.name,
          description: input.description || null,
          dueDate: input.dueDate,
          dueTime: input.dueTime,
          completed: 0,
          notificationSent: 0,
        });
      }),

    listByDate: protectedProcedure
      .input(z.object({
        date: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return await getTasksByUserAndDate(ctx.user.id, input.date);
      }),

    listAll: protectedProcedure
      .query(async ({ ctx }) => {
        return await getTasksByUser(ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        completed: z.number().optional(),
        notificationSent: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const updates: Record<string, number> = {};
        if (input.completed !== undefined) updates.completed = input.completed;
        if (input.notificationSent !== undefined) updates.notificationSent = input.notificationSent;
        return await updateTask(input.id, updates as any);
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await deleteTask(input.id);
      }),
  }),

  feedback: router({
    submit: protectedProcedure
      .input(z.object({
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await submitFeedback({
          userId: ctx.user.id,
          rating: input.rating,
          comment: input.comment || null,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
