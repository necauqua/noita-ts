/**
 * Hoisted from data/scripts/gun/gun_enums.lua for ease of use from TypeScript.
 */
export enum ActionType {
  Projectile = 0,
  StaticProjectile = 1,
  Modifier = 2,
  DrawMany = 3,
  Material = 4,
  Other = 5,
  Utility = 6,
  Passive = 7,
}

/**
 * Hoisted from data/scripts/lib/utilities.lua for ease of use from TypeScript.
 */
export enum GuiOption {
  None = 0,

  // you might not want to use this, because there will be various corner cases and bugs, but feel free to try anyway.
  IsDraggable = 1,

  // works with GuiButton
  NonInteractive = 2,

  AlwaysClickable = 3,
  ClickCancelsDoubleClick = 4,
  IgnoreContainer = 5,
  NoPositionTween = 6,
  ForceFocusable = 7,
  HandleDoubleClickAsClick = 8,

  // it's recommended you use this to communicate the widget where gamepad input will focus when entering a new menu
  GamepadDefaultWidget = 9,

  // these work as intended (mostly)
  Layout_InsertOutsideLeft = 10,
  Layout_InsertOutsideRight = 11,
  Layout_InsertOutsideAbove = 12,
  Layout_ForceCalculate = 13,
  Layout_NextSameLine = 14,
  Layout_NoLayouting = 15,

  // these work as intended (mostly)
  Align_HorizontalCenter = 16,
  Align_Left = 17,

  FocusSnapToRightEdge = 18,

  NoPixelSnapY = 19,

  DrawAlwaysVisible = 20,
  DrawNoHoverAnimation = 21,
  DrawWobble = 22,
  DrawFadeIn = 23,
  DrawScaleIn = 24,
  DrawWaveAnimateOpacity = 25,
  DrawSemiTransparent = 26,
  DrawActiveWidgetCursorOnBothSides = 27,
  DrawActiveWidgetCursorOff = 28,

  TextRichRendering = 29,

  NoSound = 47,
  Hack_ForceClick = 48,
  Hack_AllowDuplicateIds = 49,

  ScrollContainer_Smooth = 50,
  IsExtraDraggable = 51,

  _SnapToCenter = 62,
  Disabled = 63,
}
