/**
 * Lazy load Bootstrap JS only when needed
 * This reduces initial bundle size and improves mobile performance
 */

let bootstrapLoaded = false;

export function loadBootstrap(): void {
  if (bootstrapLoaded) {
    return;
  }

  try {
    // Dynamically load Bootstrap script
    const script = document.createElement('script');
    script.src = 'bootstrap.js';
    script.async = true;
    script.onload = () => {
      bootstrapLoaded = true;
    };
    document.head.appendChild(script);
  } catch (error) {
    console.error('Failed to load Bootstrap JS:', error);
  }
}

/**
 * Load Bootstrap on first user interaction (click, scroll, or touch)
 */
export function loadBootstrapOnInteraction(): void {
  if (bootstrapLoaded) {
    return;
  }

  const events = ['click', 'scroll', 'touchstart', 'mousemove'];
  const loadOnce = () => {
    loadBootstrap();
    events.forEach((event) => {
      window.removeEventListener(event, loadOnce);
    });
  };

  events.forEach((event) => {
    window.addEventListener(event, loadOnce, { once: true, passive: true });
  });

  // Fallback: load after 5 seconds if no interaction
  setTimeout(() => {
    if (!bootstrapLoaded) {
      loadBootstrap();
    }
  }, 5000);
}
