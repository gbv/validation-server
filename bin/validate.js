#!/usr/bin/env node

import validate from "../lib/cli.js"

validate(process.argv.slice(2), console.log)
  .then(process.exit)
  .catch(e => { 
    console.error(e.message)
    process.exit(2)
  })
