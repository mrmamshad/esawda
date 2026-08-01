import type { Config } from 'tailwindcss';

/**
 * eSawda — Eris Warm Marketplace tokens (2026-07-25 redesign).
 *
 * Palette inspired by the Eris energy-app landing page: a bold, warm
 * orange primary against deep navy ink, floated on a soft cream canvas.
 * The result is confident, product-forward, and reads well on both
 * dark photography (hero) and light body content (sections).
 *
 * DESIGN RULES enforced by this config:
 *   - Primary orange stays vivid but grounded (never neon)
 *   - Headings use deep navy ink; body copy softer slate
 *   - Cream canvas #FAF6F0 warms the whole page
 *   - Green success pills reserved for status badges ("30% saved")
 *   - Pure black #000 remains BANNED — always navy or ink instead
 *
 * The legacy `brand-*` ramp is retained (same shape) but re-mapped to
 * the Eris orange scale so no component rewriting is required.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* -------------------------------------------------------- */
        /* Primary system — Eris Orange scale (legacy `brand-*` keys) */
        /* -------------------------------------------------------- */
        brand: {
          950: '#3A1408', // deepest text on orange tint
          900: '#5E1F0D', // hero body text on light tint
          800: '#8A2E12', // pressed / heading on tint
          700: '#F16A2B', // 🔑 primary CTA — Eris orange
          600: '#F47B45', // hover
          500: '#F79663', // active highlight
          400: '#FAB289',
          300: '#FCCFB0',
          200: '#FDDFC7',
          100: '#FEEDDD', // chip bg
           50: '#FFF6EC', // soft tint surface
        },
        primary: {
          DEFAULT:   '#F16A2B',  // Eris orange CTA
          dark:      '#0F1E3D',  // 🔑 deep navy for headings
          light:     '#FCCFB0',
          fixed:     '#FEEDDD',
          fixedDim:  '#FDDFC7',
        },
        // Secondary accent — deep navy. Used for headings, chips,
        // secondary buttons. This is the counterweight to the orange.
        secondary: {
          DEFAULT:   '#0F1E3D',  // navy 950
          dark:      '#06122A',  // near-black navy
          container: '#E2E8F5',  // navy chip bg
          fixed:     '#E2E8F5',
          fixedDim:  '#C7D3E6',
        },
        // Tertiary — warm cream tint used on hero + featured surfaces.
        tertiary: {
          DEFAULT:   '#FFF6EC',
          fixed:     '#FBEEDF',
          fixedDim:  '#F5DFC7',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted:   '#FAF6F0',   // 🔑 cream canvas (Eris "off-white")
          dim:     '#F1E9DE',
          bright:  '#FFFDF9',
        },
        ink: {
          DEFAULT: '#0F1E3D',   // 🔑 deep navy — replaces "warm charcoal"
          muted:   '#4C5B78',   // slate muted body
          faint:   '#8A96AE',
        },
        line: '#EBE3D6',        // 1px borders — soft warm neutral
        outline: {
          DEFAULT: '#6B7794',
          variant: '#C7CDD8',
        },
        bg: '#FAF6F0',          // 🔑 cream canvas
        danger:  '#DC2626',
        warning: '#D97706',
        success: '#22C55E',     // 🔑 bright green for success pills (Eris)
        featured: '#F16A2B',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        /* Emerald Marketplace typography scale (Inter) */
        'label-caps':        ['12px', { lineHeight: '16px', letterSpacing: '0.1em',   fontWeight: '600' }],
        xs:                  ['12px', { lineHeight: '16px' }],
        'body-sm':           ['14px', { lineHeight: '20px' }],
        sm:                  ['14px', { lineHeight: '20px' }],
        'body-md':           ['16px', { lineHeight: '24px' }],
        base:                ['16px', { lineHeight: '24px' }],
        'body-lg':           ['18px', { lineHeight: '28px' }],
        lg:                  ['18px', { lineHeight: '28px' }],
        'headline-md':       ['20px', { lineHeight: '28px', fontWeight: '600' }],
        xl:                  ['20px', { lineHeight: '28px' }],
        '2xl':               ['24px', { lineHeight: '32px' }],
        'headline-lg-mobile':['24px', { lineHeight: '32px', fontWeight: '700' }],
        '3xl':               ['28px', { lineHeight: '36px' }],
        'headline-lg':       ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        '4xl':               ['32px', { lineHeight: '40px' }],
        '5xl':               ['40px', { lineHeight: '48px' }],
        'headline-xl':       ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        '6xl':               ['48px', { lineHeight: '56px' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        // Stitch layout tokens
        gutter:         '24px',
        'margin-mobile':'16px',
        'margin-desktop':'40px',
      },
      borderRadius: {
        /* Stitch shape scale */
        sm:      '4px',
        DEFAULT: '8px',
        md:      '12px',
        lg:      '16px',
        xl:      '24px',
        field:   '8px',   // inputs, small badges — updated to match Stitch (was 12px)
        card:    '16px',  // listing cards — matches Stitch
        pill:    '9999px',
      },
      boxShadow: {
        /* Soft emerald ambient — the "soft-depth" pattern from Stitch */
        card:    '0 4px 20px rgba(0, 77, 64, 0.05)',   // 🔑 Stitch Level-1
        cardHover:'0 6px 30px rgba(0, 77, 64, 0.10)',   // 🔑 Stitch Level-2
        chip:    '0 1px 2px rgba(0, 77, 64, 0.04)',
        popover: '0 12px 40px -8px rgba(0, 77, 64, 0.18)',
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [],
};
export default config;
