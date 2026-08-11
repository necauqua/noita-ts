;; reloc.asm - declare runtime-injected 32-bit fields

%assign __reloc_n 0

;; <name>: reloc
;;   Declares a runtime-injected 32-bit field.
;;   Use the name anywhere a dword operand is valid:
;;   [name], mov eax, name, mov dword [ebx], name, ...
%macro reloc 0
    %defstr %%lbl %00
    %strlen %%len %%lbl
    %if %%len == 0
        %error "reloc requires a preceding label, e.g. `my_field: reloc`"
    %endif
    __reloc_%[%00]: equ __reloc_n         ; NOTE: must precede the %xdefine
    %xdefine %00 (0xD1BE7700 + __reloc_n)
    %assign __reloc_n __reloc_n + 1
%endmacro
