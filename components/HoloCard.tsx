"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type PointerEvent,
} from "react";

type HoloPreset = "gold" | "spectral";

type HoloCardProps = {
  image: string;
  alt: string;
  width?: number;
  preset?: HoloPreset;
  foilColor?: string;
  intensity?: number;
  frame?: number;
  glare?: number;
  edgeSparkle?: number;
  tiltMax?: number;
  hoverScale?: number;
  radius?: number;
  idle?: boolean;
};

const vertexShader = `#version 300 es
in vec2 a_position;
in vec2 a_uv;
out vec2 v_uv;

void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragmentShader = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_image;
uniform vec2 u_pointer;
uniform vec3 u_foilColor;
uniform float u_intensity;
uniform float u_glare;
uniform float u_edgeSparkle;
uniform float u_preset;
uniform float u_idle;
out vec4 outColor;

void main() {
  vec4 base = texture(u_image, v_uv);
  float diagonal = sin((v_uv.x + v_uv.y + u_pointer.x * 0.08) * 24.0) * 0.5 + 0.5;
  float bands = sin((v_uv.x * 1.6 - v_uv.y * 1.2 + u_pointer.x * 0.15) * 18.0);
  float hueShift = (diagonal * 0.55 + bands * 0.18) * (1.0 - u_preset);
  vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (hueShift + vec3(0.0, 0.33, 0.67)));
  vec3 foil = mix(u_foilColor, rainbow, u_preset);

  float pointerDistance = distance(v_uv, u_pointer);
  float glare = pow(max(0.0, 1.0 - pointerDistance * 1.7), 7.0) * u_glare;
  float foilAmount = clamp((0.07 + diagonal * 0.12 + abs(bands) * 0.05) * u_intensity + glare * 0.45 + u_idle * 0.035, 0.0, 0.48);
  float edgeDistance = min(min(v_uv.x, 1.0 - v_uv.x), min(v_uv.y, 1.0 - v_uv.y));
  float edge = (1.0 - smoothstep(0.0, 0.06, edgeDistance)) * u_edgeSparkle * (0.08 + diagonal * 0.14);
  vec3 result = mix(base.rgb, foil, foilAmount) + foil * edge;

  outColor = vec4(result, base.a);
}`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("HoloCard shader compilation failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function parseHexColor(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((channel) => channel + channel).join("")
    : normalized;

  if (!/^[\da-f]{6}$/i.test(value)) return [0.91, 0.85, 0.69];

  return [
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255,
  ];
}

export default function HoloCard({
  image,
  alt,
  width = 220,
  preset = "gold",
  foilColor = "#e8d9b0",
  intensity = 0.7,
  frame = 3,
  glare = 0.45,
  edgeSparkle = 0.7,
  tiltMax = 12,
  hoverScale = 1.06,
  radius = 6,
  idle = true,
}: HoloCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<(() => void) | null>(null);
  const mobileRef = useRef(false);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const touchActiveRef = useRef(false);
  const foilRgb = useMemo(() => parseHexColor(foilColor), [foilColor]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const updateMobile = () => {
      mobileRef.current = media.matches;
      rootRef.current?.setAttribute("data-idle", String(idle && !media.matches));
      renderRef.current?.();
    };
    updateMobile();
    media.addEventListener("change", updateMobile);

    return () => media.removeEventListener("change", updateMobile);
  }, [idle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });

    const fallback = root.querySelector<HTMLImageElement>(".holo-card__fallback");
    if (!gl) {
      if (fallback) fallback.hidden = false;
      return;
    }

    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

    if (!vertex || !fragment) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      if (fallback) fallback.hidden = false;
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (fallback) fallback.hidden = false;
      return;
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("HoloCard shader linking failed:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      if (fallback) fallback.hidden = false;
      return;
    }

    const vertices = new Float32Array([
      -1, -1, 0, 0,
      1, -1, 1, 0,
      -1, 1, 0, 1,
      -1, 1, 0, 1,
      1, -1, 1, 0,
      1, 1, 1, 1,
    ]);
    const buffer = gl.createBuffer();
    const texture = gl.createTexture();

    if (!buffer || !texture) {
      if (buffer) gl.deleteBuffer(buffer);
      if (texture) gl.deleteTexture(texture);
      gl.deleteProgram(program);
      if (fallback) fallback.hidden = false;
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const uvLocation = gl.getAttribLocation(program, "a_uv");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 16, 8);

    const imageTexture = new window.Image();
    imageTexture.decoding = "async";
    imageTexture.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        imageTexture,
      );

      if (fallback) fallback.hidden = true;
      renderRef.current?.();
    };
    imageTexture.onerror = () => {
      console.error(`HoloCard image failed to load: ${image}`);
      if (fallback) fallback.hidden = false;
    };
    imageTexture.src = image;

    const locations = {
      pointer: gl.getUniformLocation(program, "u_pointer"),
      foilColor: gl.getUniformLocation(program, "u_foilColor"),
      intensity: gl.getUniformLocation(program, "u_intensity"),
      glare: gl.getUniformLocation(program, "u_glare"),
      edgeSparkle: gl.getUniformLocation(program, "u_edgeSparkle"),
      preset: gl.getUniformLocation(program, "u_preset"),
      idle: gl.getUniformLocation(program, "u_idle"),
    };
    const render = () => {
      if (!imageTexture.complete || imageTexture.naturalWidth === 0) return;

      const bounds = root.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const canvasWidth = Math.max(1, Math.round(bounds.width * pixelRatio));
      const canvasHeight = Math.max(1, Math.round(bounds.height * pixelRatio));

      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }

      gl.viewport(0, 0, canvasWidth, canvasHeight);
      gl.useProgram(program);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform2f(locations.pointer, pointerRef.current.x, pointerRef.current.y);
      gl.uniform3f(locations.foilColor, foilRgb[0], foilRgb[1], foilRgb[2]);
      gl.uniform1f(locations.intensity, intensity);
      gl.uniform1f(locations.glare, glare);
      gl.uniform1f(locations.edgeSparkle, edgeSparkle);
      gl.uniform1f(locations.preset, preset === "spectral" ? 1 : 0);
      gl.uniform1f(locations.idle, idle && !mobileRef.current ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    renderRef.current = render;

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(root);
    if (imageTexture.complete && imageTexture.naturalWidth > 0) render();

    return () => {
      resizeObserver.disconnect();
      renderRef.current = null;
      imageTexture.onload = null;
      imageTexture.onerror = null;
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [edgeSparkle, foilRgb, glare, idle, image, intensity, preset]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch" && !touchActiveRef.current) return;

      const bounds = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      pointerRef.current = { x, y: 1 - y };
      event.currentTarget.style.setProperty("--pointer-x", `${x * 100}%`);
      event.currentTarget.style.setProperty("--pointer-y", `${y * 100}%`);
      event.currentTarget.dataset.hover = "true";
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const rotateY = reduceMotion ? 0 : (x - 0.5) * tiltMax * 2;
      const rotateX = reduceMotion ? 0 : (0.5 - y) * tiltMax * 2;
      const scale = reduceMotion ? 1 : hoverScale;

      event.currentTarget.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
      renderRef.current?.();
    },
    [hoverScale, tiltMax],
  );

  const handlePointerLeave = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" && touchActiveRef.current) return;

    event.currentTarget.style.transform = "";
    event.currentTarget.dataset.hover = "false";
    pointerRef.current = { x: 0.5, y: 0.5 };
    renderRef.current?.();
  }, []);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "touch") return;

      touchActiveRef.current = !touchActiveRef.current;
      if (touchActiveRef.current) {
        handlePointerMove(event);
      } else {
        event.currentTarget.style.transform = "";
        event.currentTarget.dataset.hover = "false";
        pointerRef.current = { x: 0.5, y: 0.5 };
        renderRef.current?.();
      }
    },
    [handlePointerMove],
  );

  const cardStyle: CSSProperties & { "--holo-width": string } = {
    "--holo-width": `${width}px`,
    border: `${frame}px solid ${foilColor}`,
    borderRadius: `${radius}px`,
  };

  return (
    <div
      ref={rootRef}
      className="holo-card relative isolate aspect-[5/7] select-none touch-manipulation"
      style={cardStyle}
      role="img"
      aria-label={alt}
      data-idle={String(idle)}
      data-hover="false"
      onPointerEnter={handlePointerMove}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      <canvas ref={canvasRef} className="holo-card__canvas" aria-hidden="true" />
      <Image
        className="holo-card__fallback"
        src={image}
        alt=""
        fill
        unoptimized
        sizes={`${width}px`}
        hidden
      />
      <div className="holo-card__gloss" aria-hidden="true" />
    </div>
  );
}
