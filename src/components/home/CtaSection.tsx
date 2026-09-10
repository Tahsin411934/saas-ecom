import Link from "next/link";
import Image from "next/image";
import { type CtaSection as CtaSectionType } from "@/services/home.service";

interface CtaSectionProps {
  cta: CtaSectionType;
}

type Position = string | null | undefined;

function getContentAlign(pos: Position): string {
  const [, horiz] = pos ? pos.split("-") : [];
  if (!horiz || horiz === "center" || horiz === "middle") return "text-center";
  if (horiz === "left") return "text-left";
  if (horiz === "right") return "text-right";
  return "text-center";
}

/** Get absolute positioning style based on position string + margin offsets */
function getAbsolutePositionStyle(
  pos: Position,
  marginTop?: number | null,
  marginBottom?: number | null,
  marginLeft?: number | null,
  marginRight?: number | null,
): React.CSSProperties {
  const [vert, horiz] = (pos || "center").split("-");
  const style: React.CSSProperties = { position: "absolute" };

  // Vertical
  if (vert === "top") {
    style.top = marginTop ?? 0;
  } else if (vert === "bottom") {
    style.bottom = marginBottom ?? 0;
  } else {
    // middle / center vertically
    style.top = "50%";
    style.transform = "translateY(-50%)";
    if (marginTop != null) style.marginTop = marginTop;
    if (marginBottom != null) style.marginBottom = marginBottom;
  }

  // Horizontal
  if (horiz === "left") {
    style.left = marginLeft ?? 0;
  } else if (horiz === "right") {
    style.right = marginRight ?? 0;
  } else {
    // center horizontally
    style.left = "50%";
    style.transform = vert === "top" || vert === "bottom"
      ? `translateX(-50%)`
      : `translate(-50%, -50%)`;
    if (marginLeft != null) style.marginLeft = marginLeft;
    if (marginRight != null) style.marginRight = marginRight;
  }

  return style;
}

/** Check if any margin value is set */
function hasMargin(
  top?: number | null,
  bottom?: number | null,
  left?: number | null,
  right?: number | null,
): boolean {
  return !!(top != null || bottom != null || left != null || right != null);
}

export default function CtaSection({ cta }: CtaSectionProps) {
  const style = cta.cta_style || "style1";

  // ── Reusable button renderers ──
  const renderPrimaryButton = () => {
    if (!cta.button_text || !cta.button_link) return null;
    return (
      <Link
        href={cta.button_link}
        className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90 hover:scale-105"
        style={{
          backgroundColor: cta.button_color,
          color: cta.button_text_color,
        }}
        aria-label={cta.button_text}
      >
        {cta.button_text}
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    );
  };

  const renderSecondaryButton = () => {
    if (!cta.secondary_button_text || !cta.secondary_button_link) return null;
    return (
      <Link
        href={cta.secondary_button_link}
        className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90 hover:scale-105 border-2"
        style={{
          backgroundColor: cta.secondary_button_color || "transparent",
          color: cta.secondary_button_text_color || cta.text_color,
          borderColor: cta.secondary_button_text_color || cta.text_color,
        }}
        aria-label={cta.secondary_button_text}
      >
        {cta.secondary_button_text}
      </Link>
    );
  };

  const renderButtonGroup = () => {
    const pos = cta.button_position || "center";
    const secPos = cta.secondary_button_position || pos;
    const hasPrimary = !!(cta.button_text && cta.button_link);
    const hasSecondary = !!(cta.secondary_button_text && cta.secondary_button_link);

    if (!hasPrimary && !hasSecondary) return null;

    // If position is center, use simple flow-based alignment
    if (pos === "center" || pos === "" || pos == null) {
      if (hasPrimary && hasSecondary) {
        return (
          <div className="flex flex-wrap gap-3 justify-center">
            {renderPrimaryButton()}
            {renderSecondaryButton()}
          </div>
        );
      }
      return (
        <div className="flex justify-center">
          {hasPrimary ? renderPrimaryButton() : renderSecondaryButton()}
        </div>
      );
    }

    // For non-center positions, use absolute positioning within the parent
    const primaryStyle = getAbsolutePositionStyle(
      pos,
      cta.button_margin_top,
      cta.button_margin_bottom,
      cta.button_margin_left,
      cta.button_margin_right,
    );

    if (hasPrimary && hasSecondary) {
      const secondaryStyle = getAbsolutePositionStyle(
        secPos,
        cta.secondary_button_margin_top,
        cta.secondary_button_margin_bottom,
        cta.secondary_button_margin_left,
        cta.secondary_button_margin_right,
      );
      return (
        <>
          <div style={primaryStyle}>{renderPrimaryButton()}</div>
          <div style={secondaryStyle}>{renderSecondaryButton()}</div>
        </>
      );
    }

    return (
      <div style={primaryStyle}>
        {hasPrimary ? renderPrimaryButton() : renderSecondaryButton()}
      </div>
    );
  };

  // Content alignment + margin
  const contentAlign = getContentAlign(cta.content_alignment);

  // ── Shared inner content renderer (without badge - badge is rendered per-style) ──
  const renderContent = () => (
    <>
      {cta.title && (
        <h2
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ color: cta.text_color }}
        >
          {cta.title}
        </h2>
      )}
      {cta.subtitle && (
        <p
          className="text-lg md:text-xl font-semibold mb-3"
          style={{ color: cta.text_color, opacity: 0.8 }}
        >
          {cta.subtitle}
        </p>
      )}
      {cta.description && (
        <p
          className="text-sm md:text-base mb-6 leading-relaxed"
          style={{ color: cta.text_color, opacity: 0.7 }}
        >
          {cta.description}
        </p>
      )}
    </>
  );

  // ── Style 1: Standard - Left aligned with image ──
  if (style === "style1") {
    return (
      <section className="w-full">
        <div className="mx-auto max-w-[1200px] px-4">
          <div
            className="relative rounded-2xl overflow-hidden p-8 md:p-12"
            style={{ backgroundColor: cta.background_color }}
          >
            <div className={`relative z-10 max-w-2xl ${contentAlign}`}
              style={{
                marginTop: cta.content_margin_top ?? undefined,
                marginBottom: cta.content_margin_bottom ?? undefined,
                marginLeft: cta.content_margin_left ?? undefined,
                marginRight: cta.content_margin_right ?? undefined,
              }}
            >
              {cta.badge_text && (
                <span
                  className="inline-block px-4 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider"
                  style={{ backgroundColor: cta.badge_color || "#ef4444", color: "#ffffff" }}
                >
                  {cta.badge_text}
                </span>
              )}
              {cta.image && (
                <div className="relative w-20 h-20 mb-4 rounded-lg overflow-hidden inline-block">
                  <Image
                    src={cta.image}
                    alt={cta.title || "CTA"}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              {renderContent()}
            </div>
            {renderButtonGroup()}
          </div>
        </div>
      </section>
    );
  }

  // ── Style 2: Banner with overlay (Full width background) ──
  if (style === "style2") {
    const contentPos = cta.content_alignment || "center";
    return (
      <section className="w-full">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="relative rounded-2xl overflow-hidden min-h-[300px] md:min-h-[500px] flex items-center justify-center">
            {(cta.banner_image || cta.image) ? (
              <>
                <Image
                  src={cta.banner_image || cta.image || ""}
                  alt={cta.title || "Banner"}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, ${cta.overlay_color || 'rgba(0,0,0,0.6)'} 0%, rgba(0,0,0,0.15) 50%, transparent 100%)`,
                    mixBlendMode: 'multiply',
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, rgba(0,0,0,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)`,
                  }}
                />
              </>
            ) : (
              <div className="absolute inset-0" style={{
                background: `linear-gradient(135deg, ${cta.background_color || '#1e1b4b'}, ${cta.button_color || '#312e81'})`
              }} />
            )}
            <div
              className={`relative z-10 w-full py-12 px-8 md:px-16 ${getContentAlign(contentPos)}`}
              style={{
                marginTop: cta.content_margin_top ?? undefined,
                marginBottom: cta.content_margin_bottom ?? undefined,
                marginLeft: cta.content_margin_left ?? undefined,
                marginRight: cta.content_margin_right ?? undefined,
              }}
            >
              {cta.badge_text && (
                <span
                  className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-4 uppercase tracking-wider"
                  style={{ backgroundColor: cta.badge_color || "#ef4444", color: "#ffffff" }}
                >
                  {cta.badge_text}
                </span>
              )}
              {renderContent()}
            </div>
            {renderButtonGroup()}
          </div>
        </div>
      </section>
    );
  }

  // ── Style 3: Centered with badge ──
  if (style === "style3") {
    return (
      <section className="w-full">
        <div className="mx-auto max-w-[1200px] px-4">
          <div
            className="relative rounded-2xl overflow-hidden p-10 md:p-16 text-center"
            style={{ backgroundColor: cta.background_color }}
          >
            <div className={contentAlign}
              style={{
                marginTop: cta.content_margin_top ?? undefined,
                marginBottom: cta.content_margin_bottom ?? undefined,
                marginLeft: cta.content_margin_left ?? undefined,
                marginRight: cta.content_margin_right ?? undefined,
              }}
            >
              {cta.badge_text && (
                <span
                  className="inline-block px-5 py-1.5 rounded-full text-sm font-bold mb-5 uppercase tracking-wider shadow-md"
                  style={{ backgroundColor: cta.badge_color || "#ef4444", color: "#ffffff" }}
                >
                  {cta.badge_text}
                </span>
              )}
              {cta.image && (
                <div className="relative w-24 h-24 mx-auto mb-5 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={cta.image}
                    alt={cta.title || "CTA"}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              {renderContent()}
            </div>
            {renderButtonGroup()}
          </div>
        </div>
      </section>
    );
  }

  // ── Style 4: Split layout (Image right, content left) ──
  if (style === "style4") {
    return (
      <section className="w-full">
        <div className="mx-auto max-w-[1200px] px-4">
          <div
            className="relative rounded-2xl overflow-hidden grid md:grid-cols-2 gap-0"
            style={{ backgroundColor: cta.background_color }}
          >
            <div
              className={`p-8 md:p-12 flex flex-col justify-center ${getContentAlign(cta.content_alignment)}`}
              style={{
                marginTop: cta.content_margin_top ?? undefined,
                marginBottom: cta.content_margin_bottom ?? undefined,
                marginLeft: cta.content_margin_left ?? undefined,
                marginRight: cta.content_margin_right ?? undefined,
              }}
            >
              {cta.badge_text && (
                <span
                  className={`inline-block px-4 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider ${cta.content_alignment?.includes("left") ? "self-start" :
                      cta.content_alignment?.includes("right") ? "self-end" :
                        "self-center"
                    }`}
                  style={{ backgroundColor: cta.badge_color || "#ef4444", color: "#ffffff" }}
                >
                  {cta.badge_text}
                </span>
              )}
              {renderContent()}
              {renderButtonGroup()}
            </div>

            <div className="relative min-h-[250px] md:h-full">
              {cta.image ? (
                <Image
                  src={cta.image}
                  alt={cta.title || "CTA"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: cta.button_color, opacity: 0.1 }}
                >
                  <svg className="w-20 h-20" style={{ color: cta.button_color, opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Style 5: Features grid with CTA ──
  if (style === "style5") {
    const features = [
      { icon: cta.feature_icon_1, text: cta.feature_text_1 },
      { icon: cta.feature_icon_2, text: cta.feature_text_2 },
      { icon: cta.feature_icon_3, text: cta.feature_text_3 },
    ].filter((f) => f.icon || f.text);

    return (
      <section className="w-full">
        <div className="mx-auto max-w-[1200px] px-4">
          <div
            className="relative rounded-2xl overflow-hidden p-8 md:p-12"
            style={{ backgroundColor: cta.background_color }}
          >
            <div className={contentAlign}
              style={{
                marginTop: cta.content_margin_top ?? undefined,
                marginBottom: cta.content_margin_bottom ?? undefined,
                marginLeft: cta.content_margin_left ?? undefined,
                marginRight: cta.content_margin_right ?? undefined,
              }}
            >
              {cta.badge_text && (
                <span
                  className="inline-block px-4 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider"
                  style={{ backgroundColor: cta.badge_color || "#ef4444", color: "#ffffff" }}
                >
                  {cta.badge_text}
                </span>
              )}
              <div className="mb-10">
                {renderContent()}
              </div>

              {features.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                    >
                      {feature.icon && (
                        <div className="text-4xl mb-3">{feature.icon}</div>
                      )}
                      {feature.text && (
                        <p
                          className="text-sm font-medium"
                          style={{ color: cta.text_color }}
                        >
                          {feature.text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {renderButtonGroup()}
          </div>
        </div>
      </section>
    );
  }

  // ── Fallback to style1 ──
  return (
    <section className="w-full">
      <div className="mx-auto max-w-[1200px] px-4">
        <div
          className="relative rounded-2xl overflow-hidden p-8 md:p-12"
          style={{ backgroundColor: cta.background_color }}
        >
          <div className={`relative z-10 max-w-2xl ${contentAlign}`}
            style={{
              marginTop: cta.content_margin_top ?? undefined,
              marginBottom: cta.content_margin_bottom ?? undefined,
              marginLeft: cta.content_margin_left ?? undefined,
              marginRight: cta.content_margin_right ?? undefined,
            }}
          >
            {cta.image && (
              <div className="relative w-20 h-20 mb-4 rounded-lg overflow-hidden inline-block">
                <Image
                  src={cta.image}
                  alt={cta.title || "CTA"}
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            {renderContent()}
          </div>
          {renderButtonGroup()}
        </div>
      </div>
    </section>
  );
}