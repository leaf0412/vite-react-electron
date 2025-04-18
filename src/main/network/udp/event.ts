export const UdpEvents = {
  CREATE_AND_BIND: 'udp:create_and_bind',
  DESTROY: 'udp:destroy',
  STOP: 'udp:stop',
  SEND: 'udp:send',
  GET_MESSAGES: 'udp:get_messages',
  CLEAR_MESSAGES: 'udp:clear_messages',
  IS_PORT_RUNNING: 'udp:is_port_running',
  GET_RUNNING_PORTS: 'udp:get_running_ports',
  SET_MAX_MESSAGES: 'udp:set_max_messages',
} as const;

export type UDP_EVENTS_TYPE = typeof UdpEvents;
