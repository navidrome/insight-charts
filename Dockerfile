FROM denoland/deno:alpine AS build
WORKDIR /workspace
COPY . .
RUN deno task build

FROM gcr.io/distroless/cc-debian12 AS final
WORKDIR /app
COPY --from=build /workspace/insight-charts /insight-charts
ENTRYPOINT [ "/insight-charts" ]
