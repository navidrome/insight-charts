FROM denoland/deno:alpine AS build
WORKDIR /workspace
COPY . .
RUN deno run build

FROM debian:stable-slim AS final
WORKDIR /app
COPY --from=build /workspace/insight-charts /insight-charts
ENTRYPOINT [ "/insight-charts" ]
