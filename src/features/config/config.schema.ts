import { z } from "zod";
import { blogConfig } from "@/blog.config";
import {
  createSiteConfigInputFormSchema,
  type SiteConfigInput,
  SiteConfigInputSchema,
} from "@/features/config/site-config.schema";
import { webhookEndpointSchema } from "@/features/webhook/webhook.schema";
import type { Messages } from "@/lib/i18n";

export const AboutSectionSchema = z.object({
  title: z.string().max(100),
  content: z.string().max(5000),
});

export const SystemConfigSchema = z.object({
  email: z
    .object({
      apiKey: z.string().optional(),
      host: z.string().optional(),
      port: z.number().int().positive().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      senderName: z.string().optional(),
      senderAddress: z.union([z.email(), z.literal("")]).optional(),
    })
    .optional(),
  notification: z
    .object({
      admin: z
        .object({
          channels: z
            .object({
              email: z.boolean().optional(),
              webhook: z.boolean().optional(),
            })
            .optional(),
        })
        .optional(),
      user: z
        .object({
          emailEnabled: z.boolean().optional(),
        })
        .optional(),
      webhooks: z.array(webhookEndpointSchema).optional(),
    })
    .optional(),
  site: SiteConfigInputSchema.optional(),
  commentsEnabled: z.boolean().optional(),
  newsletterEnabled: z.boolean().optional(),
  pages: z
    .object({
      about: z
        .object({
          subtitle: z.string().max(200).optional(),
          showSocial: z.boolean().optional(),
          sections: z.array(AboutSectionSchema).optional(),
        })
        .optional(),
    })
    .optional(),
});

export const createSystemConfigFormSchema = (messages: Messages) =>
  z.object({
    email: SystemConfigSchema.shape.email,
    notification: SystemConfigSchema.shape.notification,
    site: createSiteConfigInputFormSchema(messages).optional(),
    commentsEnabled: z.boolean().optional(),
    newsletterEnabled: z.boolean().optional(),
    pages: SystemConfigSchema.shape.pages,
  });

export type SystemConfig = z.infer<typeof SystemConfigSchema>;
export type AboutSection = z.infer<typeof AboutSectionSchema>;
export type {
  SiteConfig,
  SiteConfigInput,
} from "@/features/config/site-config.schema";

export const DEFAULT_CONFIG: SystemConfig = {
  email: {
    host: "",
    port: 465,
    username: "",
    password: "",
    senderName: "",
    senderAddress: "",
  },
  notification: {
    admin: {
      channels: {
        email: true,
        webhook: true,
      },
    },
    user: {
      emailEnabled: true,
    },
    webhooks: [],
  },
  site: blogConfig satisfies SiteConfigInput,
  commentsEnabled: true,
  newsletterEnabled: false,
  pages: {
    about: {
      showSocial: true,
      sections: [],
    },
  },
};

export const CONFIG_CACHE_KEYS = {
  system: ["system"] as const,
} as const;
