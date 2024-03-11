import { useEffect, useRef, useState } from 'react';
import { IncomingMessage, PixelCoordinate } from './types';

const App = () => {
  const [pixels, setPixels] = useState<PixelCoordinate[]>([]);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [radius, setRadius] = useState<number>(5);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!canvasRef || !canvasRef.current || !pixels.length) return;
    const ctx = canvasRef.current?.getContext('2d');

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    pixels.forEach((pixel) => {
      drawCircle(ctx, pixel.x, pixel.y, pixel.radius, pixel.color);
    });
  }, [pixels]);

  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:8000/' + 'canvas');

    if (!wsRef.current) return;

    wsRef.current.onclose = () => console.log('ws closed!');

    wsRef.current.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data) as IncomingMessage;

      switch (type) {
        case 'SET_MESSAGES':
          setPixels(payload);
          break;
        case 'NEW_MESSAGE':
          setPixels((prevState) => [...prevState, payload]);
          break;
      }
    };

    return () => {
      if (wsRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current?.close();
      }
    };
  }, []);

  const sendMessage = (x: number, y: number) => {
    if (!canvasRef.current || !wsRef.current) return;

    const pixelCoordinate: PixelCoordinate = {
      x: x,
      y: y,
      color: currentColor,
      radius: radius,
    };

    wsRef.current?.send(JSON.stringify({ type: 'SEND_MESSAGE', payload: pixelCoordinate }));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    const x = e.pageX - canvasRef.current!.offsetLeft;
    const y = e.pageY - canvasRef.current!.offsetTop;
    sendMessage(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDown) return;
    const x = e.pageX - canvasRef.current!.offsetLeft;
    const y = e.pageY - canvasRef.current!.offsetTop;
    sendMessage(x, y);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center mt-5">
      <input
        className="form-control form-control-color mb-2"
        style={{ width: 60, height: 60 }}
        type="color"
        value={currentColor}
        onChange={(e) => setCurrentColor(e.target.value)}
      />

      <input
        className="form-control mb-2 w-25"
        type="number"
        value={radius}
        onChange={(e) => Number(e.target.value) >= 1 &&  setRadius(Number(e.target.value))}
      />

      <canvas
        className="border border-2 border-dark rounded-4"
        style={{ cursor: 'crosshair' }}
        width={800}
        height={400}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseOut={handleMouseUp}
      />
    </div>
  );
};

export default App;
