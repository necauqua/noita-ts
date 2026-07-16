FROM docker.io/library/debian:bookworm-slim AS build

# gcc-mingw-w64-i686 pulls in the matching binutils (strip, ld, objdump).
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc-mingw-w64-i686 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /src
COPY hde32.c hde32.h table32.h len.c ./

# Reproducible build: mingw ld stamps the PE header's TimeDateStamp with the
# wall-clock build time by default, making the DLL differ on every cache miss.
# SOURCE_DATE_EPOCH pins it (0 -> zeroed timestamp) so the output is byte-stable.
ENV SOURCE_DATE_EPOCH=0

# -nostdlib: no CRT, no DllMain -> no imports
# -s: strip all symbols during link
# -Wl,-e,0: null entry point (loader skips DllMain; silences the entry warning)
# --gc-sections: drop unreferenced code/data (-512 bytes)
# -fno-asynchronous-unwind-tables: drop the .eh_frame section (-512 bytes)
RUN i686-w64-mingw32-gcc -Os -s -nostdlib -shared \
        -fno-asynchronous-unwind-tables -Wl,--gc-sections,-e,0 \
        -o hde32.dll hde32.c len.c

# Extract with: docker build --output . .
FROM scratch AS export
COPY --from=build /src/hde32.dll /
