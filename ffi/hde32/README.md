# hde32 → win32 DLL

A minimal 32-bit Windows DLL wrapping the Hacker Disassembler Engine 32
(vendored from [RedHolms/HDE](https://github.com/RedHolms/HDE), itself a
reupload). It exposes a single function:

```c
unsigned int hde32_len(const void *addr); // length of the x86 instruction at addr
```

`len.c` is just this wrapper. The DLL is built with `-nostdlib` and a null entry
point, so it has **no imports** and no CRT (~5.6 KB). The only libc call in
`hde32.c` (`memset` on a fixed-size struct) is inlined by GCC at `-Os`.

## Build

```sh
docker build --output . .
```

Produces `hde32.dll` in the current directory.
