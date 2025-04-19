export const WebSocketEvents = {
  CREATE_AND_BIND_WEBSOCKET: 'websocket:create_and_bind',
  DESTROY_WEBSOCKET: 'websocket:destroy',
  STOP_WEBSOCKET: 'websocket:stop',
  SEND_WEBSOCKET: 'websocket:send',
  SEND_TO_ALL_WEBSOCKET: 'websocket:send_to_all',
  GET_MESSAGES_WEBSOCKET: 'websocket:get_messages',
  CLEAR_MESSAGES_WEBSOCKET: 'websocket:clear_messages',
  IS_PORT_RUNNING_WEBSOCKET: 'websocket:is_port_running',
  GET_RUNNING_PORTS_WEBSOCKET: 'websocket:get_running_ports',
  SET_MAX_MESSAGES_WEBSOCKET: 'websocket:set_max_messages',
} as const;

export type WEBSOCKET_EVENTS_TYPE = typeof WebSocketEvents; 