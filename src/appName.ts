/** App name used in config and injected into index.html at build time. 
 * We inject it at build time, before the JS is executed, to avoid having the title change after the JS is executed, 
 * which would be bad for SEO and social media sharing). 
 * Defined here so vite.config can import it easily without having to import the whole config file, which breaks at build time.
 */
export const APP_NAME = "RoR player";
