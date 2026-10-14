# Apple HIG Foundations: A Quick Guide for a Simple App

A condensed, plain-language summary of the parts of Apple's Human Interface Guidelines (Foundations section) that make the biggest visual difference in a small app. This is a study summary written in my own words, not Apple's text. For the full details, see the official pages:
https://developer.apple.com/design/human-interface-guidelines/foundations

Code examples use SwiftUI. If you're using UIKit or another framework, the same ideas apply.

---

## 1. The Big Three Ideas

Apple's design thinking boils down to three goals:

- **Clarity.** Text is easy to read, icons are easy to understand, and the most important thing on each screen is obvious.
- **Deference.** The interface supports the content instead of competing with it. Avoid heavy borders, loud gradients, and decoration for its own sake.
- **Depth.** Layers, motion, and transitions help people understand where they are and how screens relate.

A useful test: if you removed one decorative element from a screen, would anyone miss it? If not, remove it.

---

## 2. Layout

**Respect the safe area.** Keep content away from the notch/Dynamic Island, the home indicator, and rounded screen corners. SwiftUI does this automatically unless you use `.ignoresSafeArea()`, so only use that for backgrounds, never for text or buttons.

**Use consistent margins and spacing.** Pick a small set of spacing values and reuse them everywhere. A common approach is multiples of 8 (8, 16, 24, 32). Standard side margins on iPhone are about 16–20 points.

```swift
VStack(alignment: .leading, spacing: 16) {
    Text("Title").font(.title2.bold())
    Text("Details go here.")
}
.padding()   // system-standard padding
```

**Build a clear hierarchy.** The most important item should be the largest or the highest on the screen. Group related items together and separate unrelated ones with whitespace rather than lines.

**Align things.** Pick one leading edge and line content up along it. Misaligned elements are the most common reason a student app looks "off."

**Make tap targets big enough.** Every button or tappable area should be at least **44 × 44 points**, even if the visible icon is smaller.

```swift
Button(action: save) {
    Image(systemName: "checkmark")
        .frame(minWidth: 44, minHeight: 44)
}
```

**Adapt to different sizes.** Test on a small iPhone (SE) and a large one (Pro Max), plus landscape if you support it. Avoid hardcoded widths; prefer stacks, `Spacer()`, and `.frame(maxWidth: .infinity)`.

---

## 3. Typography

**Use the system font (San Francisco).** It's designed for legibility on Apple screens and you get it for free.

**Use built-in text styles instead of fixed sizes.** They scale automatically with the user's preferred text size (Dynamic Type).

| Style | Typical use |
|---|---|
| `.largeTitle` | Main screen title |
| `.title` / `.title2` / `.title3` | Section headers |
| `.headline` | Emphasized labels, list item titles |
| `.body` | Main reading text (the default) |
| `.callout` / `.subheadline` | Secondary info |
| `.footnote` / `.caption` | Small notes, timestamps |

```swift
Text("Today's Tasks").font(.largeTitle.bold())
Text("3 remaining").font(.subheadline).foregroundStyle(.secondary)
```

**Create hierarchy with weight and color, not just size.** Combining a bold headline with lighter secondary text often looks cleaner than using five different sizes.

**Limit yourself.** One font family and two or three weights is plenty. Avoid ultralight weights for small text, as they're hard to read.

**Test with large text.** In the simulator, go to Settings > Accessibility > Display & Text Size > Larger Text and check that nothing gets cut off.

---

## 4. Color

**Prefer semantic (system) colors.** They describe a role rather than a specific shade, and they automatically adjust for Dark Mode and accessibility settings.

```swift
.background(Color(.systemBackground))          // main background
.background(Color(.secondarySystemBackground)) // cards, grouped areas
.foregroundStyle(.primary)                     // main text
.foregroundStyle(.secondary)                   // less important text
```

**Pick one accent color.** Use it for interactive elements (buttons, links, selected states) so people learn "this color means I can tap it." Set it in your asset catalog as `AccentColor`.

**Use color sparingly and consistently.** Don't assign the same color to two different meanings (for example, red for both "delete" and "favorite").

**Don't rely on color alone.** Pair color with an icon, label, or shape so the meaning is still clear to people with color blindness.

**Check contrast.** Aim for a contrast ratio of at least **4.5:1** for normal text and **3:1** for large text. Free online contrast checkers make this quick.

**Custom colors need a dark version.** If you add your own color in the asset catalog, give it both a light and a dark appearance.

---

## 5. Dark Mode

- Test every screen in both Light and Dark Mode (in the SwiftUI preview, add `.preferredColorScheme(.dark)`).
- Avoid hardcoded `Color.white` / `Color.black` for backgrounds and text; use system colors instead.
- Dark Mode backgrounds aren't pure black everywhere; elevated surfaces (sheets, cards) are slightly lighter, which system colors handle for you.
- Check that images and logos still look right on a dark background.

---

## 6. Icons and SF Symbols

**Use SF Symbols.** Apple provides thousands of free icons that match the system font, scale with text size, and support multiple weights. Download the free SF Symbols app to browse them.

```swift
Label("Settings", systemImage: "gearshape")
Image(systemName: "heart.fill").foregroundStyle(.red)
```

- Use the same icon for the same action throughout the app.
- Match the symbol weight to nearby text (SwiftUI does this automatically inside `Label`).
- Prefer familiar, standard symbols (trash for delete, plus for add, magnifying glass for search) over inventing new ones.

---

## 7. Images

- Provide images at @2x and @3x resolution, or use vector formats (PDF/SVG) in the asset catalog so they stay sharp.
- Use `.resizable()` with `.scaledToFit()` or `.scaledToFill()` so images don't stretch or distort.
- Add an accessibility label to meaningful images; mark purely decorative ones as decorative.

```swift
Image("profile")
    .resizable()
    .scaledToFill()
    .frame(width: 60, height: 60)
    .clipShape(Circle())
    .accessibilityLabel("Profile photo")
```

---

## 8. Materials and Depth

- Materials are translucent, blurred backgrounds that let some of what's behind show through. They're great for overlays, toolbars, and cards on top of images.
- Use them lightly; one or two layers is enough.

```swift
Text("Now Playing")
    .padding()
    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
```

- Rounded corners and soft, subtle shadows look more at home on iOS than sharp corners and heavy drop shadows.

---

## 9. Motion

- Use animation to explain what happened (an item moved, a sheet appeared), not just to decorate.
- Keep animations quick and natural. SwiftUI's default animations and `.spring()` are good choices.
- Respect the Reduce Motion setting:

```swift
@Environment(\.accessibilityReduceMotion) var reduceMotion

withAnimation(reduceMotion ? nil : .spring()) {
    isExpanded.toggle()
}
```

---

## 10. Accessibility

Building this in from the start is much easier than adding it later, and graders often notice it.

- **VoiceOver:** Give icon-only buttons a label so screen readers can describe them.
  ```swift
  Button(action: delete) { Image(systemName: "trash") }
      .accessibilityLabel("Delete item")
  ```
- **Dynamic Type:** Use text styles (see Section 3) so text scales.
- **Contrast:** Meet the ratios in Section 4.
- **Touch targets:** At least 44 × 44 points.
- **Color independence:** Don't use color as the only signal.
- **Test it:** Turn on VoiceOver on a device, or use Xcode's Accessibility Inspector to audit your screens.

---

## 11. Writing (UI Text)

- Keep labels short and specific: "Save Note" beats "Click here to save your note."
- Use verbs on buttons ("Add," "Delete," "Share").
- Be consistent with capitalization. Apple typically uses title case for buttons and titles, and sentence case for longer descriptions.
- Write friendly, helpful error messages that say what went wrong and what to do next.

---

## 12. Branding

- Express your app's personality through your accent color, app icon, and maybe one custom font for headings.
- Don't let branding crowd out content: no logo on every screen, no giant banners.
- Keep standard system behaviors (navigation, back button, tab bar) working the way people expect.

---

## Quick Checklist Before You Submit

- [ ] Content stays inside the safe area on all screen sizes
- [ ] Spacing uses a consistent set of values; items are aligned
- [ ] Text uses system text styles and scales with larger text sizes
- [ ] One accent color used consistently for interactive elements
- [ ] System/semantic colors used for backgrounds and text
- [ ] App looks correct in both Light and Dark Mode
- [ ] Text contrast is at least 4.5:1
- [ ] All tappable elements are at least 44 × 44 points
- [ ] Icons are SF Symbols (or consistent custom icons)
- [ ] Icon-only buttons have accessibility labels
- [ ] Animations are purposeful and respect Reduce Motion
- [ ] Button labels are short, clear verbs
