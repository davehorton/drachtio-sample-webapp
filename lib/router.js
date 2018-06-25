const config = require('config') ;

module.exports = function routeCall(req, res) {
  console.log(`received incoming call with params ${JSON.stringify(req.query)}`);
  let payload = {};

  // Check each route definition in order. Take the first route service chosen

  // check for trunk group-based routes first
  if (req.query.tgrp && config.has('routes.trunk')) {
    const routes = config.get('routes.trunk');
    console.log(`checking trunk-based routes against source ${req.query.tgrp}`);
    routes.some((r) => {
      if (r.tgrp.includes(req.query.tgrp)) {
        console.log(`selected route ${JSON.stringify(r.route)} based on tgrp ${req.query.tgrp}`);
        payload = r.route ;
        return true;
      }
    });
  }

  // check for source-based routing
  if (Object.keys(payload).length == 0 && config.has('routes.source')) {
    const routes = config.get('routes.source');
    console.log(`checking source-based routes against source ${req.query.source_address}`);
    routes.some((r) => {
      if (r.source.includes(req.query.source_address)) {
        console.log(`selected route ${JSON.stringify(r.route)} based on source address ${req.query.source_address}`);
        payload = r.route ;
        return true;
      }
    });
  }

  // if no service found, check uri-based routes. Take the first service where toUser matches on the given pattern
  if (Object.keys(payload).length == 0 && config.has('routes.uri')) {
    const uriRoutes = config.get('routes.uri');
    console.log(`checking uri routes against user ${req.query.toUser}`);
    uriRoutes.some((r) => {
      try {
        const regex = new RegExp(r.pattern);
        if (regex.test(req.query.toUser)) {
          console.log(`selected route based on uri matching pattern ${r.pattern}: ${JSON.stringify(r.route)}`);
          payload = r.route ;
          return true;
        }
      }
      catch (err) {
        console.log(`error compiling regex ${r.pattern}: ${err}`);
        return false;
      }
    });
  }

  // if no service found, check did-based routes.
  // Take the first service where toUser matches a DID in its list
  if (Object.keys(payload).length == 0 && config.has('routes.did')) {
    const did = req.query.toUser.trim() ;
    console.log(`checking DID routes against user ${did}`);
    const didRoutes = config.get('routes.did');
    let i = 0 ;
    while (Object.keys(payload).length == 0 && i < didRoutes.length) {
      const route = didRoutes[i++] ;
      if (route.dids.includes(did)) {
        payload = route.route ;
        console.log(`selected route based on did: ${JSON.stringify(route.route)}`);
      }
    }
  }

  // if no service found, check domain-based routes. Take the first service where domain matches on the given pattern
  if (Object.keys(payload).length == 0  && config.has('routes.domain')) {
    const domainRoutes = config.get('routes.domain');
    console.log(`checking domain routes against domain ${req.query.domain}`);
    domainRoutes.some((r) => {
      try {
        const regex = new RegExp(r.pattern);
        if (regex.test(req.query.domain)) {
          payload = r.route ;
          console.log(`selected route based on domain matching pattern ${r.pattern}: ${JSON.stringify(r.route)}`);
          return true;
        }
      }
      catch (err) {
        console.log(`error compiling regex ${r.pattern}: ${err}`);
        return false;
      }
    });
  }

  if (Object.keys(payload).length) return res.json(payload);
  return res.json({
    action: 'reject',
    data: {
      status: 404,
      reason: 'Service Not Found'
    }
  });
} ;
