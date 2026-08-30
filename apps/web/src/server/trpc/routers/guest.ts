import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { checkRateLimit } from "@/lib/rate-limit";

/** Strip HTML tags & trim to prevent XSS */
function sanitize(str: string, maxLen = 500): string {
  return str
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLen);
}

export const guestRouter = router({
  // Public — guests can submit wishes without auth
  submitWish: publicProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        guestName: z.string().min(1).max(100),
        message: z.string().min(1).max(500),
        emoji: z.string().max(10).optional(),
        website: z.string().optional(), // honeypot
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Honeypot: bots fill hidden "website" field
      if (input.website) return { success: true, data: {} };

      const rl = checkRateLimit(`trpc-wish:${input.projectId}`, {
        limit: 10,
        windowSec: 60,
      });
      if (!rl.allowed)
        throw new Error("Quá nhiều yêu cầu, vui lòng thử lại sau");

      const { data, error } = await ctx.supabase
        .from("wishes")
        .insert({
          project_id: input.projectId,
          guest_name: sanitize(input.guestName, 100),
          message: sanitize(input.message, 500),
          emoji: sanitize(input.emoji || "❤️", 10),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { success: true, data };
    }),

  getWishes: publicProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from("wishes")
        .select("id, guest_name, message, emoji, created_at")
        .eq("project_id", input.projectId)
        .order("created_at", { ascending: false })
        .limit(50);

      return data || [];
    }),

  // Public — RSVP without auth
  submitRsvp: publicProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        guestName: z.string().min(1).max(100),
        status: z.enum(["confirmed", "declined", "maybe"]),
        guestCount: z.number().min(1).max(50).default(1),
        phone: z.string().max(20).optional(),
        website: z.string().optional(), // honeypot
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Honeypot: bots fill hidden "website" field
      if (input.website) return { success: true, data: {} };

      const rl = checkRateLimit(`trpc-rsvp:${input.projectId}`, {
        limit: 10,
        windowSec: 60,
      });
      if (!rl.allowed)
        throw new Error("Quá nhiều yêu cầu, vui lòng thử lại sau");

      const { data, error } = await ctx.supabase
        .from("rsvp_responses")
        .insert({
          project_id: input.projectId,
          guest_name: sanitize(input.guestName, 100),
          status: input.status,
          guest_count: input.guestCount,
          phone: sanitize(input.phone || "", 20),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { success: true, data };
    }),

  // Protected — owner views RSVPs
  listRsvps: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const { data: project } = await ctx.supabase
        .from("projects")
        .select("id")
        .eq("id", input.projectId)
        .eq("user_id", ctx.user.id)
        .single();

      if (!project) throw new Error("Project not found");

      const { data } = await ctx.supabase
        .from("rsvp_responses")
        .select("*")
        .eq("project_id", input.projectId)
        .order("created_at", { ascending: false });

      return data || [];
    }),

  // Protected — owner views gifts
  listGifts: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const { data: project } = await ctx.supabase
        .from("projects")
        .select("id")
        .eq("id", input.projectId)
        .eq("user_id", ctx.user.id)
        .single();

      if (!project) throw new Error("Project not found");

      const { data } = await ctx.supabase
        .from("gifts")
        .select("*")
        .eq("project_id", input.projectId)
        .order("created_at", { ascending: false });

      return data || [];
    }),

  // Protected — add a guest to a project
  addGuest: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        name: z.string().min(1).max(100),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().max(20).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const { data: project } = await ctx.supabase
        .from("projects")
        .select("id, slug")
        .eq("id", input.projectId)
        .eq("user_id", ctx.user.id)
        .single();

      if (!project) throw new Error("Project not found");

      const { data, error } = await ctx.supabase
        .from("guests")
        .insert({
          project_id: input.projectId,
          user_id: ctx.user.id,
          name: sanitize(input.name, 100),
          email: input.email || null,
          phone: sanitize(input.phone || "", 20) || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { success: true, data };
    }),

  // Protected — list guests for a project
  listGuests: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const { data: project } = await ctx.supabase
        .from("projects")
        .select("id")
        .eq("id", input.projectId)
        .eq("user_id", ctx.user.id)
        .single();

      if (!project) throw new Error("Project not found");

      const { data } = await ctx.supabase
        .from("guests")
        .select("id, name, email, phone, status, created_at")
        .eq("project_id", input.projectId)
        .order("created_at", { ascending: false });

      return data || [];
    }),

  // Protected — delete a guest
  deleteGuest: protectedProcedure
    .input(z.object({ guestId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership via user_id on guest row
      const { error } = await ctx.supabase
        .from("guests")
        .delete()
        .eq("id", input.guestId)
        .eq("user_id", ctx.user.id);

      if (error) throw new Error(error.message);
      return { success: true };
    }),

  // Protected — update guest status
  updateGuestStatus: protectedProcedure
    .input(
      z.object({
        guestId: z.string().uuid(),
        status: z.enum(["pending", "invited", "confirmed", "declined"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("guests")
        .update({ status: input.status })
        .eq("id", input.guestId)
        .eq("user_id", ctx.user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { success: true, data };
    }),

  // Protected — check-in a guest at reception
  checkInGuest: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        guestId: z.string().uuid().optional(),
        guestName: z.string().optional(),
        phone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const { data: project } = await ctx.supabase
        .from("projects")
        .select("id")
        .eq("id", input.projectId)
        .eq("user_id", ctx.user.id)
        .single();

      if (!project) throw new Error("Project not found");

      let query = ctx.supabase
        .from("guests")
        .select("*")
        .eq("project_id", input.projectId);

      if (input.guestId) {
        query = query.eq("id", input.guestId);
      } else if (input.phone) {
        query = query.eq("phone", input.phone);
      } else if (input.guestName) {
        query = query.ilike("name", `%${input.guestName.trim()}%`);
      } else {
        throw new Error("Missing search criteria for check-in");
      }

      const { data: matchedGuests, error: searchError } = await query;
      if (searchError) throw new Error(searchError.message);
      if (!matchedGuests || matchedGuests.length === 0) {
        throw new Error("Không tìm thấy khách mời tương ứng");
      }

      const targetGuest = matchedGuests[0];

      // Update to confirmed
      const { data: updatedGuest, error: updateError } = await ctx.supabase
        .from("guests")
        .update({ status: "confirmed" })
        .eq("id", targetGuest.id)
        .select()
        .single();

      if (updateError) throw new Error(updateError.message);

      return {
        success: true,
        guest: updatedGuest,
        alreadyCheckedIn: targetGuest.status === "confirmed",
      };
    }),
});

