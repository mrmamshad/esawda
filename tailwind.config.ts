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
        /* Primary system — eSawda RED scale, matches HomeHero      */
        /* Hero uses #FF003F red on #FFF1E6 cream. All sections     */
        /* below re-use these tokens for palette continuity.        */
        /* -------------------------------------------------------- */
        brand: {
          950: '#3A0212',
          900: '#5E051D',
          800: '#8A092A',
          700: '#FF003F',  // 🔑 primary CTA — hero red
          600: '#FF2557',
          500: '#FF4A70',
          400: '#FF7191',
          300: '#FFA0B5',
          200: '#FFC7D2',
          100: '#FFE0E6',
           50: '#FFF0F3',
        },
        primary: {
          DEFAULT:   '#FF003F',
          dark:      '#0F1524',   // near-navy ink
          light:     '#FFC7D2',
          fixed:     '#FFE0E6',
          fixedDim:  '#FFC7D2',
        },
        secondary: {
          DEFAULT:   '#0F1524',
          dark:      '#06091A',
          container: '#E7E9F2',
          fixed:     '#E7E9F2',
          fixedDim:  '#C7CBDE',
        },
        // Tertiary — classic white (was cream, matches new white canvas).
        tertiary: {
          DEFAULT:   '#FFFFFF',   // 🔑 classic white
          fixed:     '#FFFFFF',
          fixedDim:  '#F4F4F5',   // subtle zinc-100 for depth if needed
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted:   '#F4F4F5',     // subtle neutral zinc-100 (was cream)
          dim:     '#F4F4F5',     // zinc-100 subtle
          bright:  '#FFFFFF',
        },
        ink: {
          DEFAULT: '#0F1524',    // deep near-navy (matches hero heading)
          muted:   '#4C5B78',
          faint:   '#8A94A6',
        },
        line: '#EDE1D5',
        outline: {
          DEFAULT: '#6B7794',
          variant: '#C7CDD8',
        },
        bg: '#FFFFFF',            // 🔑 classic white page canvas
        danger:  '#DC2626',
        warning: '#D97706',
        success: '#16A34A',
        featured: '#FF003F',
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
