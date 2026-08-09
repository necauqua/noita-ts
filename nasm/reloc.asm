;; reloc.asm - build-time patch blobs with runtime-injected 32-bit fields.

%assign __reloc_n 0

;; reloc <name> [, <name>...]
;;   Declares a runtime-injected 32-bit field. Use the name anywhere a dword
;;   operand is valid: [name], mov eax, name, mov dword [ebx], name, ...
%macro reloc 1-*
    %rep %0
        __reloc_%[%1]: equ __reloc_n      ; NOTE: must precede the %xdefine
        %xdefine %1 (0xD1BE7700 + __reloc_n)
        %assign __reloc_n __reloc_n + 1
        %rotate 1
    %endrep
%endmacro
