// types.ts
export interface CanvasElement {
  id: string;
  type: "text" | "image" | "shape" | "sticker" | "widget";
  top: number;
  left: number;
  width: number;
  height: number | "auto";
  rotation: number;
  scaleX: number;
  scaleY: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  opacity: number;
  borderRadius: number;
  border: { width: number; color: string; style: string };
  shadow: {
    offsetX: number;
    offsetY: number;
    blur: number;
    spread: number;
    color: string;
  } | null;
  entrance: { type: string; duration: number; delay: number } | null;
  continuous: { type: string; duration: number } | null;
  props: TextProps | ImageProps | ShapeProps | StickerProps | WidgetProps;
}

export interface TextProps {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  backgroundColor: string;
  textAlign: "left" | "center" | "right" | "justify";
  lineHeight: number;
  letterSpacing: number;
}

export interface ImageProps {
  src: string;
  objectFit: "cover" | "contain" | "fill";
  crop: { x: number; y: number; width: number; height: number } | null;
}

export interface StickerProps {
  stickerId: string;
  color: string;
  size: number;
  customSvg?: string;
}

export interface ShapeProps {
  shapeType: "rectangle" | "circle" | "line" | "star" | "heart" | "triangle";
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface WidgetProps {
  widgetType:
    | "countdown"
    | "calendar"
    | "map"
    | "rsvp"
    | "qrbox"
    | "album"
    | "envelope"
    | "youtube"
    | "callbutton"
    | "guestname"
    | "formbuilder"
    | "music"
    | "waxseal";
  config: Record<string, unknown>;
}

export interface GuideLine {
  orientation: "horizontal" | "vertical";
  position: number;
}

export type EditorAction =
  | { type: "SET_ELEMENTS"; elements: CanvasElement[] }
  | { type: "SELECT"; id: string | null }
  | { type: "MULTI_SELECT"; ids: string[] }
  | { type: "UPDATE_ELEMENT"; id: string; patch: Partial<CanvasElement> }
  | { type: "UPDATE_PROPS"; id: string; props: Partial<CanvasElement["props"]> }
  | { type: "ADD_ELEMENT"; element: CanvasElement }
  | { type: "DELETE_ELEMENT"; id: string }
  | { type: "REORDER"; id: string; direction: "front" | "back" | "up" | "down" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_CANVAS"; width: number; height: number; background: string }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "SNAPSHOT" }
  | { type: "SET_GUIDES"; guides: GuideLine[] };

export interface EditorState {
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  canvasBackground: string;
  selectedId: string | null;
  multiSelectIds: string[];
  zoom: number;
  undoStack: CanvasElement[][];
  redoStack: CanvasElement[][];
  activeGuides: GuideLine[];
}

const VALID_TYPES = new Set(["text", "image", "shape", "sticker", "widget"]);

/** Sanitize elements loaded from JSON — ensures required fields exist */
export function sanitizeElements(raw: unknown[]): CanvasElement[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((el): el is Record<string, unknown> => {
      if (!el || typeof el !== "object") return false;
      const e = el as Record<string, unknown>;
      return (
        typeof e.id === "string" &&
        typeof e.type === "string" &&
        VALID_TYPES.has(e.type) &&
        typeof e.top === "number" &&
        typeof e.left === "number" &&
        typeof e.width === "number"
      );
    })
    .map((e) => ({
      id: e.id as string,
      type: e.type as CanvasElement["type"],
      top: e.top as number,
      left: e.left as number,
      width: e.width as number,
      height: typeof e.height === "number" ? e.height : "auto",
      rotation: typeof e.rotation === "number" ? e.rotation : 0,
      scaleX: typeof e.scaleX === "number" ? e.scaleX : 1,
      scaleY: typeof e.scaleY === "number" ? e.scaleY : 1,
      zIndex: typeof e.zIndex === "number" ? e.zIndex : 0,
      locked: typeof e.locked === "boolean" ? e.locked : false,
      visible: typeof e.visible === "boolean" ? e.visible : true,
      opacity: typeof e.opacity === "number" ? e.opacity : 1,
      borderRadius: typeof e.borderRadius === "number" ? e.borderRadius : 0,
      border:
        e.border && typeof e.border === "object"
          ? (e.border as CanvasElement["border"])
          : { width: 0, color: "transparent", style: "solid" },
      shadow:
        e.shadow && typeof e.shadow === "object"
          ? (e.shadow as CanvasElement["shadow"])
          : null,
      entrance:
        e.entrance && typeof e.entrance === "object"
          ? (e.entrance as CanvasElement["entrance"])
          : null,
      continuous:
        e.continuous && typeof e.continuous === "object"
          ? (e.continuous as CanvasElement["continuous"])
          : null,
      props: (e.props || {}) as CanvasElement["props"],
    })) as CanvasElement[];
}

/** Factory: create default text element */
export function createTextElement(
  id: string,
  top: number,
  left: number,
  text: string,
  overrides?: Partial<CanvasElement>,
): CanvasElement {
  return {
    id,
    type: "text",
    top,
    left,
    width: 200,
    height: "auto",
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    zIndex: 0,
    locked: false,
    visible: true,
    opacity: 1,
    borderRadius: 0,
    border: { width: 0, color: "transparent", style: "solid" },
    shadow: null,
    entrance: null,
    continuous: null,
    props: {
      text,
      fontFamily: "'Playfair Display', serif",
      fontSize: 16,
      fontWeight: "normal",
      fontStyle: "normal",
      color: "#1f2937",
      backgroundColor: "transparent",
      textAlign: "center",
      lineHeight: 1.4,
      letterSpacing: 0,
    } as TextProps,
    ...overrides,
  };
}

/** Factory: create default shape element */
export function createShapeElement(
  id: string,
  top: number,
  left: number,
  shapeType: ShapeProps["shapeType"] = "rectangle",
  overrides?: Partial<CanvasElement>,
): CanvasElement {
  return {
    id,
    type: "shape",
    top,
    left,
    width: 150,
    height: 150,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    zIndex: 0,
    locked: false,
    visible: true,
    opacity: 1,
    borderRadius: 0,
    border: { width: 0, color: "transparent", style: "solid" },
    shadow: null,
    entrance: null,
    continuous: null,
    props: {
      shapeType,
      fill: "#3b82f6",
      stroke: "transparent",
      strokeWidth: 0,
    } as ShapeProps,
    ...overrides,
  };
}

/** Factory: create default image element */
export function createImageElement(
  id: string,
  top: number,
  left: number,
  src: string,
  overrides?: Partial<CanvasElement>,
): CanvasElement {
  return {
    id,
    type: "image",
    top,
    left,
    width: 300,
    height: 200,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    zIndex: 0,
    locked: false,
    visible: true,
    opacity: 1,
    borderRadius: 12,
    border: { width: 0, color: "transparent", style: "solid" },
    shadow: null,
    entrance: null,
    continuous: null,
    props: {
      src,
      objectFit: "cover",
      crop: null,
    } as ImageProps,
    ...overrides,
  };
}
