(async () => {
  const rbody = {
    "valid": true,
    "reason": "not_found"
  };

  $done({
    response: {
      status: 200,
      headers: {},
      body: JSON.stringify(rbody)
    }
  });
})();