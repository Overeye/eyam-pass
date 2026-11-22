/** Distance and the GPS unlock rule. Pure functions, no page objects. */

export const RADIUS_M = 30;
export const MAX_ACCURACY_M = 40;

export function distanceMetres(lat1, lon1, lat2, lon2) {
  const earth = 6371000;
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const startLat = toRad(lat1);
  const endLat = toRad(lat2);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Unlock only when the reported point is within 30 metres and the phone
 * states a usable accuracy. A vague fix must not unlock the stop.
 */
export function assessGps(distance, accuracy) {
  if (!Number.isFinite(distance) || !Number.isFinite(accuracy) || accuracy <= 0) {
    return { unlock: false, reason: "unusable" };
  }
  if (accuracy > MAX_ACCURACY_M) {
    return { unlock: false, reason: "vague" };
  }
  if (distance <= RADIUS_M) {
    return { unlock: true, reason: "inside" };
  }
  return { unlock: false, reason: "outside" };
}

export function formatMetres(metres) {
  if (!Number.isFinite(metres)) return "an unknown distance";
  if (metres < 1000) {
    const rounded = Math.round(metres);
    if (rounded <= 0) return "0 metres";
    return `${rounded} ${rounded === 1 ? "metre" : "metres"}`;
  }
  const kilometres = metres / 1000;
  const text = kilometres < 10 ? kilometres.toFixed(1) : String(Math.round(kilometres));
  return `${text} kilometres`;
}

export function gridMetres(eastingA, northingA, eastingB, northingB) {
  return Math.hypot(eastingA - eastingB, northingA - northingB);
}
