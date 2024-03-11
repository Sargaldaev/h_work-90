import {WebSocket} from 'ws'
export interface ActiveConnections {
  [id:string] : WebSocket | null
}

export interface Coordinates {
  x: number,
  y: number,
  clear: boolean,
}

export interface IncomingCoordinates {
  type:string,
  payload:Coordinates
}