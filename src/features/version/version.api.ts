import { createServerFn } from "@tanstack/react-start";
import * as VersionService from "./version.service";
import { err } from "@/lib/error";
import { hasAdminSession, sessionMiddleware } from "@/lib/middlewares";

export const checkUpdateFn = createServerFn()
  .middleware([sessionMiddleware])
  .handler(({ context }) => {
    if (!hasAdminSession(context)) {
      if (!context.session) {
        return err({ reason: "UNAUTHENTICATED" });
      }
      return err({ reason: "PERMISSION_DENIED" });
    }

    return VersionService.checkForUpdate(context);
  });

export const forceCheckUpdateFn = createServerFn()
  .middleware([sessionMiddleware])
  .handler(({ context }) => {
    if (!hasAdminSession(context)) {
      if (!context.session) {
        return err({ reason: "UNAUTHENTICATED" });
      }
      return err({ reason: "PERMISSION_DENIED" });
    }

    return VersionService.checkForUpdate(context, true);
  });
