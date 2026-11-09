/**
 * Stand-in for the console's internal SDK surface. The real module hands back the console's
 * own segment client, which the plugin host normally provides; without a host the product
 * logs "Analytics not enabled" on every tracked event. Report it as enabled so tests exercise
 * the tracking path quietly.
 */
export const getSegmentAnalytics = () => ({
  analyticsEnabled: true,
  analytics: { track: () => undefined },
});
