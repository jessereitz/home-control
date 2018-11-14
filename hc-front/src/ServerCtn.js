import React from 'react';
import Server from './Server.js';

export default function ServerCtn(props) {
  if (!props.servers || props.servers.length < 1) return null;
  return (
    <div>
      {
        props.servers.map((server) => {
          return <Server key={server.mac} showAuthForm={props.showAuthForm} info={server} />
        })
      }
    </div>
  );
}
