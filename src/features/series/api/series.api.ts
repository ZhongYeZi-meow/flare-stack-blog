import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { dbMiddleware } from "@/lib/middlewares";
import * as SeriesRepo from "../data/series.data";

export const getAllSeriesFn = createServerFn()
  .middleware([dbMiddleware])
  .handler(({ context }) => SeriesRepo.getAllSeries(context.db));

export const getSeriesWithPostsFn = createServerFn()
  .middleware([dbMiddleware])
  .inputValidator(z.object({ seriesId: z.number() }))
  .handler(({ data, context }) =>
    SeriesRepo.getSeriesWithPosts(context.db, data.seriesId),
  );

export const createSeriesFn = createServerFn()
  .middleware([dbMiddleware])
  .inputValidator(
    z.object({
      title: z.string().min(1).max(100),
      slug: z.string().min(1).max(100),
      description: z.string().max(500).nullish(),
    }),
  )
  .handler(({ data, context }) => SeriesRepo.createSeries(context.db, data));

export const updateSeriesFn = createServerFn()
  .middleware([dbMiddleware])
  .inputValidator(
    z.object({
      id: z.number(),
      title: z.string().min(1).max(100).optional(),
      slug: z.string().min(1).max(100).optional(),
      description: z.string().max(500).nullish(),
    }),
  )
  .handler(({ data, context }) => {
    const { id, ...rest } = data;
    return SeriesRepo.updateSeries(context.db, id, rest);
  });

export const deleteSeriesFn = createServerFn()
  .middleware([dbMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(({ data, context }) => SeriesRepo.deleteSeries(context.db, data.id));
