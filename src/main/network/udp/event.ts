export const UdpEvents = {
  CREATE_AND_BIND_UDP: 'udp:create_and_bind',
  DESTROY_UDP: 'udp:destroy',
  STOP_UDP: 'udp:stop',
  SEND_UDP: 'udp:send',
  GET_MESSAGES_UDP: 'udp:get_messages',
  CLEAR_MESSAGES_UDP: 'udp:clear_messages',
  IS_PORT_RUNNING_UDP: 'udp:is_port_running',
  GET_RUNNING_PORTS_UDP: 'udp:get_running_ports',
  SET_MAX_MESSAGES_UDP: 'udp:set_max_messages',
} as const;

export type UDP_EVENTS_TYPE = typeof UdpEvents;
