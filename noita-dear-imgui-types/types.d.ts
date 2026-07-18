// TypeScript type definitions for [Noita-Dear-ImGui](https://github.com/dextercd/Noita-Dear-ImGui).
//
// Meant for use with TypeScriptToLua (https://typescripttolua.github.io/),
// or more specifically noita-ts (https://github.com/necauqua/noita-ts).
//
// Multiple return values use the LuaMultiReturn type from
// @typescript-to-lua/language-extensions.

declare interface ImPlotPlotPoint {
  x: number;
  y: number;
}

declare interface ImPlotPlotRange {
  Min: number;
  Max: number;
}

declare interface ImPlotPlotRect {
  X: ImPlotPlotRange;
  Y: ImPlotPlotRange;
}

declare interface ImPlot {
  readonly PlotPoint: {
    new: (this: void, x: number, y: number) => ImPlotPlotPoint;
  };
  readonly PlotRange: {
    new: (this: void, min: number, max: number) => ImPlotPlotRange;
  };
  readonly PlotRect: {
    new: (
      this: void,
      x_min: number,
      x_max: number,
      y_min: number,
      y_max: number,
    ) => ImPlotPlotRect;
  };
}

declare interface ImGuiVersionInfo {
  num: number;
  str: string;
}

declare interface BindingsVersionInfo {
  git_sha: string;
  parts: [number, number, number, number];
  str: string;
}

declare interface VersionInfo {
  imgui: ImGuiVersionInfo;
  ndi: BindingsVersionInfo;
}

declare interface ImGui {
  readonly implot: ImPlot;
  readonly version_info: VersionInfo;
  readonly ListClipper: { new: (this: void) => ImGuiListClipper };
}

declare interface ImGuiGuiIO {}

declare interface ImGuiFontConfig {
  FontNo: number;
  SizePixels: number;
  OversampleH: number;
  OversampleV: number;
  PixelSnapH: boolean;
  GlyphExtraSpacing_x: number;
  GlyphExtraSpacing_y: number;
  GlyphOffset_x: number;
  GlyphOffset_y: number;
  GlyphMinAdvanceX: number;
  GlyphMaxAdvanceX: number;
  MergeMode: boolean;
  FontBuilderFlags: number;
  RasterizerMultiply: number;
  RasterizerDensity: number;
  EllipsisChar: number;
}

declare interface ImGuiFont {
  IndexAdvanceX: any;
  FallbackAdvanceX: number;
  FontSize: number;
  IndexLookup: any;
  ConfigData: ImGuiFontConfig;
  ConfigDataCount: number;
  FallbackChar: number;
  EllipsisChar: number;
  EllipsisCharCount: number;
  EllipsisWidth: number;
  EllipsisCharStep: number;
  DirtyLookupTables: boolean;
  Scale: number;
  Ascent: number;
  Descent: number;
  MetricsTotalSurface: number;
  GetCharAdvance(c: number): number;
  IsLoaded(): boolean;
  GetDebugName(): string;
}

declare interface ImGuiListClipper {
  DisplayStart: number;
  DisplayEnd: number;
  Begin(items_count: number, items_height?: number): void;
  End(): void;
  Step(): boolean;
  IncludeItemsByIndex(this: void, item_min: number, item_max: number): void;
  IncludeItemByIndex(this: void, item_index: number): void;
}

declare interface ImGuiStyle {
  Alpha: number;
  DisabledAlpha: number;
  WindowPadding_x: number;
  WindowPadding_y: number;
  WindowRounding: number;
  WindowBorderSize: number;
  WindowMinSize_x: number;
  WindowMinSize_y: number;
  WindowTitleAlign_x: number;
  WindowTitleAlign_y: number;
  WindowMenuButtonPosition: Dir;
  ChildRounding: number;
  ChildBorderSize: number;
  PopupRounding: number;
  PopupBorderSize: number;
  FramePadding_x: number;
  FramePadding_y: number;
  FrameRounding: number;
  FrameBorderSize: number;
  ItemSpacing_x: number;
  ItemSpacing_y: number;
  ItemInnerSpacing_x: number;
  ItemInnerSpacing_y: number;
  CellPadding_x: number;
  CellPadding_y: number;
  TouchExtraPadding_x: number;
  TouchExtraPadding_y: number;
  IndentSpacing: number;
  ColumnsMinSpacing: number;
  ScrollbarSize: number;
  ScrollbarRounding: number;
  GrabMinSize: number;
  GrabRounding: number;
  LogSliderDeadzone: number;
  TabRounding: number;
  TabBorderSize: number;
  TabMinWidthForCloseButton: number;
  TabBarBorderSize: number;
  TableAngledHeadersAngle: number;
  ColorButtonPosition: Dir;
  ButtonTextAlign_x: number;
  ButtonTextAlign_y: number;
  SelectableTextAlign_x: number;
  SelectableTextAlign_y: number;
  SeparatorTextBorderSize: number;
  SeparatorTextAlign_x: number;
  SeparatorTextAlign_y: number;
  SeparatorTextPadding_x: number;
  SeparatorTextPadding_y: number;
  DisplayWindowPadding_x: number;
  DisplayWindowPadding_y: number;
  DisplaySafeAreaPadding_x: number;
  DisplaySafeAreaPadding_y: number;
  DockingSeparatorSize: number;
  MouseCursorScale: number;
  AntiAliasedLines: number;
  AntiAliasedLinesUseTex: number;
  AntiAliasedFill: boolean;
  CurveTessellationTol: number;
  CircleTessellationMaxError: number;
  Color: (
    this: void,
    index: number,
  ) => LuaMultiReturn<[number, number, number, number]> | undefined;
}

declare interface ImGuiColumnSortSpecs {
  ColumnUserID: number;
  ColumnIndex: number;
  SortOrder: number;
  SortDirection: SortDirection;
}

declare interface ImGuiTableSortSpecs {
  Specs: ImGuiColumnSortSpecs[];
}

declare interface ImGuiLuaImage {
  path: string;
  /** Readonly width of image */
  readonly width: number;
  /** Readonly height of image */
  readonly height: number;
}

declare interface ModSpec {
  /** Name of the mod that wants to use imgui. */
  mod: string;
  /** Version of imgui that the mod requires. e.g. "1.0.0" */
  version: string;
}

/** Grants access to the imgui bindings */
declare function load_imgui(this: void, modspec: ModSpec): ImGui;

declare interface ImGui {
  BeginChild(this: void, str_id: string): boolean;
  BeginChild(
    this: void,
    str_id: string,
    size_x: number,
    size_y: number,
    child_flags?: ChildFlags,
    flags?: WindowFlags,
  ): boolean;
  /**
   * Only available when load_imgui is called with a version number below 1.17.0
   * @deprecated
   */
  BeginChild(
    this: void,
    str_id: string,
    size_x: number,
    size_y: number,
    border: boolean,
    flags?: WindowFlags,
  ): boolean;
}

/**
 * Vector object supports the following sol2 container functions
 * https://sol2.readthedocs.io/en/latest/containers.html
 * - add
 * - at
 * - clear
 * - empty
 * - erase
 * - find
 * - get
 * - index_of
 * - insert
 * - next
 * - pairs
 * - set
 * - size
 */
declare interface Vector<T> {
  [index: number]: T;
}

declare interface ImGuiViewport {}

declare interface ImGuiDrawList {}

declare enum Cond {
  None = 0,
  Always = 1,
  Once = 2,
  FirstUseEver = 4,
  Appearing = 8,
}
declare interface ImGui {
  readonly Cond: typeof Cond;
}

declare enum TableFlags {
  None = 0,
  Resizable = 1,
  Reorderable = 2,
  Hideable = 4,
  Sortable = 8,
  NoSavedSettings = 16,
  ContextMenuInBody = 32,
  RowBg = 64,
  BordersInnerH = 128,
  BordersOuterH = 256,
  BordersInnerV = 512,
  BordersOuterV = 1024,
  BordersH = 384,
  BordersV = 1536,
  BordersInner = 640,
  BordersOuter = 1280,
  Borders = 1920,
  NoBordersInBody = 2048,
  NoBordersInBodyUntilResize = 4096,
  SizingFixedFit = 8192,
  SizingFixedSame = 16384,
  SizingStretchProp = 24576,
  SizingStretchSame = 32768,
  NoHostExtendX = 65536,
  NoHostExtendY = 131072,
  NoKeepColumnsVisible = 262144,
  PreciseWidths = 524288,
  NoClip = 1048576,
  PadOuterX = 2097152,
  NoPadOuterX = 4194304,
  NoPadInnerX = 8388608,
  ScrollX = 16777216,
  ScrollY = 33554432,
  SortMulti = 67108864,
  SortTristate = 134217728,
  HighlightHoveredColumn = 268435456,
}
declare interface ImGui {
  readonly TableFlags: typeof TableFlags;
}

declare enum TableRowFlags {
  None = 0,
  Headers = 1,
}
declare interface ImGui {
  readonly TableRowFlags: typeof TableRowFlags;
}

declare enum TableColumnFlags {
  None = 0,
  Disabled = 1,
  DefaultHide = 2,
  DefaultSort = 4,
  WidthStretch = 8,
  WidthFixed = 16,
  NoResize = 32,
  NoReorder = 64,
  NoHide = 128,
  NoClip = 256,
  NoSort = 512,
  NoSortAscending = 1024,
  NoSortDescending = 2048,
  NoHeaderLabel = 4096,
  NoHeaderWidth = 8192,
  PreferSortAscending = 16384,
  PreferSortDescending = 32768,
  IndentEnable = 65536,
  IndentDisable = 131072,
  AngledHeader = 262144,
  IsEnabled = 16777216,
  IsVisible = 33554432,
  IsSorted = 67108864,
  IsHovered = 134217728,
}
declare interface ImGui {
  readonly TableColumnFlags: typeof TableColumnFlags;
}

declare enum TableBgTarget {
  None = 0,
  RowBg0 = 1,
  RowBg1 = 2,
  CellBg = 3,
}
declare interface ImGui {
  readonly TableBgTarget: typeof TableBgTarget;
}

declare enum SortDirection {
  None = 0,
  Ascending = 1,
  Descending = 2,
}
declare interface ImGui {
  readonly SortDirection: typeof SortDirection;
}

declare interface ImGui {
  BeginTable(this: void, str_id: string, columns: number): boolean;
  BeginTable(
    this: void,
    str_id: string,
    columns: number,
    flags: TableFlags,
  ): boolean;
  BeginTable(
    this: void,
    str_id: string,
    columns: number,
    flags: TableFlags,
    outer_size_x: number,
    outer_size_y: number,
  ): boolean;
  BeginTable(
    this: void,
    str_id: string,
    columns: number,
    flags: TableFlags,
    outer_size_x: number,
    outer_size_y: number,
    inner_size: number,
  ): boolean;
}

declare interface ImGui {
  EndTable(this: void): void;
}

declare interface ImGui {
  TableNextRow(this: void): void;
  TableNextRow(this: void, row_flags: TableRowFlags): void;
  TableNextRow(
    this: void,
    row_flags: TableRowFlags,
    min_row_height: number,
  ): void;
}

declare interface ImGui {
  TableNextColumn(this: void): boolean;
}

declare interface ImGui {
  TableSetColumnIndex(this: void, column_n: number): boolean;
}

declare interface ImGui {
  TableSetupColumn(this: void, label: string): void;
  TableSetupColumn(this: void, label: string, flags: TableColumnFlags): void;
  TableSetupColumn(
    this: void,
    label: string,
    flags: TableColumnFlags,
    init_width_or_weight: number,
  ): void;
  TableSetupColumn(
    this: void,
    label: string,
    flags: TableColumnFlags,
    init_width_or_weight: number,
    user_id: number,
  ): void;
}

declare interface ImGui {
  TableSetupScrollFreeze(this: void, cols: number, rows: number): void;
}

declare interface ImGui {
  TableHeadersRow(this: void): void;
}

declare interface ImGui {
  TableAngledHeadersRow(this: void): void;
}

declare interface ImGui {
  TableHeader(this: void, label: string): void;
}

declare interface ImGui {
  TableGetColumnCount(this: void): number;
}

declare interface ImGui {
  TableGetColumnIndex(this: void): number;
}

declare interface ImGui {
  TableGetRowIndex(this: void): number;
}

declare interface ImGui {
  TableGetColumnName(this: void): string;
  TableGetColumnName(this: void, column_n: number): string;
}

declare interface ImGui {
  TableGetColumnFlags(this: void): number;
  TableGetColumnFlags(this: void, column_n: number): TableColumnFlags;
}

declare interface ImGui {
  TableSetColumnEnabled(this: void, column_n: number, v: boolean): void;
}

declare interface ImGui {
  TableGetHoveredColumn(this: void): number;
}

declare interface ImGui {
  TableSetBgColor(
    this: void,
    target: TableBgTarget,
    r: number,
    g: number,
    b: number,
    a: number,
  ): void;
  TableSetBgColor(
    this: void,
    target: TableBgTarget,
    r: number,
    g: number,
    b: number,
    a: number,
    column_n: number,
  ): void;
}

declare interface ImGui {
  TableGetSortSpecs(
    this: void,
  ): LuaMultiReturn<[boolean | undefined, ImGuiTableSortSpecs | undefined]>;
}

declare interface ImGui {
  TableSortSpecsMarkClean(this: void): void;
}

declare enum Col {
  Text = 0,
  TextDisabled = 1,
  WindowBg = 2,
  ChildBg = 3,
  PopupBg = 4,
  Border = 5,
  BorderShadow = 6,
  FrameBg = 7,
  FrameBgHovered = 8,
  FrameBgActive = 9,
  TitleBg = 10,
  TitleBgActive = 11,
  TitleBgCollapsed = 12,
  MenuBarBg = 13,
  ScrollbarBg = 14,
  ScrollbarGrab = 15,
  ScrollbarGrabHovered = 16,
  ScrollbarGrabActive = 17,
  CheckMark = 18,
  SliderGrab = 19,
  SliderGrabActive = 20,
  Button = 21,
  ButtonHovered = 22,
  ButtonActive = 23,
  Header = 24,
  HeaderHovered = 25,
  HeaderActive = 26,
  Separator = 27,
  SeparatorHovered = 28,
  SeparatorActive = 29,
  ResizeGrip = 30,
  ResizeGripHovered = 31,
  ResizeGripActive = 32,
  Tab = 34,
  TabHovered = 33,
  TabActive = 35,
  TabUnfocused = 37,
  TabUnfocusedActive = 38,
  TabSelected = 35,
  TabSelectedOverline = 36,
  TabDimmed = 37,
  TabDimmedSelected = 38,
  TabDimmedSelectedOverline = 39,
  DockingPreview = 40,
  DockingEmptyBg = 41,
  PlotLines = 42,
  PlotLinesHovered = 43,
  PlotHistogram = 44,
  PlotHistogramHovered = 45,
  TableHeaderBg = 46,
  TableBorderStrong = 47,
  TableBorderLight = 48,
  TableRowBg = 49,
  TableRowBgAlt = 50,
  TextLink = 51,
  TextSelectedBg = 52,
  DragDropTarget = 53,
  NavHighlight = 54,
  NavWindowingHighlight = 55,
  NavWindowingDimBg = 56,
  ModalWindowDimBg = 57,
  COUNT = 58,
}
declare interface ImGui {
  readonly Col: typeof Col;
}

declare enum StyleVar {
  Alpha = 0,
  DisabledAlpha = 1,
  WindowPadding = 2,
  WindowRounding = 3,
  WindowBorderSize = 4,
  WindowMinSize = 5,
  WindowTitleAlign = 6,
  ChildRounding = 7,
  ChildBorderSize = 8,
  PopupRounding = 9,
  PopupBorderSize = 10,
  FramePadding = 11,
  FrameRounding = 12,
  FrameBorderSize = 13,
  ItemSpacing = 14,
  ItemInnerSpacing = 15,
  IndentSpacing = 16,
  CellPadding = 17,
  ScrollbarSize = 18,
  ScrollbarRounding = 19,
  GrabMinSize = 20,
  GrabRounding = 21,
  TabRounding = 22,
  TabBorderSize = 23,
  TabBarBorderSize = 24,
  TabBarOverlineSize = 25,
  TableAngledHeadersAngle = 26,
  TableAngledHeadersTextAlign = 27,
  ButtonTextAlign = 28,
  SelectableTextAlign = 29,
  SeparatorTextBorderSize = 30,
  SeparatorTextAlign = 31,
  SeparatorTextPadding = 32,
  DockingSeparatorSize = 33,
  COUNT = 34,
}
declare interface ImGui {
  readonly StyleVar: typeof StyleVar;
}

declare enum ItemFlags {
  None = 0,
  NoTabStop = 1,
  NoNav = 2,
  NoNavDefaultFocus = 4,
  ButtonRepeat = 8,
  AutoClosePopups = 16,
}
declare interface ImGui {
  readonly ItemFlags: typeof ItemFlags;
}

declare interface ImGui {
  PushStyleColor(this: void, idx: Col, r: number, g: number, b: number): void;
  PushStyleColor(
    this: void,
    idx: Col,
    r: number,
    g: number,
    b: number,
    a: number,
  ): void;
}

declare interface ImGui {
  PopStyleColor(this: void): void;
  PopStyleColor(this: void, count: number): void;
}

declare interface ImGui {
  PushStyleVar(this: void, idx: StyleVar, val: number): void;
  PushStyleVar(this: void, idx: StyleVar, valx: number, valy: number): void;
}

declare interface ImGui {
  PopStyleVar(this: void): void;
  PopStyleVar(this: void, count: number): void;
}

declare interface ImGui {
  PushButtonRepeat(this: void, repeat: boolean): void;
}

declare interface ImGui {
  PopButtonRepeat(this: void): void;
}

declare interface ImGui {
  PushItemFlag(this: void, option: ItemFlags, enabled: boolean): void;
}

declare interface ImGui {
  PopItemFlag(this: void): void;
}

declare interface ImGui {
  PushItemWidth(this: void, item_width: number): void;
}

declare interface ImGui {
  PopItemWidth(this: void): void;
}

declare interface ImGui {
  SetNextItemWidth(this: void, item_width: number): void;
}

declare interface ImGui {
  CalcItemWidth(this: void): number;
}

declare interface ImGui {
  PushTextWrapPos(this: void): void;
  PushTextWrapPos(this: void, wrap_local_pos_x: number): void;
}

declare interface ImGui {
  PopTextWrapPos(this: void): void;
}

declare enum InputTextFlags {
  None = 0,
  CharsDecimal = 1,
  CharsHexadecimal = 2,
  CharsScientific = 4,
  CharsUppercase = 8,
  CharsNoBlank = 16,
  AllowTabInput = 32,
  EnterReturnsTrue = 64,
  EscapeClearsAll = 128,
  CtrlEnterForNewLine = 256,
  ReadOnly = 512,
  Password = 1024,
  AlwaysOverwrite = 2048,
  AutoSelectAll = 4096,
  ParseEmptyRefVal = 8192,
  DisplayEmptyRefVal = 16384,
  NoHorizontalScroll = 32768,
  NoUndoRedo = 65536,
  CallbackCompletion = 131072,
  CallbackHistory = 262144,
  CallbackAlways = 524288,
  CallbackCharFilter = 1048576,
  CallbackResize = 2097152,
  CallbackEdit = 4194304,
}
declare interface ImGui {
  readonly InputTextFlags: typeof InputTextFlags;
}

declare interface ImGui {
  InputText(
    this: void,
    label: string,
    str: string,
  ): LuaMultiReturn<[boolean, string]>;
  InputText(
    this: void,
    label: string,
    str: string,
    flags: InputTextFlags,
  ): LuaMultiReturn<[boolean, string]>;
}

declare interface ImGui {
  InputTextMultiline(
    this: void,
    label: string,
    str: string,
  ): LuaMultiReturn<[boolean, string]>;
  InputTextMultiline(
    this: void,
    label: string,
    str: string,
    size_x: number,
    size_y: number,
  ): LuaMultiReturn<[boolean, string]>;
  InputTextMultiline(
    this: void,
    label: string,
    str: string,
    size_x: number,
    size_y: number,
    flags: InputTextFlags,
  ): LuaMultiReturn<[boolean, string]>;
}

declare interface ImGui {
  InputTextWithHint(
    this: void,
    label: string,
    hint: string,
    str: string,
  ): LuaMultiReturn<[boolean, string]>;
  InputTextWithHint(
    this: void,
    label: string,
    hint: string,
    str: string,
    flags: InputTextFlags,
  ): LuaMultiReturn<[boolean, string]>;
}

declare interface ImGui {
  InputFloat(
    this: void,
    label: string,
    v: number,
  ): LuaMultiReturn<[boolean, number]>;
  InputFloat(
    this: void,
    label: string,
    v: number,
    step: number,
  ): LuaMultiReturn<[boolean, number]>;
  InputFloat(
    this: void,
    label: string,
    v: number,
    step: number,
    step_fast: number,
  ): LuaMultiReturn<[boolean, number]>;
  InputFloat(
    this: void,
    label: string,
    v: number,
    step: number,
    step_fast: number,
    format: string,
  ): LuaMultiReturn<[boolean, number]>;
  InputFloat(
    this: void,
    label: string,
    v: number,
    step: number,
    step_fast: number,
    format: string,
    flags: InputTextFlags,
  ): LuaMultiReturn<[boolean, number]>;
}

declare interface ImGui {
  InputFloat2(
    this: void,
    label: string,
    v1: number,
    v2: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  InputFloat2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number]>;
  InputFloat2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    format: string,
    flags: InputTextFlags,
  ): LuaMultiReturn<[boolean, number, number]>;
}

declare interface ImGui {
  InputFloat3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  InputFloat3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  InputFloat3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    format: string,
    flags: InputTextFlags,
  ): LuaMultiReturn<[boolean, number, number, number]>;
}

declare interface ImGui {
  InputFloat4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  InputFloat4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  InputFloat4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    format: string,
    flags: InputTextFlags,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
}

declare interface ImGui {
  InputInt(
    this: void,
    label: string,
    v: number,
  ): LuaMultiReturn<[boolean, number]>;
  InputInt(
    this: void,
    label: string,
    v: number,
    step: number,
  ): LuaMultiReturn<[boolean, number]>;
  InputInt(
    this: void,
    label: string,
    v: number,
    step: number,
    step_fast: number,
  ): LuaMultiReturn<[boolean, number]>;
  InputInt(
    this: void,
    label: string,
    v: number,
    step: number,
    step_fast: number,
    flags: InputTextFlags,
  ): LuaMultiReturn<[boolean, number]>;
}

declare interface ImGui {
  InputInt2(
    this: void,
    label: string,
    v1: number,
    v2: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  InputInt2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    flags: InputTextFlags,
  ): LuaMultiReturn<[boolean, number, number]>;
}

declare interface ImGui {
  InputInt3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  InputInt3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    flags: InputTextFlags,
  ): LuaMultiReturn<[boolean, number, number, number]>;
}

declare interface ImGui {
  InputInt4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  InputInt4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    flags: InputTextFlags,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
}

declare interface ImGui {
  InputDouble(
    this: void,
    label: string,
    v: number,
  ): LuaMultiReturn<[boolean, number]>;
  InputDouble(
    this: void,
    label: string,
    v: number,
    step: number,
  ): LuaMultiReturn<[boolean, number]>;
  InputDouble(
    this: void,
    label: string,
    v: number,
    step: number,
    step_fast: number,
  ): LuaMultiReturn<[boolean, number]>;
  InputDouble(
    this: void,
    label: string,
    v: number,
    step: number,
    step_fast: number,
    format: string,
  ): LuaMultiReturn<[boolean, number]>;
  InputDouble(
    this: void,
    label: string,
    v: number,
    step: number,
    step_fast: number,
    format: string,
    flags: InputTextFlags,
  ): LuaMultiReturn<[boolean, number]>;
}

declare enum MouseButton {
  Left = 0,
  Right = 1,
  Middle = 2,
  COUNT = 5,
}
declare interface ImGui {
  readonly MouseButton: typeof MouseButton;
}

declare interface ImGui {
  IsMouseDown(this: void, button: MouseButton): boolean;
}

declare interface ImGui {
  IsMouseClicked(this: void, button: MouseButton): boolean;
  IsMouseClicked(this: void, button: MouseButton, repeat: boolean): boolean;
}

declare interface ImGui {
  IsMouseReleased(this: void, button: MouseButton): boolean;
}

declare interface ImGui {
  IsMouseDoubleClicked(this: void, button: MouseButton): boolean;
}

declare interface ImGui {
  GetMouseClickedCount(this: void, button: MouseButton): number;
}

declare interface ImGui {
  IsMousePosValid(this: void): boolean;
  IsMousePosValid(this: void, posx: number, posy: number): boolean;
}

declare interface ImGui {
  GetMousePos(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetMousePosOnOpeningCurrentPopup(
    this: void,
  ): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  IsMouseDragging(this: void, button: MouseButton): boolean;
  IsMouseDragging(
    this: void,
    button: MouseButton,
    lock_threshold: number,
  ): boolean;
}

declare interface ImGui {
  GetMouseDragDelta(this: void): LuaMultiReturn<[number, number]>;
  GetMouseDragDelta(
    this: void,
    button: MouseButton,
  ): LuaMultiReturn<[number, number]>;
  GetMouseDragDelta(
    this: void,
    button: MouseButton,
    lock_threshold: number,
  ): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  ResetMouseDragDelta(this: void): void;
  ResetMouseDragDelta(this: void, button: MouseButton): void;
}

declare enum MouseCursor {
  None = -1,
  Arrow = 0,
  TextInput = 1,
  ResizeAll = 2,
  ResizeNS = 3,
  ResizeEW = 4,
  ResizeNESW = 5,
  ResizeNWSE = 6,
  Hand = 7,
  NotAllowed = 8,
  COUNT = 9,
}
declare interface ImGui {
  readonly MouseCursor: typeof MouseCursor;
}

declare interface ImGui {
  GetMouseCursor(this: void): MouseCursor;
}

declare interface ImGui {
  SetMouseCursor(this: void, cursor_type: MouseCursor): void;
}

declare interface ImGui {
  SetNextFrameWantCaptureMouse(this: void, want_capture_mouse: boolean): void;
}

declare enum DragDropFlags {
  None = 0,
  SourceNoPreviewTooltip = 1,
  SourceNoDisableHover = 2,
  SourceNoHoldToOpenOthers = 4,
  SourceAllowNullID = 8,
  SourceExtern = 16,
  PayloadAutoExpire = 32,
  PayloadNoCrossContext = 64,
  PayloadNoCrossProcess = 128,
  SourceAutoExpirePayload = 32,
  AcceptBeforeDelivery = 1024,
  AcceptNoDrawDefaultRect = 2048,
  AcceptNoPreviewTooltip = 4096,
  AcceptPeekOnly = 3072,
}
declare interface ImGui {
  readonly DragDropFlags: typeof DragDropFlags;
}

declare interface ImGui {
  BeginDragDropSource(this: void): boolean;
  BeginDragDropSource(this: void, flags: DragDropFlags): boolean;
}

declare interface ImGui {
  SetDragDropPayload(this: void, type: string, payload: any): boolean;
  SetDragDropPayload(
    this: void,
    type: string,
    payload: any,
    cond: Cond,
  ): boolean;
}

declare interface ImGui {
  EndDragDropSource(this: void): void;
}

declare interface ImGui {
  AcceptDragDropPayload(this: void, type: string): any;
  AcceptDragDropPayload(this: void, type: string, flags: DragDropFlags): any;
}

declare interface ImGui {
  BeginDragDropTarget(this: void): boolean;
}

declare interface ImGui {
  EndDragDropTarget(this: void): void;
}

declare interface ImGui {
  GetDragDropPayload(this: void): any;
}

declare enum Dir {
  None = -1,
  Left = 0,
  Right = 1,
  Up = 2,
  Down = 3,
  COUNT = 4,
}
declare interface ImGui {
  readonly Dir: typeof Dir;
}

declare interface ImGui {
  GetStyle(this: void): ImGuiStyle;
}

declare enum ButtonFlags {
  None = 0,
  MouseButtonLeft = 1,
  MouseButtonRight = 2,
  MouseButtonMiddle = 4,
}
declare interface ImGui {
  readonly ButtonFlags: typeof ButtonFlags;
}

declare interface ImGui {
  Button(this: void, label: string): boolean;
  Button(this: void, label: string, width: number, height: number): boolean;
}

declare interface ImGui {
  SmallButton(this: void, label: string): boolean;
}

declare interface ImGui {
  InvisibleButton(
    this: void,
    str_id: string,
    size_x: number,
    size_y: number,
  ): boolean;
  InvisibleButton(
    this: void,
    str_id: string,
    size_x: number,
    size_y: number,
    flags: ButtonFlags,
  ): boolean;
}

declare interface ImGui {
  ArrowButton(this: void, str_id: string, dir: Dir): boolean;
}

declare interface ImGui {
  Checkbox(
    this: void,
    label: string,
    value: boolean,
  ): LuaMultiReturn<[boolean, boolean]>;
}

declare interface ImGui {
  CheckboxFlags(
    this: void,
    label: string,
    flags: number,
    flags_value: number,
  ): LuaMultiReturn<[boolean, number]>;
}

declare interface ImGui {
  RadioButton(this: void, label: string, active: boolean): boolean;
}

declare interface ImGui {
  ProgressBar(this: void, fraction: number): void;
  ProgressBar(this: void, fraction: number, size_x: number): void;
  ProgressBar(
    this: void,
    fraction: number,
    size_x: number,
    size_y: number,
  ): void;
  ProgressBar(
    this: void,
    fraction: number,
    size_x: number,
    size_y: number,
    overlay: string,
  ): void;
}

declare interface ImGui {
  Bullet(this: void): void;
}

declare interface ImGui {
  TextLink(this: void, label: string): boolean;
}

declare interface ImGui {
  TextLinkOpenURL(this: void, label: string): void;
  TextLinkOpenURL(this: void, label: string, url: string): void;
}

declare interface ImGui {
  BeginTooltip(this: void): boolean;
}

declare interface ImGui {
  BeginItemTooltip(this: void): boolean;
}

declare interface ImGui {
  EndTooltip(this: void): void;
}

declare interface ImGui {
  SetTooltip(this: void, text: string): void;
}

declare interface ImGui {
  BeginMenuBar(this: void): boolean;
}

declare interface ImGui {
  EndMenuBar(this: void): void;
}

declare interface ImGui {
  BeginMainMenuBar(this: void): boolean;
}

declare interface ImGui {
  EndMainMenuBar(this: void): void;
}

declare interface ImGui {
  BeginMenu(this: void, label: string): boolean;
  BeginMenu(this: void, label: string, enabled: boolean): boolean;
}

declare interface ImGui {
  EndMenu(this: void): void;
}

declare interface ImGui {
  MenuItem(this: void, label: string): boolean;
  MenuItem(this: void, label: string, shortcut: string): boolean;
  MenuItem(
    this: void,
    label: string,
    shortcut: string,
    selected: boolean,
  ): LuaMultiReturn<[boolean, boolean]>;
  MenuItem(
    this: void,
    label: string,
    shortcut: string,
    selected: boolean,
    enabled: boolean,
  ): LuaMultiReturn<[boolean, boolean]>;
}

declare enum TabBarFlags {
  None = 0,
  Reorderable = 1,
  AutoSelectNewTabs = 2,
  TabListPopupButton = 4,
  NoCloseWithMiddleMouseButton = 8,
  NoTabListScrollingButtons = 16,
  NoTooltip = 32,
  DrawSelectedOverline = 64,
  FittingPolicyResizeDown = 128,
  FittingPolicyScroll = 256,
  FittingPolicyMask_ = 384,
  FittingPolicyDefault_ = 128,
}
declare interface ImGui {
  readonly TabBarFlags: typeof TabBarFlags;
}

declare interface ImGui {
  BeginTabBar(this: void, str_id: string): boolean;
  BeginTabBar(this: void, str_id: string, flags: TabBarFlags): boolean;
}

declare interface ImGui {
  EndTabBar(this: void): void;
}

declare enum TabItemFlags {
  None = 0,
  UnsavedDocument = 1,
  SetSelected = 2,
  NoCloseWithMiddleMouseButton = 4,
  NoPushId = 8,
  NoTooltip = 16,
  NoReorder = 32,
  Leading = 64,
  Trailing = 128,
  NoAssumedClosure = 256,
}
declare interface ImGui {
  readonly TabItemFlags: typeof TabItemFlags;
}

declare interface ImGui {
  BeginTabItem(
    this: void,
    label: string,
    open?: boolean,
    flags?: TabItemFlags,
  ): LuaMultiReturn<[boolean, boolean | undefined]>;
}

declare interface ImGui {
  EndTabItem(this: void): void;
}

declare interface ImGui {
  TabItemButton(this: void, label: string): boolean;
  TabItemButton(this: void, label: string, flags: TabItemFlags): boolean;
}

declare interface ImGui {
  SetTabItemClosed(this: void, tab_or_docked_window_label: string): void;
}

declare interface ImGui {
  as_vector_float(this: void, vec: number[] | Vector<number>): Vector<number>;
}

declare enum ComboFlags {
  None = 0,
  PopupAlignLeft = 1,
  HeightSmall = 2,
  HeightRegular = 4,
  HeightLarge = 8,
  HeightLargest = 16,
  NoArrowButton = 32,
  NoPreview = 64,
  WidthFitPreview = 128,
  HeightMask_ = 30,
}
declare interface ImGui {
  readonly ComboFlags: typeof ComboFlags;
}

declare interface ImGui {
  BeginCombo(this: void, label: string, preview_value: string): boolean;
  BeginCombo(
    this: void,
    label: string,
    preview_value: string,
    flags: ComboFlags,
  ): boolean;
}

declare interface ImGui {
  EndCombo(this: void): void;
}

declare interface ImGui {
  Combo(
    this: void,
    label: string,
    current_item: number,
    items: object,
  ): LuaMultiReturn<[boolean, number]>;
  Combo(
    this: void,
    label: string,
    current_item: number,
    items: object,
    popup_max_height_in_items: number,
  ): LuaMultiReturn<[boolean, number]>;
}

declare enum SelectableFlags {
  None = 0,
  DontClosePopups = 1,
  NoAutoClosePopups = 1,
  SpanAllColumns = 2,
  AllowDoubleClick = 4,
  Disabled = 8,
  AllowOverlap = 16,
  Highlight = 32,
}
declare interface ImGui {
  readonly SelectableFlags: typeof SelectableFlags;
}

declare interface ImGui {
  Selectable(this: void, label: string): boolean;
  Selectable(this: void, label: string, selected: boolean): boolean;
  Selectable(
    this: void,
    label: string,
    selected: boolean,
    flags: SelectableFlags,
  ): boolean;
  Selectable(
    this: void,
    label: string,
    selected: boolean,
    flags: SelectableFlags,
    size_x: number,
    size_y: number,
  ): boolean;
}

declare interface ImGui {
  GetClipboardText(this: void): string;
}

declare interface ImGui {
  SetClipboardText(this: void, text: string): void;
}

declare enum SliderFlags {
  None = 0,
  AlwaysClamp = 16,
  Logarithmic = 32,
  NoRoundToFormat = 64,
  NoInput = 128,
  WrapAround = 256,
  InvalidMask_ = 1879048207,
}
declare interface ImGui {
  readonly SliderFlags: typeof SliderFlags;
}

declare interface ImGui {
  DragFloat(
    this: void,
    label: string,
    v: number,
  ): LuaMultiReturn<[boolean, number]>;
  DragFloat(
    this: void,
    label: string,
    v: number,
    v_speed: number,
  ): LuaMultiReturn<[boolean, number]>;
  DragFloat(
    this: void,
    label: string,
    v: number,
    v_speed: number,
    v_min: number,
  ): LuaMultiReturn<[boolean, number]>;
  DragFloat(
    this: void,
    label: string,
    v: number,
    v_speed: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number]>;
  DragFloat(
    this: void,
    label: string,
    v: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number]>;
  DragFloat(
    this: void,
    label: string,
    v: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number]>;
}

declare interface ImGui {
  DragFloat2(
    this: void,
    label: string,
    v1: number,
    v2: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragFloat2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_speed: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragFloat2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_speed: number,
    v_min: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragFloat2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_speed: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragFloat2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragFloat2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number]>;
}

declare interface ImGui {
  DragFloat3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  DragFloat3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_speed: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  DragFloat3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_speed: number,
    v_min: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  DragFloat3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_speed: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  DragFloat3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  DragFloat3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number, number]>;
}

declare interface ImGui {
  DragFloat4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  DragFloat4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_speed: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  DragFloat4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_speed: number,
    v_min: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  DragFloat4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_speed: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  DragFloat4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  DragFloat4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
}

declare interface ImGui {
  DragFloatRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragFloatRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
    v_speed: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragFloatRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
    v_speed: number,
    v_min: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragFloatRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
    v_speed: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragFloatRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragFloatRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
    format_max: string,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragFloatRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
    format_max: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number]>;
}

declare interface ImGui {
  DragInt(
    this: void,
    label: string,
    v: number,
  ): LuaMultiReturn<[boolean, number]>;
  DragInt(
    this: void,
    label: string,
    v: number,
    v_speed: number,
  ): LuaMultiReturn<[boolean, number]>;
  DragInt(
    this: void,
    label: string,
    v: number,
    v_speed: number,
    v_min: number,
  ): LuaMultiReturn<[boolean, number]>;
  DragInt(
    this: void,
    label: string,
    v: number,
    v_speed: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number]>;
  DragInt(
    this: void,
    label: string,
    v: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number]>;
  DragInt(
    this: void,
    label: string,
    v: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number]>;
}

declare interface ImGui {
  DragInt2(
    this: void,
    label: string,
    v1: number,
    v2: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragInt2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_speed: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragInt2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_speed: number,
    v_min: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragInt2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_speed: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragInt2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragInt2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number]>;
}

declare interface ImGui {
  DragInt3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  DragInt3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_speed: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  DragInt3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_speed: number,
    v_min: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  DragInt3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_speed: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  DragInt3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  DragInt3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number, number]>;
}

declare interface ImGui {
  DragInt4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  DragInt4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_speed: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  DragInt4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_speed: number,
    v_min: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  DragInt4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_speed: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  DragInt4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  DragInt4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
}

declare interface ImGui {
  DragIntRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragIntRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
    v_speed: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragIntRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
    v_speed: number,
    v_min: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragIntRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
    v_speed: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragIntRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragIntRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
    format_max: string,
  ): LuaMultiReturn<[boolean, number, number]>;
  DragIntRange2(
    this: void,
    label: string,
    v_current_min: number,
    v_current_max: number,
    v_speed: number,
    v_min: number,
    v_max: number,
    format: string,
    format_max: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number]>;
}

declare interface ImGui {
  PushID(this: void, str_id: string): void;
  PushID(this: void, int_id: number): void;
}

declare interface ImGui {
  PopID(this: void): void;
}

declare interface ImGui {
  GetID(this: void, str_id: string): number;
  GetID(this: void, int_id: number): number;
}

declare interface ImGui {
  GetMainViewport(this: void): ImGuiViewport;
}

declare interface ImGui {
  GetMainViewportID(this: void): number;
}

declare interface ImGui {
  GetMainViewportWorkPos(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetMainViewportPos(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetMainViewportSize(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetMainViewportWorkSize(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  TextUnformatted(this: void, text: string): void;
}

declare interface ImGui {
  Text(this: void, text: string): void;
}

declare interface ImGui {
  TextColored(
    this: void,
    colr: number,
    colg: number,
    colb: number,
    cola: number,
    text: string,
  ): void;
}

declare interface ImGui {
  TextDisabled(this: void, text: string): void;
}

declare interface ImGui {
  TextWrapped(this: void, text: string): void;
}

declare interface ImGui {
  LabelText(this: void, label: string, text: string): void;
}

declare interface ImGui {
  BulletText(this: void, text: string): void;
}

declare interface ImGui {
  SeparatorText(this: void, text: string): void;
}

declare enum Axis {
  X1 = 0,
  X2 = 1,
  X3 = 2,
  Y1 = 3,
  Y2 = 4,
  Y3 = 5,
}
declare interface ImPlot {
  readonly Axis: typeof Axis;
}

declare enum PlotFlags {
  None = 0,
  NoTitle = 1,
  NoLegend = 2,
  NoMouseText = 4,
  NoInputs = 8,
  NoMenus = 16,
  NoBoxSelect = 32,
  NoFrame = 64,
  Equal = 128,
  Crosshairs = 256,
  CanvasOnly = 55,
}
declare interface ImPlot {
  readonly PlotFlags: typeof PlotFlags;
}

declare enum PlotAxisFlags {
  None = 0,
  NoLabel = 1,
  NoGridLines = 2,
  NoTickMarks = 4,
  NoTickLabels = 8,
  NoInitialFit = 16,
  NoMenus = 32,
  NoSideSwitch = 64,
  NoHighlight = 128,
  Opposite = 256,
  Foreground = 512,
  Invert = 1024,
  AutoFit = 2048,
  RangeFit = 4096,
  PanStretch = 8192,
  LockMin = 16384,
  LockMax = 32768,
  Lock = 49152,
  NoDecorations = 15,
  AuxDefault = 258,
}
declare interface ImPlot {
  readonly PlotAxisFlags: typeof PlotAxisFlags;
}

declare enum PlotSubplotFlags {
  None = 0,
  NoTitle = 1,
  NoLegend = 2,
  NoMenus = 4,
  NoResize = 8,
  NoAlign = 16,
  ShareItems = 32,
  LinkRows = 64,
  LinkCols = 128,
  LinkAllX = 256,
  LinkAllY = 512,
  ColMajor = 1024,
}
declare interface ImPlot {
  readonly PlotSubplotFlags: typeof PlotSubplotFlags;
}

declare enum PlotLegendFlags {
  None = 0,
  NoButtons = 1,
  NoHighlightItem = 2,
  NoHighlightAxis = 4,
  NoMenus = 8,
  Outside = 16,
  Horizontal = 32,
  Sort = 64,
}
declare interface ImPlot {
  readonly PlotLegendFlags: typeof PlotLegendFlags;
}

declare enum PlotMouseTextFlags {
  None = 0,
  NoAuxAxes = 1,
  NoFormat = 2,
  ShowAlways = 4,
}
declare interface ImPlot {
  readonly PlotMouseTextFlags: typeof PlotMouseTextFlags;
}

declare enum PlotDragToolFlags {
  None = 0,
  NoCursors = 1,
  NoFit = 2,
  NoInputs = 4,
  Delayed = 8,
}
declare interface ImPlot {
  readonly PlotDragToolFlags: typeof PlotDragToolFlags;
}

declare enum PlotColormapScaleFlags {
  None = 0,
  NoLabel = 1,
  Opposite = 2,
  Invert = 4,
}
declare interface ImPlot {
  readonly PlotColormapScaleFlags: typeof PlotColormapScaleFlags;
}

declare enum PlotItemFlags {
  None = 0,
  NoLegend = 1,
  NoFit = 2,
}
declare interface ImPlot {
  readonly PlotItemFlags: typeof PlotItemFlags;
}

declare enum PlotLineFlags {
  None = 0,
  Segments = 1024,
  Loop = 2048,
  SkipNaN = 4096,
  NoClip = 8192,
  Shaded = 16384,
}
declare interface ImPlot {
  readonly PlotLineFlags: typeof PlotLineFlags;
}

declare enum PlotScatterFlags {
  None = 0,
  NoClip = 1024,
}
declare interface ImPlot {
  readonly PlotScatterFlags: typeof PlotScatterFlags;
}

declare enum PlotStairsFlags {
  None = 0,
  PreStep = 1024,
  Shaded = 2048,
}
declare interface ImPlot {
  readonly PlotStairsFlags: typeof PlotStairsFlags;
}

declare enum PlotShadedFlags {
  None = 0,
}
declare interface ImPlot {
  readonly PlotShadedFlags: typeof PlotShadedFlags;
}

declare enum PlotBarsFlags {
  None = 0,
  Horizontal = 1024,
}
declare interface ImPlot {
  readonly PlotBarsFlags: typeof PlotBarsFlags;
}

declare enum PlotBarGroupsFlags {
  None = 0,
  Horizontal = 1024,
  Stacked = 2048,
}
declare interface ImPlot {
  readonly PlotBarGroupsFlags: typeof PlotBarGroupsFlags;
}

declare enum PlotErrorBarsFlags {
  None = 0,
  Horizontal = 1024,
}
declare interface ImPlot {
  readonly PlotErrorBarsFlags: typeof PlotErrorBarsFlags;
}

declare enum PlotStemsFlags {
  None = 0,
  Horizontal = 1024,
}
declare interface ImPlot {
  readonly PlotStemsFlags: typeof PlotStemsFlags;
}

declare enum PlotInfLinesFlags {
  None = 0,
  Horizontal = 1024,
}
declare interface ImPlot {
  readonly PlotInfLinesFlags: typeof PlotInfLinesFlags;
}

declare enum PlotPieChartFlags {
  None = 0,
  Normalize = 1024,
  IgnoreHidden = 2048,
}
declare interface ImPlot {
  readonly PlotPieChartFlags: typeof PlotPieChartFlags;
}

declare enum PlotHeatmapFlags {
  None = 0,
  ColMajor = 1024,
}
declare interface ImPlot {
  readonly PlotHeatmapFlags: typeof PlotHeatmapFlags;
}

declare enum PlotHistogramFlags {
  None = 0,
  Horizontal = 1024,
  Cumulative = 2048,
  Density = 4096,
  NoOutliers = 8192,
  ColMajor = 16384,
}
declare interface ImPlot {
  readonly PlotHistogramFlags: typeof PlotHistogramFlags;
}

declare enum PlotDigitalFlags {
  None = 0,
}
declare interface ImPlot {
  readonly PlotDigitalFlags: typeof PlotDigitalFlags;
}

declare enum PlotImageFlags {
  None = 0,
}
declare interface ImPlot {
  readonly PlotImageFlags: typeof PlotImageFlags;
}

declare enum PlotTextFlags {
  None = 0,
  Vertical = 1024,
}
declare interface ImPlot {
  readonly PlotTextFlags: typeof PlotTextFlags;
}

declare enum PlotDummyFlags {
  None = 0,
}
declare interface ImPlot {
  readonly PlotDummyFlags: typeof PlotDummyFlags;
}

declare enum PlotCond {
  None = 0,
  Always = 1,
  Once = 2,
}
declare interface ImPlot {
  readonly PlotCond: typeof PlotCond;
}

declare enum PlotCol {
  Line = 0,
  Fill = 1,
  MarkerOutline = 2,
  MarkerFill = 3,
  ErrorBar = 4,
  FrameBg = 5,
  PlotBg = 6,
  PlotBorder = 7,
  LegendBg = 8,
  LegendBorder = 9,
  LegendText = 10,
  TitleText = 11,
  InlayText = 12,
  AxisText = 13,
  AxisGrid = 14,
  AxisTick = 15,
  AxisBg = 16,
  AxisBgHovered = 17,
  AxisBgActive = 18,
  Selection = 19,
  Crosshairs = 20,
}
declare interface ImPlot {
  readonly PlotCol: typeof PlotCol;
}

declare enum PlotStyleVar {
  LineWeight = 0,
  Marker = 1,
  MarkerSize = 2,
  MarkerWeight = 3,
  FillAlpha = 4,
  ErrorBarSize = 5,
  ErrorBarWeight = 6,
  DigitalBitHeight = 7,
  DigitalBitGap = 8,
  PlotBorderSize = 9,
  MinorAlpha = 10,
  MajorTickLen = 11,
  MinorTickLen = 12,
  MajorTickSize = 13,
  MinorTickSize = 14,
  MajorGridSize = 15,
  MinorGridSize = 16,
  PlotPadding = 17,
  LabelPadding = 18,
  LegendPadding = 19,
  LegendInnerPadding = 20,
  LegendSpacing = 21,
  MousePosPadding = 22,
  AnnotationPadding = 23,
  FitPadding = 24,
  PlotDefaultSize = 25,
  PlotMinSize = 26,
}
declare interface ImPlot {
  readonly PlotStyleVar: typeof PlotStyleVar;
}

declare enum PlotScale {
  Linear = 0,
  Time = 1,
  Log10 = 2,
  SymLog = 3,
}
declare interface ImPlot {
  readonly PlotScale: typeof PlotScale;
}

declare enum PlotMarker {
  None = -1,
  Circle = 0,
  Square = 1,
  Diamond = 2,
  Up = 3,
  Down = 4,
  Left = 5,
  Right = 6,
  Cross = 7,
  Plus = 8,
  Asterisk = 9,
}
declare interface ImPlot {
  readonly PlotMarker: typeof PlotMarker;
}

declare enum PlotColormap {
  Deep = 0,
  PlotColormap_Dark = 1,
  Pastel = 2,
  Paired = 3,
  Viridis = 4,
  Plasma = 5,
  Hot = 6,
  Cool = 7,
  Pink = 8,
  Jet = 9,
  Twilight = 10,
  RdBu = 11,
  BrBG = 12,
  PiYG = 13,
  Spectral = 14,
  Greys = 15,
}
declare interface ImPlot {
  readonly PlotColormap: typeof PlotColormap;
}

declare enum PlotLocation {
  Center = 0,
  North = 1,
  South = 2,
  West = 4,
  East = 8,
  NorthWest = 5,
  NorthEast = 9,
  SouthWest = 6,
  SouthEast = 10,
}
declare interface ImPlot {
  readonly PlotLocation: typeof PlotLocation;
}

declare enum PlotBin {
  Sqrt = -1,
  Sturges = -2,
  Rice = -3,
  Scott = -4,
}
declare interface ImPlot {
  readonly PlotBin: typeof PlotBin;
}

declare interface ImPlot {
  BeginPlot(this: void, title_id: string): boolean;
  BeginPlot(
    this: void,
    title_id: string,
    size_x: number,
    size_y: number,
  ): boolean;
  BeginPlot(
    this: void,
    title_id: string,
    size_x: number,
    size_y: number,
    flags: PlotFlags,
  ): boolean;
}

declare interface ImPlot {
  EndPlot(this: void): void;
}

declare interface ImPlot {
  BeginSubplots(
    this: void,
    title_id: string,
    rows: number,
    cols: number,
    size_x: number,
    size_y: number,
  ): boolean;
  BeginSubplots(
    this: void,
    title_id: string,
    rows: number,
    cols: number,
    size_x: number,
    size_y: number,
    flags: PlotSubplotFlags,
  ): boolean;
}

declare interface ImPlot {
  EndSubplots(this: void): void;
}

declare interface ImPlot {
  SetupAxis(this: void, axis: Axis): void;
  SetupAxis(this: void, axis: Axis, label: string): void;
  SetupAxis(this: void, axis: Axis, label: string, flags: PlotAxisFlags): void;
  SetupAxis(this: void, axis: Axis, label: string, flags: PlotAxisFlags): void;
}

declare interface ImPlot {
  SetupAxisLimits(this: void, axis: Axis, v_min: number, v_max: number): void;
  SetupAxisLimits(
    this: void,
    axis: Axis,
    v_min: number,
    v_max: number,
    cond: PlotCond,
  ): void;
}

declare interface ImPlot {
  SetupAxisFormat(this: void, axis: Axis, fmt: string): void;
}

declare interface ImPlot {
  SetupAxisTicks(
    this: void,
    axis: Axis,
    values: number[] | Vector<number>,
    labels?: string[],
    keep_default?: boolean,
  ): void;
  SetupAxisTicks(
    this: void,
    axis: Axis,
    v_min: number,
    v_max: number,
    n_ticks: number,
    labels?: string[],
    keep_default?: boolean,
  ): void;
}

declare interface ImPlot {
  SetupAxisScale(this: void, axis: Axis, scale: PlotScale): void;
}

declare interface ImPlot {
  SetupAxisLimitsConstraints(
    this: void,
    axis: Axis,
    v_min: number,
    v_max: number,
  ): void;
}

declare interface ImPlot {
  SetupAxisZoomConstraints(
    this: void,
    axis: Axis,
    z_min: number,
    z_max: number,
  ): void;
}

declare interface ImPlot {
  SetupAxes(this: void, x_label: string, y_label: string): void;
  SetupAxes(
    this: void,
    x_label: string,
    y_label: string,
    x_flags: PlotAxisFlags,
  ): void;
  SetupAxes(
    this: void,
    x_label: string,
    y_label: string,
    x_flags: PlotAxisFlags,
    y_flags: PlotAxisFlags,
  ): void;
}

declare interface ImPlot {
  SetupAxesLimits(
    this: void,
    x_min: number,
    x_max: number,
    y_min: number,
    y_max: number,
  ): void;
  SetupAxesLimits(
    this: void,
    x_min: number,
    x_max: number,
    y_min: number,
    y_max: number,
    cond: PlotCond,
  ): void;
}

declare interface ImPlot {
  SetupLegend(this: void, location: PlotLocation): void;
  SetupLegend(this: void, location: PlotLocation, flags: PlotLegendFlags): void;
}

declare interface ImPlot {
  SetupMouseText(this: void, location: PlotLocation): void;
  SetupMouseText(
    this: void,
    location: PlotLocation,
    flags: PlotMouseTextFlags,
  ): void;
}

declare interface ImPlot {
  SetupFinish(this: void): void;
}

declare interface ImPlot {
  SetNextAxisLimits(this: void, axis: Axis, v_min: number, v_max: number): void;
  SetNextAxisLimits(
    this: void,
    axis: Axis,
    v_min: number,
    v_max: number,
    cond: PlotCond,
  ): void;
}

declare interface ImPlot {
  SetNextAxisToFit(this: void, axis: Axis): void;
}

declare interface ImPlot {
  SetNextAxesLimits(
    this: void,
    x_min: number,
    x_max: number,
    y_min: number,
    y_max: number,
  ): void;
  SetNextAxesLimits(
    this: void,
    x_min: number,
    x_max: number,
    y_min: number,
    y_max: number,
    cond: PlotCond,
  ): void;
}

declare interface ImPlot {
  SetNextAxesToFit(this: void): void;
}

declare interface ImPlot {
  PlotLine(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
  ): void;
  PlotLine(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    xscale: number,
  ): void;
  PlotLine(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    xscale: number,
    xstart: number,
  ): void;
  PlotLine(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    xscale: number,
    xstart: number,
    flags: PlotLineFlags,
  ): void;
  PlotLine(
    this: void,
    label_id: string,
    xs: number[] | Vector<number>,
    ys: number[] | Vector<number>,
  ): void;
  PlotLine(
    this: void,
    label_id: string,
    xs: number[] | Vector<number>,
    ys: number[] | Vector<number>,
    flags: PlotLineFlags,
  ): void;
}

declare interface ImPlot {
  PlotScatter(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
  ): void;
  PlotScatter(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    xscale: number,
  ): void;
  PlotScatter(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    xscale: number,
    xstart: number,
  ): void;
  PlotScatter(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    xscale: number,
    xstart: number,
    flags: PlotScatterFlags,
  ): void;
  PlotScatter(
    this: void,
    label_id: string,
    xs: number[] | Vector<number>,
    ys: number[] | Vector<number>,
  ): void;
  PlotScatter(
    this: void,
    label_id: string,
    xs: number[] | Vector<number>,
    ys: number[] | Vector<number>,
    flags: PlotScatterFlags,
  ): void;
}

declare interface ImPlot {
  PlotStairs(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
  ): void;
  PlotStairs(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    xscale: number,
  ): void;
  PlotStairs(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    xscale: number,
    xstart: number,
  ): void;
  PlotStairs(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    xscale: number,
    xstart: number,
    flags: PlotStairsFlags,
  ): void;
  PlotStairs(
    this: void,
    label_id: string,
    xs: number[] | Vector<number>,
    ys: number[] | Vector<number>,
  ): void;
  PlotStairs(
    this: void,
    label_id: string,
    xs: number[] | Vector<number>,
    ys: number[] | Vector<number>,
    flags: PlotStairsFlags,
  ): void;
}

declare interface ImPlot {
  PlotBars(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
  ): void;
  PlotBars(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    bar_size: number,
  ): void;
  PlotBars(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    bar_size: number,
    shift: number,
  ): void;
  PlotBars(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    bar_size: number,
    shift: number,
    flags: PlotBarsFlags,
  ): void;
  PlotBars(
    this: void,
    label_id: string,
    xs: number[] | Vector<number>,
    ys: number[] | Vector<number>,
    bar_size: number,
  ): void;
  PlotBars(
    this: void,
    label_id: string,
    xs: number[] | Vector<number>,
    ys: number[] | Vector<number>,
    flags: PlotBarsFlags,
    bar_size: number,
  ): void;
}

declare interface ImPlot {
  PlotBarGroups(
    this: void,
    labels: string[],
    values: number[] | Vector<number>,
    item_count: number,
    group_count: number,
    group_size?: number,
    shift?: number,
    flags?: PlotBarGroupsFlags,
  ): void;
}

declare interface ImPlot {
  PlotErrorBars(
    this: void,
    label_id: string,
    xs: number[] | Vector<number>,
    ys: number[] | Vector<number>,
    err: number[] | Vector<number>,
    flags?: PlotErrorBarsFlags,
  ): void;
  PlotErrorBars(
    this: void,
    label_id: string,
    xs: number[] | Vector<number>,
    ys: number[] | Vector<number>,
    neg: number[] | Vector<number>,
    pos: number[] | Vector<number>,
    flags?: PlotErrorBarsFlags,
  ): void;
}

declare interface ImPlot {
  PlotStems(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    ref?: number,
    scale?: number,
    start?: number,
    flags?: PlotStemsFlags,
  ): void;
  PlotStems(
    this: void,
    label_id: string,
    xs: number[] | Vector<number>,
    ys: number[] | Vector<number>,
    ref?: number,
    flags?: PlotStemsFlags,
  ): void;
}

declare interface ImPlot {
  PlotInfLines(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    flags?: PlotInfLinesFlags,
  ): void;
}

declare interface ImPlot {
  PlotPieChart(
    this: void,
    label_ids: string[],
    values: number[] | Vector<number>,
    x: number,
    y: number,
    radius: number,
    label_fmt?: string,
    angle0?: number,
    flags?: PlotPieChartFlags,
  ): void;
}

declare interface ImPlot {
  PlotHeatmap(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    rows: number,
    cols: number,
    scale_min?: number,
    scale_max?: number,
    label_fmt?: string,
    bounds_min?: ImPlotPlotPoint,
    bounds_max?: ImPlotPlotPoint,
    flags?: PlotHeatmapFlags,
  ): void;
}

declare interface ImPlot {
  PlotHistogram(
    this: void,
    label_id: string,
    values: number[] | Vector<number>,
    bins?: PlotBin,
    bar_scale?: number,
    range?: ImPlotPlotRange,
    flags?: PlotHistogramFlags,
  ): number;
}

declare interface ImPlot {
  PlotHistogram2D(
    this: void,
    label_id: string,
    xs: number[] | Vector<number>,
    ys: number[] | Vector<number>,
    x_bins?: PlotBin,
    y_bins?: PlotBin,
    range?: ImPlotPlotRect,
    flags?: PlotHistogramFlags,
  ): number;
}

declare interface ImPlot {
  PlotDigital(
    this: void,
    label_id: string,
    xs: number[] | Vector<number>,
    ys: number[] | Vector<number>,
    flags?: PlotDigitalFlags,
  ): void;
}

declare interface ImPlot {
  PlotText(this: void, text: string, x: number, y: number): void;
  PlotText(
    this: void,
    text: string,
    x: number,
    y: number,
    pix_offset_x: number,
    pix_offset_y: number,
  ): void;
  PlotText(
    this: void,
    text: string,
    x: number,
    y: number,
    pix_offset_x: number,
    pix_offset_y: number,
    flags: PlotTextFlags,
  ): void;
}

declare interface ImPlot {
  PlotDummy(this: void, label_id: string): void;
  PlotDummy(this: void, label_id: string, flags: PlotDummyFlags): void;
}

declare interface ImPlot {
  DragPoint(
    this: void,
    id: number,
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
    size?: number,
    flags?: PlotDragToolFlags,
  ): LuaMultiReturn<[boolean, number, number, boolean, boolean, boolean]>;
}

declare interface ImPlot {
  DragLineX(
    this: void,
    id: number,
    x: number,
    r: number,
    g: number,
    b: number,
    a: number,
    thickness?: number,
    flags?: PlotDragToolFlags,
  ): LuaMultiReturn<[boolean, number, boolean, boolean, boolean]>;
}

declare interface ImPlot {
  DragLineY(
    this: void,
    id: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
    thickness?: number,
    flags?: PlotDragToolFlags,
  ): LuaMultiReturn<[boolean, number, boolean, boolean, boolean]>;
}

declare interface ImPlot {
  DragRect(
    this: void,
    id: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    r: number,
    g: number,
    b: number,
    a: number,
    flags?: PlotDragToolFlags,
  ): LuaMultiReturn<
    [boolean, number, number, number, number, boolean, boolean, boolean]
  >;
}

declare interface ImPlot {
  Annotation(
    this: void,
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
    pix_offset_x: number,
    pix_offset_y: number,
    clamp: boolean,
  ): void;
  Annotation(
    this: void,
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
    pix_offset_x: number,
    pix_offset_y: number,
    clamp: boolean,
    round: boolean,
  ): void;
  Annotation(
    this: void,
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
    pix_offset_x: number,
    pix_offset_y: number,
    clamp: boolean,
    text: string,
  ): void;
}

declare interface ImPlot {
  TagX(this: void, x: number, r: number, g: number, b: number, a: number): void;
  TagX(
    this: void,
    x: number,
    r: number,
    g: number,
    b: number,
    a: number,
    round: boolean,
  ): void;
  TagX(
    this: void,
    x: number,
    r: number,
    g: number,
    b: number,
    a: number,
    text: string,
  ): void;
}

declare interface ImPlot {
  TagY(this: void, y: number, r: number, g: number, b: number, a: number): void;
  TagY(
    this: void,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
    round: boolean,
  ): void;
  TagY(
    this: void,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
    text: string,
  ): void;
}

declare interface ImPlot {
  SetAxis(this: void, axis: Axis): void;
}

declare interface ImPlot {
  SetAxes(this: void, x_axis: Axis, y_axis: Axis): void;
}

declare interface ImPlot {
  PixelsToPlot(
    this: void,
    x: number,
    y: number,
  ): LuaMultiReturn<[number, number]>;
  PixelsToPlot(
    this: void,
    x: number,
    y: number,
    x_axis: Axis,
  ): LuaMultiReturn<[number, number]>;
  PixelsToPlot(
    this: void,
    x: number,
    y: number,
    x_axis: Axis,
    y_axis: Axis,
  ): LuaMultiReturn<[number, number]>;
}

declare interface ImPlot {
  PlotToPixels(
    this: void,
    x: number,
    y: number,
  ): LuaMultiReturn<[number, number]>;
  PlotToPixels(
    this: void,
    x: number,
    y: number,
    x_axis: Axis,
  ): LuaMultiReturn<[number, number]>;
  PlotToPixels(
    this: void,
    x: number,
    y: number,
    x_axis: Axis,
    y_axis: Axis,
  ): LuaMultiReturn<[number, number]>;
  PlotToPixels(
    this: void,
    plt: ImPlotPlotPoint,
  ): LuaMultiReturn<[number, number]>;
  PlotToPixels(
    this: void,
    plt: ImPlotPlotPoint,
    x_axis: Axis,
  ): LuaMultiReturn<[number, number]>;
  PlotToPixels(
    this: void,
    plt: ImPlotPlotPoint,
    x_axis: Axis,
    y_axis: Axis,
  ): LuaMultiReturn<[number, number]>;
}

declare interface ImPlot {
  GetPlotPos(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImPlot {
  GetPlotSize(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImPlot {
  GetPlotMousePos(this: void): LuaMultiReturn<[number, number]>;
  GetPlotMousePos(this: void, x_axis: Axis): LuaMultiReturn<[number, number]>;
  GetPlotMousePos(
    this: void,
    x_axis: Axis,
    y_axis: Axis,
  ): LuaMultiReturn<[number, number]>;
}

declare interface ImPlot {
  GetPlotLimits(this: void): ImPlotPlotRect;
  GetPlotLimits(this: void, x_axis: Axis): ImPlotPlotRect;
  GetPlotLimits(this: void, x_axis: Axis, y_axis: Axis): ImPlotPlotRect;
}

declare interface ImPlot {
  IsPlotHovered(this: void): boolean;
}

declare interface ImPlot {
  IsAxisHovered(this: void, axis: Axis): boolean;
}

declare interface ImPlot {
  IsSubplotsHovered(this: void): boolean;
}

declare interface ImPlot {
  IsPlotSelected(this: void): boolean;
}

declare interface ImPlot {
  GetPlotSelection(this: void): ImPlotPlotRect;
  GetPlotSelection(this: void, x_axis: Axis): ImPlotPlotRect;
  GetPlotSelection(this: void, x_axis: Axis, y_axis: Axis): ImPlotPlotRect;
  GetPlotSelection(this: void, x_axis: Axis, y_axis: Axis): ImPlotPlotRect;
}

declare interface ImPlot {
  CancelPlotSelection(this: void): void;
}

declare interface ImPlot {
  HideNextItem(this: void): void;
  HideNextItem(this: void, hidden: boolean): void;
  HideNextItem(this: void, hidden: boolean, cond: PlotCond): void;
}

declare interface ImPlot {
  BeginAlignedPlots(this: void, group_id: string): boolean;
  BeginAlignedPlots(this: void, group_id: string, vertical: boolean): boolean;
}

declare interface ImPlot {
  EndAlignedPlots(this: void): void;
}

declare interface ImPlot {
  BeginLegendPopup(this: void, label_id: string): boolean;
  BeginLegendPopup(
    this: void,
    label_id: string,
    mouse_button: MouseButton,
  ): boolean;
}

declare interface ImPlot {
  EndLegendPopup(this: void): void;
}

declare interface ImPlot {
  IsLegendEntryHovered(this: void, label_id: string): boolean;
}

declare interface ImPlot {
  BeginDragDropTargetPlot(this: void): boolean;
}

declare interface ImPlot {
  BeginDragDropTargetAxis(this: void, axis: Axis): boolean;
}

declare interface ImPlot {
  BeginDragDropTargetLegend(this: void): boolean;
}

declare interface ImPlot {
  EndDragDropTarget(this: void): void;
}

declare interface ImPlot {
  PushStyleColor(
    this: void,
    idx: PlotCol,
    r: number,
    g: number,
    b: number,
    a: number,
  ): void;
  PushStyleColor(this: void, idx: PlotCol, col: number): void;
}

declare interface ImPlot {
  PopStyleColor(this: void): void;
  PopStyleColor(this: void, count: number): void;
}

declare interface ImPlot {
  PushStyleVarFloat(this: void, idx: PlotStyleVar, val: number): void;
}

declare interface ImPlot {
  PushStyleVarInt(this: void, idx: PlotStyleVar, val: number): void;
}

declare interface ImPlot {
  PushStyleVarVec2(this: void, idx: PlotStyleVar, x: number, y: number): void;
}

declare interface ImPlot {
  PopStyleVar(this: void): void;
  PopStyleVar(this: void, count: number): void;
}

declare interface ImPlot {
  SetNextLineStyle(
    this: void,
    r?: number,
    g?: number,
    b?: number,
    a?: number,
    weight?: number,
  ): void;
}

declare interface ImPlot {
  SetNextFillStyle(
    this: void,
    r?: number,
    g?: number,
    b?: number,
    a?: number,
    alpha_mod?: number,
  ): void;
}

declare interface ImPlot {
  SetNextMarkerStyle(
    this: void,
    marker?: PlotMarker,
    size?: number,
    fill_r?: number,
    fill_g?: number,
    fill_b?: number,
    fill_a?: number,
    weight?: number,
    outline_r?: number,
    outline_g?: number,
    outline_b?: number,
    outline_a?: number,
  ): void;
}

declare interface ImPlot {
  SetNextErrorBarStyle(
    this: void,
    r?: number,
    g?: number,
    b?: number,
    a?: number,
    size?: number,
    weight?: number,
  ): void;
}

declare interface ImPlot {
  GetLastItemColor(
    this: void,
  ): LuaMultiReturn<[number, number, number, number]>;
}

declare interface ImPlot {
  GetStyleColorName(this: void, idx: PlotCol): string;
}

declare interface ImPlot {
  GetMarkerName(this: void, idx: PlotMarker): string;
}

declare interface ImPlot {
  ItemIcon(this: void, col: number): void;
  ItemIcon(this: void, r: number, g: number, b: number, a: number): void;
}

declare interface ImPlot {
  ColormapIcon(this: void, cmap: PlotColormap): void;
}

declare interface ImPlot {
  PushPlotClipRect(this: void): void;
  PushPlotClipRect(this: void, expand: number): void;
}

declare interface ImPlot {
  PopPlotClipRect(this: void): void;
}

declare interface ImPlot {
  ShowStyleSelector(this: void, label: string): boolean;
}

declare interface ImPlot {
  ShowColormapSelector(this: void, label: string): boolean;
}

declare interface ImPlot {
  ShowInputMapSelector(this: void, label: string): boolean;
}

declare interface ImPlot {
  ShowUserGuide(this: void): void;
}

declare interface ImPlot {
  ShowMetricsWindow(this: void): void;
  ShowMetricsWindow(this: void, open: boolean): boolean;
}

declare interface ImPlot {
  ShowDemoWindow(this: void): void;
  ShowDemoWindow(this: void, open: boolean): boolean;
}

declare enum DockNodeFlags {
  None = 0,
  KeepAliveOnly = 1,
  NoDockingOverCentralNode = 4,
  PassthruCentralNode = 8,
  NoDockingSplit = 16,
  NoResize = 32,
  AutoHideTabBar = 64,
  NoUndocking = 128,
}
declare interface ImGui {
  readonly DockNodeFlags: typeof DockNodeFlags;
}

declare interface ImGui {
  GetWindowDockID(this: void): number;
}

declare interface ImGui {
  SetNextWindowDockID(this: void, dock_id: number, cond?: Cond): void;
}

declare interface ImGui {
  DockBuilderDockWindow(this: void, window_name: string, node_id: number): void;
}

declare interface ImGui {
  DockBuilderAddNode(
    this: void,
    node_id?: number,
    flags?: DockNodeFlags,
  ): number;
}

declare interface ImGui {
  DockBuilderRemoveNode(this: void, node_id: number): void;
}

declare interface ImGui {
  DockBuilderRemoveNodeDockedWindows(
    this: void,
    node_id: number,
    clear_settings_ref?: boolean,
  ): void;
}

declare interface ImGui {
  DockBuilderRemoveNodeChildNodes(this: void, node_id: number): void;
}

declare interface ImGui {
  DockBuilderSetNodePos(
    this: void,
    node_id: number,
    x: number,
    y: number,
  ): void;
}

declare interface ImGui {
  DockBuilderSetNodeSize(
    this: void,
    node_id: number,
    width: number,
    height: number,
  ): void;
}

declare interface ImGui {
  DockBuilderSplitNode(
    this: void,
    node_id: number,
    split_dir: Dir,
    size_ratio_for_node_at_dir: number,
  ): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  DockBuilderCopyWindowSettings(
    this: void,
    src_name: string,
    dst_name: string,
  ): void;
}

declare interface ImGui {
  DockBuilderFinish(this: void, node_id: number): void;
}

declare enum Key {
  None = 0,
  Tab = 512,
  LeftArrow = 513,
  RightArrow = 514,
  UpArrow = 515,
  DownArrow = 516,
  PageUp = 517,
  PageDown = 518,
  Home = 519,
  End = 520,
  Insert = 521,
  Delete = 522,
  Backspace = 523,
  Space = 524,
  Enter = 525,
  Escape = 526,
  LeftCtrl = 527,
  LeftShift = 528,
  LeftAlt = 529,
  LeftSuper = 530,
  RightCtrl = 531,
  RightShift = 532,
  RightAlt = 533,
  RightSuper = 534,
  Menu = 535,
  _0 = 536,
  _1 = 537,
  _2 = 538,
  _3 = 539,
  _4 = 540,
  _5 = 541,
  _6 = 542,
  _7 = 543,
  _8 = 544,
  _9 = 545,
  A = 546,
  B = 547,
  C = 548,
  D = 549,
  E = 550,
  F = 551,
  G = 552,
  H = 553,
  I = 554,
  J = 555,
  K = 556,
  L = 557,
  M = 558,
  N = 559,
  O = 560,
  P = 561,
  Q = 562,
  R = 563,
  S = 564,
  T = 565,
  U = 566,
  V = 567,
  W = 568,
  X = 569,
  Y = 570,
  Z = 571,
  F1 = 572,
  F2 = 573,
  F3 = 574,
  F4 = 575,
  F5 = 576,
  F6 = 577,
  F7 = 578,
  F8 = 579,
  F9 = 580,
  F10 = 581,
  F11 = 582,
  F12 = 583,
  F13 = 584,
  F14 = 585,
  F15 = 586,
  F16 = 587,
  F17 = 588,
  F18 = 589,
  F19 = 590,
  F20 = 591,
  F21 = 592,
  F22 = 593,
  F23 = 594,
  F24 = 595,
  Apostrophe = 596,
  Comma = 597,
  Minus = 598,
  Period = 599,
  Slash = 600,
  Semicolon = 601,
  Equal = 602,
  LeftBracket = 603,
  Backslash = 604,
  RightBracket = 605,
  GraveAccent = 606,
  CapsLock = 607,
  ScrollLock = 608,
  NumLock = 609,
  PrintScreen = 610,
  Pause = 611,
  Keypad0 = 612,
  Keypad1 = 613,
  Keypad2 = 614,
  Keypad3 = 615,
  Keypad4 = 616,
  Keypad5 = 617,
  Keypad6 = 618,
  Keypad7 = 619,
  Keypad8 = 620,
  Keypad9 = 621,
  KeypadDecimal = 622,
  KeypadDivide = 623,
  KeypadMultiply = 624,
  KeypadSubtract = 625,
  KeypadAdd = 626,
  KeypadEnter = 627,
  KeypadEqual = 628,
  AppBack = 629,
  AppForward = 630,
  GamepadStart = 631,
  GamepadBack = 632,
  GamepadFaceLeft = 633,
  GamepadFaceRight = 634,
  GamepadFaceUp = 635,
  GamepadFaceDown = 636,
  GamepadDpadLeft = 637,
  GamepadDpadRight = 638,
  GamepadDpadUp = 639,
  GamepadDpadDown = 640,
  GamepadL1 = 641,
  GamepadR1 = 642,
  GamepadL2 = 643,
  GamepadR2 = 644,
  GamepadL3 = 645,
  GamepadR3 = 646,
  GamepadLStickLeft = 647,
  GamepadLStickRight = 648,
  GamepadLStickUp = 649,
  GamepadLStickDown = 650,
  GamepadRStickLeft = 651,
  GamepadRStickRight = 652,
  GamepadRStickUp = 653,
  GamepadRStickDown = 654,
  MouseLeft = 655,
  MouseRight = 656,
  MouseMiddle = 657,
  MouseX1 = 658,
  MouseX2 = 659,
  MouseWheelX = 660,
  MouseWheelY = 661,
  COUNT = 666,
  ModCtrl = 4096,
  ModShift = 8192,
  ModAlt = 16384,
  ModSuper = 32768,
  KeyPadEnter = 627,
}
declare interface ImGui {
  readonly Key: typeof Key;
}

declare enum Mod {
  None = 0,
  Ctrl = 4096,
  Shift = 8192,
  Alt = 16384,
  Super = 32768,
  Shortcut = 4096,
  Mask_ = 61440,
}
declare interface ImGui {
  readonly Mod: typeof Mod;
}

declare interface ImGui {
  IsKeyDown(this: void, key: Key): boolean;
}

declare interface ImGui {
  IsKeyPressed(this: void, key: Key): boolean;
  IsKeyPressed(this: void, key: Key, repeat: boolean): boolean;
}

declare interface ImGui {
  IsKeyReleased(this: void, key: Key): boolean;
}

declare interface ImGui {
  GetKeyPressedAmount(
    this: void,
    key: Key,
    repeat_delay: number,
    rate: number,
  ): number;
}

declare interface ImGui {
  GetKeyName(this: void, key: Key): string;
}

declare interface ImGui {
  SetNextFrameWantCaptureKeyboard(
    this: void,
    want_capture_keyboard: boolean,
  ): void;
}

declare interface ImGui {
  PushTabStop(this: void, tab_stop: boolean): void;
}

declare interface ImGui {
  PopTabStop(this: void): void;
}

declare interface ImGui {
  SetKeyboardFocusHere(this: void): void;
  SetKeyboardFocusHere(this: void, offset: number): void;
}

declare interface ImGui {
  Separator(this: void): void;
}

declare interface ImGui {
  SameLine(this: void): void;
  SameLine(this: void, offset_from_start_x: number): void;
  SameLine(this: void, offset_from_start_x: number, spacing: number): void;
}

declare interface ImGui {
  NewLine(this: void): void;
}

declare interface ImGui {
  Spacing(this: void): void;
}

declare interface ImGui {
  Dummy(this: void, size_x: number, size_y: number): void;
}

declare interface ImGui {
  Indent(this: void): void;
  Indent(this: void, indent_w: number): void;
}

declare interface ImGui {
  Unindent(this: void): void;
  Unindent(this: void, indent_w: number): void;
}

declare interface ImGui {
  BeginGroup(this: void): void;
}

declare interface ImGui {
  EndGroup(this: void): void;
}

declare interface ImGui {
  GetCursorPos(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetCursorPosX(this: void): number;
}

declare interface ImGui {
  GetCursorPosY(this: void): number;
}

declare interface ImGui {
  SetCursorPos(this: void, local_pos_x: number, local_pos_y: number): void;
}

declare interface ImGui {
  SetCursorPosX(this: void, local_x: number): void;
}

declare interface ImGui {
  SetCursorPosY(this: void, local_y: number): void;
}

declare interface ImGui {
  GetCursorStartPos(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetCursorScreenPos(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  SetCursorScreenPos(this: void, size_x: number, size_y: number): void;
}

declare interface ImGui {
  AlignTextToFramePadding(this: void): void;
}

declare interface ImGui {
  GetTextLineHeight(this: void): number;
}

declare interface ImGui {
  GetTextLineHeightWithSpacing(this: void): number;
}

declare interface ImGui {
  GetFrameHeight(this: void): number;
}

declare interface ImGui {
  GetFrameHeightWithSpacing(this: void): number;
}

declare interface ImGui {
  GetIO(this: void): ImGuiGuiIO;
}

declare interface ImGuiFont {
  CalcTextSizeA(
    size: number,
    max_width: number,
    wrap_width: number,
    text: string,
    length?: number,
  ): LuaMultiReturn<[number, number, number]>;
}

declare interface ImGuiFont {
  CalcWordWrapPositionA(
    scale: number,
    text: string,
    length: number | undefined,
    wrap_width: number,
  ): number;
}

declare interface ImGui {
  GetFontIndex(this: void, font_index: number): ImGuiFont;
}

declare interface ImGui {
  GetNoitaFont(this: void): ImGuiFont;
}

declare interface ImGui {
  GetNoitaFont1_4x(this: void): ImGuiFont;
}

declare interface ImGui {
  GetNoitaFont1_8x(this: void): ImGuiFont;
}

declare interface ImGui {
  GetImGuiFont(this: void): ImGuiFont;
}

declare interface ImGui {
  GetMonospaceFont(this: void): ImGuiFont;
}

declare interface ImGui {
  GetGlyphFont(this: void): ImGuiFont;
}

declare interface ImGui {
  GetNotoFont(this: void): ImGuiFont;
}

declare interface ImGui {
  PushFont(this: void, font: ImGuiFont): void;
}

declare interface ImGui {
  PopFont(this: void): void;
}

declare interface ImGui {
  GetFont(this: void): ImGuiFont;
}

declare interface ImGui {
  GetFontSize(this: void): number;
}

declare interface ImGui {
  CalcTextSize(
    this: void,
    text: string,
    length?: number,
    hide_text_after_double_hash?: boolean,
    wrap_width?: number,
  ): LuaMultiReturn<[number, number]>;
}

declare enum WindowFlags {
  None = 0,
  NoTitleBar = 1,
  NoResize = 2,
  NoMove = 4,
  NoScrollbar = 8,
  NoScrollWithMouse = 16,
  NoCollapse = 32,
  AlwaysAutoResize = 64,
  NoBackground = 128,
  NoSavedSettings = 256,
  NoMouseInputs = 512,
  MenuBar = 1024,
  HorizontalScrollbar = 2048,
  NoFocusOnAppearing = 4096,
  NoBringToFrontOnFocus = 8192,
  AlwaysVerticalScrollbar = 16384,
  AlwaysHorizontalScrollbar = 32768,
  NoNavInputs = 65536,
  NoNavFocus = 131072,
  UnsavedDocument = 262144,
  NoDocking = 524288,
  NoNav = 196608,
  NoDecoration = 43,
  NoInputs = 197120,
}
declare interface ImGui {
  readonly WindowFlags: typeof WindowFlags;
}

declare enum FocusedFlags {
  None = 0,
  ChildWindows = 1,
  RootWindow = 2,
  AnyWindow = 4,
  NoPopupHierarchy = 8,
  DockHierarchy = 16,
  RootAndChildWindows = 3,
}
declare interface ImGui {
  readonly FocusedFlags: typeof FocusedFlags;
}

declare enum ChildFlags {
  None = 0,
  Border = 1,
  AlwaysUseWindowPadding = 2,
  ResizeX = 4,
  ResizeY = 8,
  AutoResizeX = 16,
  AutoResizeY = 32,
  AlwaysAutoResize = 64,
  FrameStyle = 128,
  NavFlattened = 256,
}
declare interface ImGui {
  readonly ChildFlags: typeof ChildFlags;
}

declare interface ImGui {
  Begin(
    this: void,
    name: string,
    open?: boolean,
    flags?: WindowFlags,
  ): LuaMultiReturn<[boolean, boolean | undefined]>;
}

declare interface ImGui {
  End(this: void): void;
}

declare interface ImGui {
  EndChild(this: void): void;
}

declare interface ImGui {
  IsWindowAppearing(this: void): boolean;
}

declare interface ImGui {
  IsWindowCollapsed(this: void): boolean;
}

declare interface ImGui {
  IsWindowFocused(this: void): boolean;
  IsWindowFocused(this: void, flags: FocusedFlags): boolean;
}

declare interface ImGui {
  IsWindowHovered(this: void): boolean;
  IsWindowHovered(this: void, flags: HoveredFlags): boolean;
}

declare interface ImGui {
  GetWindowPos(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetWindowSize(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetWindowWidth(this: void): number;
}

declare interface ImGui {
  GetWindowHeight(this: void): number;
}

declare interface ImGui {
  SetNextWindowPos(this: void, pos_x: number, pos_y: number): void;
  SetNextWindowPos(this: void, pos_x: number, pos_y: number, cond: Cond): void;
  SetNextWindowPos(
    this: void,
    pos_x: number,
    pos_y: number,
    cond: Cond,
    pivot_x: number,
    pivot_y: number,
  ): void;
}

declare interface ImGui {
  SetNextWindowSize(this: void, size_x: number, size_y: number): void;
  SetNextWindowSize(
    this: void,
    size_x: number,
    size_y: number,
    cond: Cond,
  ): void;
}

declare interface ImGui {
  SetNextWindowSizeConstraints(
    this: void,
    min_x: number,
    min_y: number,
    max_x: number,
    max_y: number,
  ): void;
}

declare interface ImGui {
  SetNextWindowContentSize(this: void, size_x: number, size_y: number): void;
}

declare interface ImGui {
  SetNextWindowCollapsed(this: void, collapsed: boolean): void;
  SetNextWindowCollapsed(this: void, collapsed: boolean, cond: Cond): void;
}

declare interface ImGui {
  SetNextWindowFocus(this: void): void;
}

declare interface ImGui {
  SetNextWindowBgAlpha(this: void, alpha: number): void;
}

declare interface ImGui {
  SetNextWindowViewport(this: void, viewport_id: number): void;
}

declare interface ImGui {
  SetWindowPos(this: void, pos_x: number, pos_y: number): void;
  SetWindowPos(this: void, pos_x: number, pos_y: number, cond: Cond): void;
  SetWindowPos(this: void, name: string, pos_x: number, pos_y: number): void;
  SetWindowPos(
    this: void,
    name: string,
    pos_x: number,
    pos_y: number,
    cond: Cond,
  ): void;
}

declare interface ImGui {
  SetWindowSize(this: void, pos_x: number, pos_y: number): void;
  SetWindowSize(this: void, pos_x: number, pos_y: number, cond: Cond): void;
  SetWindowSize(this: void, name: string, pos_x: number, pos_y: number): void;
  SetWindowSize(
    this: void,
    name: string,
    pos_x: number,
    pos_y: number,
    cond: Cond,
  ): void;
}

declare interface ImGui {
  SetWindowCollapsed(this: void, collapsed: boolean): void;
  SetWindowCollapsed(this: void, collapsed: boolean, cond: Cond): void;
  SetWindowCollapsed(this: void, name: string, collapsed: boolean): void;
  SetWindowCollapsed(
    this: void,
    name: string,
    collapsed: boolean,
    cond: Cond,
  ): void;
}

declare interface ImGui {
  SetWindowFocus(this: void, name: string): void;
  SetWindowFocus(this: void): void;
}

declare interface ImGui {
  GetContentRegionAvail(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetContentRegionMax(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetWindowContentRegionMin(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetWindowContentRegionMax(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetScrollX(this: void): number;
}

declare interface ImGui {
  GetScrollY(this: void): number;
}

declare interface ImGui {
  SetScrollX(this: void, scroll_x: number): void;
}

declare interface ImGui {
  SetScrollY(this: void, scroll_y: number): void;
}

declare interface ImGui {
  GetScrollMaxX(this: void): number;
}

declare interface ImGui {
  GetScrollMaxY(this: void): number;
}

declare interface ImGui {
  SetScrollHereX(this: void, center_x_ratio: number): void;
}

declare interface ImGui {
  SetScrollHereY(this: void, center_y_ratio: number): void;
}

declare interface ImGui {
  SetScrollFromPosX(this: void, local_x: number): void;
  SetScrollFromPosX(this: void, local_x: number, center_x_ratio: number): void;
}

declare interface ImGui {
  SetScrollFromPosY(this: void, local_y: number): void;
  SetScrollFromPosY(this: void, local_y: number, center_y_ratio: number): void;
}

declare interface ImGui {
  SetNextWindowScroll(this: void, x: number, y: number): void;
}

declare enum TreeNodeFlags {
  None = 0,
  Selected = 1,
  Framed = 2,
  AllowOverlap = 4,
  NoTreePushOnOpen = 8,
  NoAutoOpenOnLog = 16,
  DefaultOpen = 32,
  OpenOnDoubleClick = 64,
  OpenOnArrow = 128,
  Leaf = 256,
  Bullet = 512,
  FramePadding = 1024,
  SpanAvailWidth = 2048,
  SpanFullWidth = 4096,
  SpanTextWidth = 8192,
  SpanAllColumns = 16384,
  NavLeftJumpsBackHere = 32768,
  CollapsingHeader = 26,
}
declare interface ImGui {
  readonly TreeNodeFlags: typeof TreeNodeFlags;
}

declare interface ImGui {
  TreeNode(this: void, label: string): boolean;
  TreeNode(this: void, label: string, flags: TreeNodeFlags): boolean;
  TreeNode(
    this: void,
    label: string,
    flags: TreeNodeFlags,
    text: string,
  ): boolean;
}

declare interface ImGui {
  TreePush(this: void, str_id: string): void;
}

declare interface ImGui {
  TreePop(this: void): void;
}

declare interface ImGui {
  GetTreeNodeToLabelSpacing(this: void): number;
}

declare interface ImGui {
  CollapsingHeader(this: void, label: string): boolean;
  CollapsingHeader(this: void, label: string, flags: TreeNodeFlags): boolean;
  CollapsingHeader(
    this: void,
    label: string,
    visible: boolean,
  ): LuaMultiReturn<[boolean, boolean]>;
  CollapsingHeader(
    this: void,
    label: string,
    visible: boolean,
    flags: TreeNodeFlags,
  ): LuaMultiReturn<[boolean, boolean]>;
}

declare interface ImGui {
  SetNextItemOpen(this: void, is_open: boolean): void;
  SetNextItemOpen(this: void, is_open: boolean, cond: Cond): void;
}

declare interface ImGui {
  SetNextItemStorageID(this: void, storage_id: number): void;
}

declare interface ImGui {
  BeginDisabled(this: void): void;
  BeginDisabled(this: void, disabled: boolean): void;
}

declare interface ImGui {
  EndDisabled(this: void): void;
}

declare enum DrawFlags {
  None = 0,
  Closed = 1,
  RoundCornersTopLeft = 16,
  RoundCornersTopRight = 32,
  RoundCornersBottomLeft = 64,
  RoundCornersBottomRight = 128,
  RoundCornersNone = 256,
  RoundCornersTop = 48,
  RoundCornersBottom = 192,
  RoundCornersLeft = 80,
  RoundCornersRight = 160,
  RoundCornersAll = 240,
}
declare interface ImGui {
  readonly DrawFlags: typeof DrawFlags;
}

declare interface ImGuiDrawList {
  PushClipRect(
    clip_rect_min_x: number,
    clip_rect_min_y: number,
    clip_rect_max_x: number,
    clip_rect_max_y: number,
    intersect_with_current_clip_rect?: boolean,
  ): void;
}

declare interface ImGuiDrawList {
  PushClipRectFullScreen(): void;
}

declare interface ImGuiDrawList {
  PopClipRect(): void;
}

declare interface ImGuiDrawList {
  PushTextureID(img: ImGuiLuaImage): void;
}

declare interface ImGuiDrawList {
  PopTextureID(): void;
}

declare interface ImGuiDrawList {
  GetClipRectMin(): LuaMultiReturn<[number, number]>;
}

declare interface ImGuiDrawList {
  GetClipRectMax(): LuaMultiReturn<[number, number]>;
}

declare interface ImGuiDrawList {
  AddLine(
    p1_x: number,
    p1_y: number,
    p2_x: number,
    p2_y: number,
    col: number,
    thickness?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddRect(
    p_min_x: number,
    p_min_y: number,
    p_max_x: number,
    p_max_y: number,
    col: number,
    rounding?: number,
    flags?: number,
    thickness?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddRectFilled(
    p_min_x: number,
    p_min_y: number,
    p_max_x: number,
    p_max_y: number,
    col: number,
    rounding?: number,
    flags?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddRectFilledMultiColor(
    p_min_x: number,
    p_min_y: number,
    p_max_x: number,
    p_max_y: number,
    col_upr_left: number,
    col_upr_right: number,
    col_bot_right: number,
    col_bot_left: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddQuad(
    p1_x: number,
    p1_y: number,
    p2_x: number,
    p2_y: number,
    p3_x: number,
    p3_y: number,
    p4_x: number,
    p4_y: number,
    col: number,
    thickness?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddQuadFilled(
    p1_x: number,
    p1_y: number,
    p2_x: number,
    p2_y: number,
    p3_x: number,
    p3_y: number,
    p4_x: number,
    p4_y: number,
    col: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddTriangle(
    p1_x: number,
    p1_y: number,
    p2_x: number,
    p2_y: number,
    p3_x: number,
    p3_y: number,
    col: number,
    thickness?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddTriangleFilled(
    p1_x: number,
    p1_y: number,
    p2_x: number,
    p2_y: number,
    p3_x: number,
    p3_y: number,
    col: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddCircle(
    center_x: number,
    center_y: number,
    radius: number,
    col: number,
    num_segments?: number,
    thickness?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddCircleFilled(
    center_x: number,
    center_y: number,
    radius: number,
    col: number,
    num_segments?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddNgon(
    center_x: number,
    center_y: number,
    radius: number,
    col: number,
    num_segments?: number,
    thickness?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddNgonFilled(
    center_x: number,
    center_y: number,
    radius: number,
    col: number,
    num_segments?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddEllipse(
    center_x: number,
    center_y: number,
    radius_x: number,
    radius_y: number,
    col: number,
    rot?: number,
    num_segments?: number,
    thickness?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddEllipseFilled(
    center_x: number,
    center_y: number,
    radius_x: number,
    radius_y: number,
    col: number,
    rot?: number,
    num_segments?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddText(pos_x: number, pos_y: number, col: number, text: string): void;
  AddText(
    font: ImGuiFont,
    font_size: number,
    pos_x: number,
    pos_y: number,
    col: number,
    text: string,
  ): void;
}

declare interface ImGuiDrawList {
  AddBezierCubic(
    p1_x: number,
    p1_y: number,
    p2_x: number,
    p2_y: number,
    p3_x: number,
    p3_y: number,
    p4_x: number,
    p4_y: number,
    col: number,
    thickness: number,
    num_segments?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddBezierQuadratic(
    p1_x: number,
    p1_y: number,
    p2_x: number,
    p2_y: number,
    p3_x: number,
    p3_y: number,
    col: number,
    thickness: number,
    num_segments?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddImage(
    img: ImGuiLuaImage,
    p_min_x: number,
    p_min_y: number,
    p_max_x: number,
    p_max_y: number,
    uv_min_x?: number,
    uv_min_y?: number,
    uv_max_x?: number,
    uv_max_y?: number,
    col?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddImageQuad(
    img: ImGuiLuaImage,
    p1_x: number,
    p1_y: number,
    p2_x: number,
    p2_y: number,
    p3_x: number,
    p3_y: number,
    p4_x: number,
    p4_y: number,
    uv1_x?: number,
    uv1_y?: number,
    uv2_x?: number,
    uv2_y?: number,
    uv3_x?: number,
    uv3_y?: number,
    uv4_x?: number,
    uv4_y?: number,
    col?: number,
  ): void;
}

declare interface ImGuiDrawList {
  AddImageRounded(
    img: ImGuiLuaImage,
    p_min_x: number,
    p_min_y: number,
    p_max_x: number,
    p_max_y: number,
    uv_min_x: number,
    uv_min_y: number,
    uv_max_x: number,
    uv_max_y: number,
    col: number,
    rounding: number,
    flags?: number,
  ): void;
}

declare interface ImGuiDrawList {
  PathClear(): void;
}

declare interface ImGuiDrawList {
  PathLineTo(pos_x: number, pos_y: number): void;
}

declare interface ImGuiDrawList {
  PathLineToMergeDuplicate(pos_x: number, pos_y: number): void;
}

declare interface ImGuiDrawList {
  PathFillConvex(col: number): void;
}

declare interface ImGuiDrawList {
  PathFillConcave(col: number): void;
}

declare interface ImGuiDrawList {
  PathStroke(col: number, flags?: number, thickness?: number): void;
}

declare interface ImGuiDrawList {
  PathArcTo(
    center_x: number,
    center_y: number,
    radius: number,
    a_min: number,
    a_max: number,
    num_segments?: number,
  ): void;
}

declare interface ImGuiDrawList {
  PathArcToFast(
    center_x: number,
    center_y: number,
    radius: number,
    a_min_of_12: number,
    a_max_of_12: number,
  ): void;
}

declare interface ImGuiDrawList {
  PathEllipticalArcTo(
    center_x: number,
    center_y: number,
    radius_x: number,
    radius_y: number,
    rot: number,
    a_min: number,
    a_max: number,
    num_segments?: number,
  ): void;
}

declare interface ImGuiDrawList {
  PathBezierCubicCurveTo(
    p2_x: number,
    p2_y: number,
    p3_x: number,
    p3_y: number,
    p4_x: number,
    p4_y: number,
    num_segments?: number,
  ): void;
}

declare interface ImGuiDrawList {
  PathBezierQuadraticCurveTo(
    p2_x: number,
    p2_y: number,
    p3_x: number,
    p3_y: number,
    num_segments?: number,
  ): void;
}

declare interface ImGuiDrawList {
  PathRect(
    rect_min_x: number,
    rect_min_y: number,
    rect_max_x: number,
    rect_max_y: number,
    rounding?: number,
    flags?: number,
  ): void;
}

declare interface ImGui {
  GetWindowDrawList(this: void): ImGuiDrawList;
}

declare interface ImGui {
  GetBackgroundDrawList(this: void): ImGuiDrawList;
  GetBackgroundDrawList(this: void, viewport: ImGuiViewport): ImGuiDrawList;
}

declare interface ImGui {
  GetForegroundDrawList(this: void): ImGuiDrawList;
  GetForegroundDrawList(this: void, viewport: ImGuiViewport): ImGuiDrawList;
}

declare interface ImGui {
  ColorConvertU32ToFloat4(
    this: void,
    in_: number,
  ): LuaMultiReturn<[number, number, number, number]>;
}

declare interface ImGui {
  ColorConvertFloat4ToU32(
    this: void,
    x: number,
    y: number,
    z: number,
    w: number,
  ): number;
}

declare interface ImGui {
  ColorConvertRGBtoHSV(
    this: void,
    r: number,
    g: number,
    b: number,
  ): LuaMultiReturn<[number, number, number]>;
}

declare interface ImGui {
  ColorConvertHSVtoRGB(
    this: void,
    h: number,
    s: number,
    v: number,
  ): LuaMultiReturn<[number, number, number]>;
}

declare enum HoveredFlags {
  None = 0,
  ChildWindows = 1,
  RootWindow = 2,
  AnyWindow = 4,
  NoPopupHierarchy = 8,
  DockHierarchy = 16,
  AllowWhenBlockedByPopup = 32,
  AllowWhenBlockedByActiveItem = 128,
  AllowWhenOverlappedByItem = 256,
  AllowWhenOverlappedByWindow = 512,
  AllowWhenDisabled = 1024,
  NoNavOverride = 2048,
  AllowWhenOverlapped = 768,
  RectOnly = 928,
  RootAndChildWindows = 3,
  ForTooltip = 4096,
  Stationary = 8192,
  DelayNone = 16384,
  DelayShort = 32768,
  DelayNormal = 65536,
  NoSharedDelay = 131072,
}
declare interface ImGui {
  readonly HoveredFlags: typeof HoveredFlags;
}

declare interface ImGui {
  IsItemHovered(this: void): boolean;
  IsItemHovered(this: void, flags: HoveredFlags): boolean;
}

declare interface ImGui {
  IsItemActive(this: void): boolean;
}

declare interface ImGui {
  IsItemFocused(this: void): boolean;
}

declare interface ImGui {
  IsItemClicked(this: void): boolean;
  IsItemClicked(this: void, mouse_button: MouseButton): boolean;
}

declare interface ImGui {
  IsItemVisible(this: void): boolean;
}

declare interface ImGui {
  IsItemEdited(this: void): boolean;
}

declare interface ImGui {
  IsItemActivated(this: void): boolean;
}

declare interface ImGui {
  IsItemDeactivated(this: void): boolean;
}

declare interface ImGui {
  IsItemDeactivatedAfterEdit(this: void): boolean;
}

declare interface ImGui {
  IsItemToggledOpen(this: void): boolean;
}

declare interface ImGui {
  IsAnyItemHovered(this: void): boolean;
}

declare interface ImGui {
  IsAnyItemActive(this: void): boolean;
}

declare interface ImGui {
  IsAnyItemFocused(this: void): boolean;
}

declare interface ImGui {
  GetItemID(this: void): number;
}

declare interface ImGui {
  GetItemRectMin(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetItemRectMax(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  GetItemRectSize(this: void): LuaMultiReturn<[number, number]>;
}

declare interface ImGui {
  SetNextItemAllowOverlap(this: void): void;
}

declare enum PopupFlags {
  None = 0,
  MouseButtonLeft = 0,
  MouseButtonRight = 1,
  MouseButtonMiddle = 2,
  MouseButtonMask_ = 31,
  MouseButtonDefault_ = 1,
  NoReopen = 32,
  NoOpenOverExistingPopup = 128,
  NoOpenOverItems = 256,
  AnyPopupId = 1024,
  AnyPopupLevel = 2048,
  AnyPopup = 3072,
}
declare interface ImGui {
  readonly PopupFlags: typeof PopupFlags;
}

declare interface ImGui {
  BeginPopup(this: void, str_id: string): boolean;
  BeginPopup(this: void, str_id: string, flags: WindowFlags): boolean;
}

declare interface ImGui {
  BeginPopupModal(this: void, str_id: string): boolean;
  BeginPopupModal(
    this: void,
    str_id: string,
    open: boolean,
  ): LuaMultiReturn<[boolean, boolean]>;
  BeginPopupModal(
    this: void,
    str_id: string,
    open: boolean,
    flags: WindowFlags,
  ): LuaMultiReturn<[boolean, boolean]>;
}

declare interface ImGui {
  EndPopup(this: void): void;
}

declare interface ImGui {
  OpenPopup(this: void, str_id: string): void;
  OpenPopup(this: void, str_id: string, popup_flags: PopupFlags): void;
  OpenPopup(this: void, id: number): void;
  OpenPopup(this: void, id: number, popup_flags: PopupFlags): void;
}

declare interface ImGui {
  OpenPopupOnItemClick(this: void): void;
  OpenPopupOnItemClick(this: void, str_id: string): void;
  OpenPopupOnItemClick(
    this: void,
    str_id: string,
    popup_flags: PopupFlags,
  ): void;
}

declare interface ImGui {
  CloseCurrentPopup(this: void): void;
}

declare interface ImGui {
  BeginPopupContextItem(this: void): boolean;
  BeginPopupContextItem(this: void, str_id: string): boolean;
  BeginPopupContextItem(
    this: void,
    str_id: string,
    popup_flags: PopupFlags,
  ): boolean;
}

declare interface ImGui {
  BeginPopupContextWindow(this: void): boolean;
  BeginPopupContextWindow(this: void, str_id: string): boolean;
  BeginPopupContextWindow(
    this: void,
    str_id: string,
    popup_flags: PopupFlags,
  ): boolean;
}

declare interface ImGui {
  BeginPopupContextVoid(this: void): boolean;
  BeginPopupContextVoid(this: void, str_id: string): boolean;
  BeginPopupContextVoid(
    this: void,
    str_id: string,
    popup_flags: PopupFlags,
  ): boolean;
}

declare interface ImGui {
  IsPopupOpen(this: void, str_id: string): boolean;
  IsPopupOpen(this: void, str_id: string, flags: PopupFlags): boolean;
}

declare enum ColorEditFlags {
  None = 0,
  NoAlpha = 2,
  NoPicker = 4,
  NoOptions = 8,
  NoSmallPreview = 16,
  NoInputs = 32,
  NoTooltip = 64,
  NoLabel = 128,
  NoSidePreview = 256,
  NoDragDrop = 512,
  NoBorder = 1024,
  AlphaBar = 65536,
  AlphaPreview = 131072,
  AlphaPreviewHalf = 262144,
  HDR = 524288,
  DisplayRGB = 1048576,
  DisplayHSV = 2097152,
  DisplayHex = 4194304,
  Uint8 = 8388608,
  Float = 16777216,
  PickerHueBar = 33554432,
  PickerHueWheel = 67108864,
  InputRGB = 134217728,
  InputHSV = 268435456,
  DefaultOptions_ = 177209344,
}
declare interface ImGui {
  readonly ColorEditFlags: typeof ColorEditFlags;
}

declare interface ImGui {
  ColorEdit3(
    this: void,
    label: string,
    r: number,
    g: number,
    b: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  ColorEdit3(
    this: void,
    label: string,
    r: number,
    g: number,
    b: number,
    flags: ColorEditFlags,
  ): LuaMultiReturn<[boolean, number, number, number]>;
}

declare interface ImGui {
  ColorEdit4(
    this: void,
    label: string,
    r: number,
    g: number,
    b: number,
    a: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  ColorEdit4(
    this: void,
    label: string,
    r: number,
    g: number,
    b: number,
    a: number,
    flags: ColorEditFlags,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
}

declare interface ImGui {
  ColorPicker3(
    this: void,
    label: string,
    r: number,
    g: number,
    b: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  ColorPicker3(
    this: void,
    label: string,
    r: number,
    g: number,
    b: number,
    flags: ColorEditFlags,
  ): LuaMultiReturn<[boolean, number, number, number]>;
}

declare interface ImGui {
  ColorPicker4(
    this: void,
    label: string,
    r: number,
    g: number,
    b: number,
    a: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  ColorPicker4(
    this: void,
    label: string,
    r: number,
    g: number,
    b: number,
    a: number,
    flags: ColorEditFlags,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
}

declare interface ImGui {
  ColorButton(
    this: void,
    desc_id: string,
    r: number,
    g: number,
    b: number,
    a: number,
  ): boolean;
  ColorButton(
    this: void,
    desc_id: string,
    r: number,
    g: number,
    b: number,
    a: number,
    flags: ColorEditFlags,
  ): boolean;
  ColorButton(
    this: void,
    desc_id: string,
    r: number,
    g: number,
    b: number,
    a: number,
    flags: ColorEditFlags,
    size_x: number,
    size_y: number,
  ): boolean;
}

declare interface ImGui {
  SliderFloat(
    this: void,
    label: string,
    v: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number]>;
  SliderFloat(
    this: void,
    label: string,
    v: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number]>;
  SliderFloat(
    this: void,
    label: string,
    v: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number]>;
}

declare interface ImGui {
  SliderFloat2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  SliderFloat2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number]>;
  SliderFloat2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number]>;
}

declare interface ImGui {
  SliderFloat3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  SliderFloat3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  SliderFloat3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number, number]>;
}

declare interface ImGui {
  SliderFloat4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  SliderFloat4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  SliderFloat4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
}

declare interface ImGui {
  SliderInt(
    this: void,
    label: string,
    v: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number]>;
  SliderInt(
    this: void,
    label: string,
    v: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number]>;
  SliderInt(
    this: void,
    label: string,
    v: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number]>;
}

declare interface ImGui {
  SliderInt2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number]>;
  SliderInt2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number]>;
  SliderInt2(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number]>;
}

declare interface ImGui {
  SliderInt3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  SliderInt3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number, number]>;
  SliderInt3(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number, number]>;
}

declare interface ImGui {
  SliderInt4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_min: number,
    v_max: number,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  SliderInt4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_min: number,
    v_max: number,
    format: string,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
  SliderInt4(
    this: void,
    label: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v_min: number,
    v_max: number,
    format: string,
    flags: SliderFlags,
  ): LuaMultiReturn<[boolean, number, number, number, number]>;
}

declare interface ImGui {
  LoadImage(this: void, image_path: string): ImGuiLuaImage | undefined;
}

declare interface ImGui {
  Image(this: void, img: ImGuiLuaImage, size_w: number, size_h: number): void;
  Image(
    this: void,
    img: ImGuiLuaImage,
    size_w: number,
    size_h: number,
    uv0_x: number,
    uv0_y: number,
  ): void;
  Image(
    this: void,
    img: ImGuiLuaImage,
    size_w: number,
    size_h: number,
    uv0_x: number,
    uv0_y: number,
    uv1_x: number,
    uv1_y: number,
  ): void;
  Image(
    this: void,
    img: ImGuiLuaImage,
    size_w: number,
    size_h: number,
    uv0_x: number,
    uv0_y: number,
    uv1_x: number,
    uv1_y: number,
    tint_col_r: number,
    tint_col_g: number,
    tint_col_b: number,
    tint_col_a: number,
  ): void;
  Image(
    this: void,
    img: ImGuiLuaImage,
    size_w: number,
    size_h: number,
    uv0_x: number,
    uv0_y: number,
    uv1_x: number,
    uv1_y: number,
    tint_col_r: number,
    tint_col_g: number,
    tint_col_b: number,
    tint_col_a: number,
    border_col_r: number,
    border_col_g: number,
    border_col_b: number,
    border_col_a: number,
  ): void;
}

declare interface ImGui {
  ImageButton(
    this: void,
    str_id: string,
    img: ImGuiLuaImage,
    size_w: number,
    size_h: number,
  ): boolean | undefined;
  ImageButton(
    this: void,
    str_id: string,
    img: ImGuiLuaImage,
    size_w: number,
    size_h: number,
    uv0_x: number,
    uv0_y: number,
  ): boolean | undefined;
  ImageButton(
    this: void,
    str_id: string,
    img: ImGuiLuaImage,
    size_w: number,
    size_h: number,
    uv0_x: number,
    uv0_y: number,
    uv1_x: number,
    uv1_y: number,
  ): boolean | undefined;
  ImageButton(
    this: void,
    str_id: string,
    img: ImGuiLuaImage,
    size_w: number,
    size_h: number,
    uv0_x: number,
    uv0_y: number,
    uv1_x: number,
    uv1_y: number,
    bg_col_r: number,
    bg_col_g: number,
    bg_col_b: number,
    bg_col_a: number,
  ): boolean | undefined;
  ImageButton(
    this: void,
    str_id: string,
    img: ImGuiLuaImage,
    size_w: number,
    size_h: number,
    uv0_x: number,
    uv0_y: number,
    uv1_x: number,
    uv1_y: number,
    bg_col_r: number,
    bg_col_g: number,
    bg_col_b: number,
    bg_col_a: number,
    tint_col_r: number,
    tint_col_g: number,
    tint_col_b: number,
    tint_col_a: number,
  ): boolean | undefined;
}
