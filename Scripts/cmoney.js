(async () => {
  let rbody = { "hasTrialAuth": false };
  $done({ response: { status: 200, headers: {}, body: JSON.stringify(rbody) } });
})();