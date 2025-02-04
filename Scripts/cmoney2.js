(async () => {
  let et = Date.now() + (365 * 24 * 60 * 60 * 1000);
  let rbody = { "expiredTime": et, "serverTime": Date.now(), "unactivatedAuthDays": 90 };
  $done({ response: { status: 200, headers: {}, body: JSON.stringify(rbody) } });
})();