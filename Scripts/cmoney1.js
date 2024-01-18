(async () => {
  let rbody = { "hasAuthorization": true };
  $done({ response: { status: 200, headers: {}, body: JSON.stringify(rbody) } });
})();