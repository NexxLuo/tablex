import React from 'react'
import { Link, Router, Routes, useDataServer } from 'docz'
import { hot } from 'react-hot-loader'
<<<<<<< HEAD
import Theme from 'E:WebRoot\tablex\tablex\node_modulesdocz-theme-umiesindex.js'
=======
import Theme from '/home/nexx/develop/tablex/node_modules/docz-theme-umi/es/index.js'
>>>>>>> 35239bb7f566c42d695dc625560ddac84ce9eb74

import { imports } from './imports'
import database from './db.json'

const Root = () => {
  useDataServer('ws://127.0.0.1:60505')
  return (
    <Theme linkComponent={Link} db={database}>
      <Routes imports={imports} />
    </Theme>
  )
}

export default hot(module)(Root)
