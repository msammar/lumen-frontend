// Tailwind CSS v4 — the only PostCSS plugin needed; autoprefixer is built in.
// Object form (not array) so both Next's and Vite/Vitest's PostCSS loaders accept it.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
