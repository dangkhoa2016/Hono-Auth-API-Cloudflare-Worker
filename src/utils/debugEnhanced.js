/**
 * Optimized debug wrapper for Cloudflare Workers
 * Minimal override - only changes CSS colors to ANSI colors for terminal output
*/

// Import the original debug package
import debugOriginal from 'debug';

// Store original formatArgs
const originalFormatArgs = debugOriginal.formatArgs;

const colorMap = {
  // Blues - variants
  '#0000CC': '94', // Blue
  '#0000FF': '94', // Bright Blue
  '#0033CC': '94', // Blue variant
  '#0033FF': '94', // Blue variant
  '#0066CC': '94', // Blue variant
  '#0066FF': '94', // Blue variant
  '#0099CC': '94', // Blue variant
  '#0099FF': '94', // Blue variant

  // Greens - variants
  '#00CC00': '92', // Green
  '#00CC33': '92', // Green variant
  '#00CC66': '92', // Green variant
  '#00CC99': '96', // Cyan-Green
  '#00CCCC': '96', // Cyan
  '#00CCFF': '96', // Cyan variant

  // Purple/Magenta - variants
  '#3300CC': '95', // Magenta variant
  '#3300FF': '95', // Magenta variant
  '#3333CC': '95', // Magenta variant
  '#3333FF': '95', // Magenta variant
  '#3366CC': '95', // Magenta variant
  '#3366FF': '95', // Magenta variant
  '#3399CC': '96', // Cyan variant
  '#3399FF': '96', // Cyan variant
  '#33CC00': '92', // Green variant
  '#33CC33': '92', // Green variant
  '#33CC66': '92', // Green variant
  '#33CC99': '96', // Cyan variant
  '#33CCCC': '96', // Cyan variant
  '#33CCFF': '96', // Cyan variant

  // Purple/Magenta continued
  '#6600CC': '95', // Magenta variant
  '#6600FF': '95', // Magenta variant
  '#6633CC': '95', // Magenta variant
  '#6633FF': '95', // Magenta variant
  '#66CC00': '92', // Green variant
  '#66CC33': '92', // Green variant

  // Purple/Magenta continued
  '#9900CC': '95', // Magenta variant
  '#9900FF': '95', // Magenta variant
  '#9933CC': '95', // Magenta variant
  '#9933FF': '95', // Magenta variant
  '#99CC00': '92', // Green variant
  '#99CC33': '92', // Green variant

  // Reds - variants
  '#CC0000': '91', // Red
  '#CC0033': '91', // Red variant
  '#CC0066': '91', // Red variant
  '#CC0099': '95', // Red-Magenta
  '#CC00CC': '95', // Magenta
  '#CC00FF': '95', // Magenta variant
  '#CC3300': '91', // Red variant
  '#CC3333': '91', // Red variant
  '#CC3366': '91', // Red variant
  '#CC3399': '95', // Red-Magenta
  '#CC33CC': '95', // Magenta variant
  '#CC33FF': '95', // Magenta variant
  '#CC6600': '93', // Orange-Yellow
  '#CC6633': '93', // Orange variant
  '#CC9900': '93', // Yellow-Orange
  '#CC9933': '93', // Yellow variant
  '#CCCC00': '93', // Yellow
  '#CCCC33': '93', // Yellow variant

  // Reds/Oranges - FF series
  '#FF0000': '91', // Bright Red
  '#FF0033': '91', // Red variant
  '#FF0066': '91', // Red variant
  '#FF0099': '95', // Red-Magenta
  '#FF00CC': '95', // Magenta variant
  '#FF00FF': '95', // Bright Magenta
  '#FF3300': '91', // Red-Orange
  '#FF3333': '91', // Red variant
  '#FF3366': '91', // Red variant
  '#FF3399': '95', // Red-Magenta
  '#FF33CC': '95', // Magenta variant
  '#FF33FF': '95', // Magenta variant
  '#FF6600': '93', // Orange
  '#FF6633': '93', // Orange variant
  '#FF9900': '93', // Yellow-Orange
  '#FF9933': '93', // Yellow-Orange
  '#FFCC00': '93', // Yellow
  '#FFCC33': '93', // Yellow variant
};

// Convert hex color to ANSI color code
const getAnsiColorCode = (hexColor) => {
  return colorMap[hexColor] || '97'; // Default to bright white
};

/**
 * Override formatArgs to use ANSI colors instead of CSS colors
 * Keep all the original logic, just change color output format
*/
function formatArgsWithAnsiColors(args) {
  // Call original formatArgs first to get all the logic
  originalFormatArgs.call(this, args);

  // Only modify if we have colors enabled and this.color exists
  if (args.length > 0 && this.useColors && this.color) {
    const formattedString = args[0];

    // Check if it's already CSS formatted (contains %c)
    if (typeof formattedString === 'string' && formattedString.includes('%c')) {
      // Convert hex color to ANSI
      const ansiColor = getAnsiColorCode(this.color);
      const colorCode = `\x1b[${ansiColor}m`;
      const resetCode = '\x1b[0m';

      // Remove all %c markers and CSS styles, replace with ANSI
      args[0] = formattedString
        .replace(/%c/g, '') // Remove all %c markers
        .replace(/^([^%\s]+)/, colorCode + '$1' + resetCode) // Color the namespace
        .replace(/(\+\d+(?:\.\d+)?m?s?)$/, colorCode + '$1' + resetCode); // Color the time diff

      // Remove CSS style arguments that browser.js adds
      args.splice(1, args.length - 1);
    } else if (typeof formattedString === 'string') {
      // Check if it already has ANSI colors to avoid duplication
      if (!formattedString.includes('\x1b[')) {
        // Apply ANSI colors directly only if not already colored
        const ansiColor = getAnsiColorCode(this.color);
        const colorCode = `\x1b[${ansiColor}m`;
        const resetCode = '\x1b[0m';
        const diff = this.diff ? `+${this.diff}ms` : '+0ms';

        args[0] = colorCode + this.namespace + resetCode + ' ' + args[0] + ' ' + colorCode + diff + resetCode;
      }
    }
  }
}

// Override formatArgs globally
debugOriginal.formatArgs = formatArgsWithAnsiColors;

// Force enable colors for Cloudflare Workers
debugOriginal.useColors = () => true;

export default debugOriginal;
