export interface PixelCoordinate {
  x: number;
  y: number;
  radius:number;
  color: string;
}

export interface IncomingMessage {
  type: string;
  payload: PixelCoordinate;
}