"use client";

import { useReducer, useCallback } from "react";

// ── Types ──
export type ElementType = "text" | "image" | "sticker" | "shape" | "widget";

export interface TextProps {
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string; // text background/highlight color
    textAlign: "left" | "center" | "right" | "justify";
    fontWeight: "normal" | "bold";
    fontStyle: "normal" | "italic";
    textDecoration: "none" | "underline" | "line-through";
    lineHeight: number;
    letterSpacing: number; // px
    textShadow: {
        active: boolean;
        color: string;
        blur: number;
        x: number;
        y: number;
    };
    textTransform: "none" | "uppercase" | "capitalize" | "lowercase";
}

export interface ImageProps {
    src: string;
    objectFit: "cover" | "contain";
    borderRadius: number;
    opacity: number;
    filter?: string; // CSS filter string
    borderWidth: number;
    borderColor: string;
    // image filters
    brightness: number; // 0-200
    contrast: number;   // 0-200
    saturation: number; // 0-200
    // border style
    borderStyle: "solid" | "dashed" | "dotted";
    // box shadow
    boxShadow: string;
    // padding
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
}

export interface WidgetProps {
    widgetType: "calendar" | "countdown" | "map" | "qr" | "gift" | "rsvp" | "youtube" | "call" | "album" | "guestname" | "waxseal" | "envelope" | "music";
    label: string;
    targetDate?: string;
    lunarDate?: string;
    mapUrl?: string;
    venueName?: string;
    venueAddress?: string;
    qrValue?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    youtubeUrl?: string;
    rsvpTitle?: string;
    rsvpSubtitle?: string;
    // Sprint 44: Custom RSVP form fields
    rsvpFields?: { id: string; label: string; type: "text" | "phone" | "number" | "select" | "textarea"; required: boolean; options?: string }[];
    rsvpButtonText?: string;
    rsvpShowDietary?: boolean;
    rsvpShowGuestCount?: boolean;
    rsvpShowMessage?: boolean;
    rsvpShowPhone?: boolean;
    phoneNumber?: string;
    albumImages?: string;
    albumTitle?: string;
    albumLayout?: "grid" | "carousel" | "parallax_3d" | string;
    layout?: string;
    title?: string;
    guestNameLabel?: string;
    monogram?: string;
    waxColor?: string;
    waxIcon?: string;
    groomName?: string;
    brideName?: string;
    envelopeColor?: string;
}

export interface ElementAnimation {
    entrance: "none" | "fadeIn" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "zoomIn" | "bounceIn";
    loop: "none" | "pulse" | "float" | "shake";
}

export interface CanvasSection {
    id: string;
    name: string;
    height: number;
}

export interface CanvasElement {
    id: string;
    sectionId: string; // which section it belongs to
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    zIndex: number;
    locked: boolean;
    animation?: ElementAnimation;
    props: Partial<TextProps & ImageProps & WidgetProps>;
}

export type ParticleEffect = "petals" | "hearts" | "bokeh" | "snow" | "none";
export type IntroEffect = "none" | "envelope" | "fade" | "slide" | "curtainPink" | "curtainBlue" | "curtainGold";
export type MusicIconStyle = "vinyl" | "note" | "miniplayer" | "wave";
export type EntranceAnimation = "none" | "fadeInAll" | "slideUpAll" | "scaleInAll" | "flipInAll" | "slideUpMix" | "fadeInMix";

export interface CanvasState {
    width: number;
    height: number;
    background: string; // global background or first section background
    sections: CanvasSection[];
    elements: CanvasElement[];
    selectedId: string | null;
    zoom: number;
    past: { elements: CanvasElement[], sections: CanvasSection[] }[];
    future: { elements: CanvasElement[], sections: CanvasSection[] }[];
    particleEffect: ParticleEffect;
    introEffect: IntroEffect;
    musicIconStyle: MusicIconStyle;
    entranceAnimation: EntranceAnimation;
}

const MAX_HISTORY = 50;

// ── Actions ──
export type Action =
    | { type: "ADD_ELEMENT"; element: CanvasElement }
    | { type: "UPDATE_ELEMENT"; id: string; changes: Partial<CanvasElement> }
    | { type: "DELETE_ELEMENT"; id: string }
    | { type: "SELECT"; id: string | null }
    | { type: "MOVE"; id: string; x: number; y: number; sectionId?: string }
    | { type: "RESIZE"; id: string; x: number; y: number; width: number; height: number }
    | { type: "SET_BACKGROUND"; background: string }
    | { type: "SET_ZOOM"; zoom: number }
    | { type: "UNDO" }
    | { type: "REDO" }
    | { type: "LOAD"; elements: CanvasElement[]; background?: string; sections?: CanvasSection[] }
    | { type: "BRING_FORWARD"; id: string }
    | { type: "SEND_BACKWARD"; id: string }
    | { type: "DUPLICATE"; id: string }
    | { type: "SET_PARTICLE_EFFECT"; effect: ParticleEffect }
    | { type: "SET_INTRO_EFFECT"; effect: IntroEffect }
    | { type: "SET_MUSIC_ICON_STYLE"; style: MusicIconStyle }
    | { type: "SET_ENTRANCE_ANIMATION"; animation: EntranceAnimation }
    | { type: "ADD_SECTION" }
    | { type: "UPDATE_SECTION"; id: string; changes: Partial<CanvasSection> }
    | { type: "DELETE_SECTION"; id: string }
    | { type: "MOVE_SECTION_UP"; id: string }
    | { type: "MOVE_SECTION_DOWN"; id: string }
    | { type: "SET_CANVAS_SIZE"; width: number; height: number };

function snapshot(state: CanvasState): { elements: CanvasElement[], sections: CanvasSection[] } {
    return JSON.parse(JSON.stringify({ elements: state.elements, sections: state.sections }));
}

function withHistory(state: CanvasState, newElements: CanvasElement[], newSections?: CanvasSection[]): CanvasState {
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    return { ...state, elements: newElements, sections: newSections || state.sections, past, future: [] };
}

export function canvasReducer(state: CanvasState, action: Action): CanvasState {
    switch (action.type) {
        case "ADD_ELEMENT": {
            const maxZ = state.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
            const el = { ...action.element, zIndex: maxZ + 1 };
            // Ensure sectionId exists, default to first section
            if (!el.sectionId && state.sections.length > 0) {
                el.sectionId = state.sections[0].id;
            }
            return withHistory(state, [...state.elements, el]);
        }
        case "UPDATE_ELEMENT": {
            const updated = state.elements.map(e =>
                e.id === action.id ? { ...e, ...action.changes } : e
            );
            return withHistory(state, updated);
        }
        case "DELETE_ELEMENT": {
            const filtered = state.elements.filter(e => e.id !== action.id);
            return { ...withHistory(state, filtered), selectedId: null };
        }
        case "SELECT":
            return { ...state, selectedId: action.id };
        case "MOVE": {
            const moved = state.elements.map(e =>
                e.id === action.id ? { ...e, x: action.x, y: action.y, sectionId: action.sectionId || e.sectionId } : e
            );
            return { ...state, elements: moved }; // no history on drag (too noisy)
        }
        case "RESIZE": {
            const resized = state.elements.map(e =>
                e.id === action.id ? { ...e, x: action.x, y: action.y, width: action.width, height: action.height } : e
            );
            return withHistory(state, resized);
        }
        case "SET_BACKGROUND":
            return { ...withHistory(state, state.elements), background: action.background };
        case "SET_ZOOM":
            return { ...state, zoom: action.zoom };
        case "SET_PARTICLE_EFFECT":
            return { ...state, particleEffect: action.effect };
        case "SET_INTRO_EFFECT":
            return { ...state, introEffect: action.effect };
        case "SET_MUSIC_ICON_STYLE":
            return { ...state, musicIconStyle: action.style };
        case "LOAD": {
            // Backward compatibility
            const loadedSections = action.sections && action.sections.length > 0 
                ? action.sections 
                : [{ id: "section-1", name: "Trang bìa", height: 844 }];
            const loadedElements = action.elements.map(el => ({
                ...el,
                sectionId: el.sectionId || loadedSections[0].id
            }));
            return { 
                ...state, 
                elements: loadedElements, 
                sections: loadedSections,
                background: action.background || state.background, 
                past: [], 
                future: [], 
                selectedId: null 
            };
        }
        case "BRING_FORWARD": {
            const el = state.elements.find(e => e.id === action.id);
            if (!el) return state;
            const above = state.elements.filter(e => e.zIndex > el.zIndex);
            const nextZ = above.length > 0 ? Math.min(...above.map(e => e.zIndex)) + 1 : el.zIndex + 1;
            const updated = state.elements.map(e =>
                e.id === action.id ? { ...e, zIndex: nextZ } : (e.zIndex === nextZ - 1 ? { ...e, zIndex: el.zIndex } : e)
            );
            return withHistory(state, updated);
        }
        case "SEND_BACKWARD": {
            const el = state.elements.find(e => e.id === action.id);
            if (!el) return state;
            const newZ = Math.max(1, el.zIndex - 1);
            const updated = state.elements.map(e =>
                e.id === action.id ? { ...e, zIndex: newZ } : (e.zIndex === newZ ? { ...e, zIndex: el.zIndex } : e)
            );
            return withHistory(state, updated);
        }
        case "DUPLICATE": {
            const el = state.elements.find(e => e.id === action.id);
            if (!el) return state;
            const dup: CanvasElement = { ...JSON.parse(JSON.stringify(el)), id: `el-${Date.now()}`, x: el.x + 20, y: el.y + 20 };
            return withHistory(state, [...state.elements, dup]);
        }
        case "UNDO": {
            if (state.past.length === 0) return state;
            const previous = state.past[state.past.length - 1];
            const newPast = state.past.slice(0, -1);
            return { 
                ...state, 
                elements: previous.elements, 
                sections: previous.sections,
                past: newPast, 
                future: [snapshot(state), ...state.future].slice(0, MAX_HISTORY) 
            };
        }
        case "REDO": {
            if (state.future.length === 0) return state;
            const next = state.future[0];
            const newFuture = state.future.slice(1);
            return { 
                ...state, 
                elements: next.elements, 
                sections: next.sections,
                past: [...state.past, snapshot(state)], 
                future: newFuture 
            };
        }
        
        // ── Section Actions ── //
        case "ADD_SECTION": {
            const newSection: CanvasSection = {
                id: `section-${Date.now()}`,
                name: `Trang ${state.sections.length + 1}`,
                height: 844,
            };
            return withHistory(state, state.elements, [...state.sections, newSection]);
        }
        case "UPDATE_SECTION": {
            const updatedSections = state.sections.map(s => 
                s.id === action.id ? { ...s, ...action.changes } : s
            );
            return withHistory(state, state.elements, updatedSections);
        }
        case "DELETE_SECTION": {
            if (state.sections.length <= 1) return state; // Must have at least one section
            const remainingSections = state.sections.filter(s => s.id !== action.id);
            const remainingElements = state.elements.filter(e => e.sectionId !== action.id);
            return { ...withHistory(state, remainingElements, remainingSections), selectedId: null };
        }
        case "MOVE_SECTION_UP": {
            const idx = state.sections.findIndex(s => s.id === action.id);
            if (idx <= 0) return state;
            const newSections = [...state.sections];
            [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
            return withHistory(state, state.elements, newSections);
        }
        case "MOVE_SECTION_DOWN": {
            const idx = state.sections.findIndex(s => s.id === action.id);
            if (idx === -1 || idx >= state.sections.length - 1) return state;
            const newSections = [...state.sections];
            [newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]];
            return withHistory(state, state.elements, newSections);
        }
        case "SET_CANVAS_SIZE":
            return { ...state, width: action.width, height: action.height };
        case "SET_ENTRANCE_ANIMATION":
            return { ...state, entranceAnimation: action.animation };
        default:
            return state;
    }
}

export const initialCanvasState: CanvasState = {
    width: 390,
    height: 844,
    background: "linear-gradient(180deg, #fce7f3 0%, #fdf2f8 30%, #fff 100%)",
    sections: [{ id: "section-1", name: "Trang bìa", height: 844 }],
    elements: [],
    selectedId: null,
    zoom: 75,
    past: [],
    future: [],
    particleEffect: "none",
    introEffect: "none",
    musicIconStyle: "vinyl",
    entranceAnimation: "none",
};

// ── Hook ──
export function useCanvasReducer(initial?: Partial<CanvasState>) {
    const [state, dispatch] = useReducer(canvasReducer, { ...initialCanvasState, ...initial });

    const addText = useCallback((text = "Nhấn để chỉnh sửa", x = 50, y = 100, sectionId?: string) => {
        dispatch({
            type: "ADD_ELEMENT",
            element: {
                id: `el-${Date.now()}`,
                sectionId: sectionId || state.sections[0]?.id || "section-1",
                type: "text",
                x, y, width: 290, height: 60,
                rotation: 0, opacity: 1, zIndex: 1, locked: false,
                props: {
                    text, fontSize: 24,
                    fontFamily: "'Dancing Script', cursive",
                    color: "#831843", textAlign: "center",
                    fontWeight: "normal", fontStyle: "normal", lineHeight: 1.4,
                },
            },
        });
    }, [state.sections]);

    const addImage = useCallback((src: string, x = 20, y = 200, sectionId?: string) => {
        dispatch({
            type: "ADD_ELEMENT",
            element: {
                id: `el-${Date.now()}`,
                sectionId: sectionId || state.sections[0]?.id || "section-1",
                type: "image",
                x, y, width: 350, height: 280,
                rotation: 0, opacity: 1, zIndex: 1, locked: false,
                props: { src, objectFit: "cover", borderRadius: 12, opacity: 1 },
            },
        });
    }, [state.sections]);

    return { state, dispatch, addText, addImage };
}
