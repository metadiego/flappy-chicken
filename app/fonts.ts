import localFont from 'next/font/local'

export const customFont = localFont({
  src: [
    {
      path: './fonts/Brice-Black.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom' // This creates a CSS variable
}) 