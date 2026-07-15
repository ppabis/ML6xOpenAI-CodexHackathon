export function createRateLimiter({
  perMinute = 1,
  perHour = 5,
  now = () => Date.now(),
} = {}) {
  let timestamps = [];

  return {
    take() {
      const current = now();
      timestamps = timestamps.filter((timestamp) => current - timestamp < 3_600_000);
      const lastMinute = timestamps.filter(
        (timestamp) => current - timestamp < 60_000,
      );

      if (lastMinute.length >= perMinute || timestamps.length >= perHour) {
        return false;
      }

      timestamps.push(current);
      return true;
    },
  };
}
