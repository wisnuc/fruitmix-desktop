import React from 'react'
import ReactDOM from 'react-dom'

const Computer = ({style, fill, size}) => (
  <div style={Object.assign(style, {width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 300ms'})}>
    <svg style={{fill, width: Math.floor(size * 128 / 192), height: Math.floor(size * 176 / 192), transition: 'all 300ms'}}
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 89.471 89.471">
      <path d="M67.998,0H21.473c-1.968,0-3.579,1.61-3.579,3.579v82.314c0,1.968,1.61,3.579,3.579,3.579h46.525 c1.968,0,3.579-1.61,3.579-3.579V3.579C71.577,1.61,69.967,0,67.998,0z M44.736,65.811c-2.963,0-5.368-2.409-5.368-5.368 c0-2.963,2.405-5.368,5.368-5.368c2.963,0,5.368,2.405,5.368,5.368C50.104,63.403,47.699,65.811,44.736,65.811z M64.419,39.704 H25.052v-1.789h39.367V39.704z M64.419,28.967H25.052v-1.789h39.367V28.967z M64.419,17.336H25.052V6.599h39.367V17.336z"/>
    </svg>
  </div>
)

export default Computer
