FROM denoland/deno:alpine AS build
WORKDIR /workspace
COPY . .
RUN deno run build

FROM debian:stable-slim AS final
WORKDIR /app
COPY --from=build /workspace/gen-charts /gen-charts
ENTRYPOINT [ "/gen-charts" ]