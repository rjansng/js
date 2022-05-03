var body = $response.body;
body = body.replace('<head>', '<head> response-body <head><style type="text/css">div[style^="position: absolute"]{display: none! important}div[style^="opacity: 0.3"]{display: none! important}div[style^="margin-bottom: 1em"]{display: none! important}div[style^="font-size: 0.7em"]{display: none! important}p[style^="cursor: pointer"]{display: none! important}div[style^="margin-top: 2em"]{display: none! important}p[style^="font-size: 0.9em"]{display: none! important}p[style^="opacity: 0.1"]{display: none! important}</style>');
$done({ body });

