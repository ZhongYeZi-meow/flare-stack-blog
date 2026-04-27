import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { VerifyPostPasswordInputSchema } from "@/features/posts/schema/posts.schema";
import * as PostService from "@/features/posts/services/posts.service";
import { getServiceContext } from "@/lib/hono/helper";
import { baseMiddleware } from "@/lib/hono/middlewares";

const app = new Hono<{ Bindings: Env }>();

app.use("*", baseMiddleware);

const route = app.post(
  "/:slug/verify-password",
  zValidator("param", VerifyPostPasswordInputSchema.pick({ slug: true })),
  zValidator("json", VerifyPostPasswordInputSchema.pick({ password: true })),
  async (c) => {
    const { slug } = c.req.valid("param");
    const { password } = c.req.valid("json");
    const result = await PostService.verifyPostPassword(getServiceContext(c), {
      slug,
      password,
    });
    if (!result) {
      return c.json({ error: "Post not found" }, 404);
    }
    return c.json(result);
  },
);

export default route;
