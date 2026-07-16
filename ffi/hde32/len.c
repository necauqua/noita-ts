/*
 * Minimal HDE32 wrapper exposing `hde32_len`, the length of the x86 instruction at addr.
 * Built -nostdlib with a null entry point (see the Dockerfile), so there's no
 * CRT and no DllMain. The only libc call in hde32.c is memset() on a fixed-size
 * struct, which GCC inlines at -Os -- so no memset implementation is needed.
 */

#include "hde32.h"

__declspec(dllexport) unsigned int hde32_len(const void *addr)
{
    hde32s hs;
    return hde32_disasm(addr, &hs);
}
