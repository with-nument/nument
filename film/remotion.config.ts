import { Config } from '@remotion/cli/config';

// Reuse the website's public folder (Inter Display fonts, images); film-only assets are imported from ./assets.
Config.setPublicDir('../public');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
