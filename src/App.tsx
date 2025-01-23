import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const [valvePosition, setValvePosition] = useState<{
    x_percent: number;
    y_percent: number;
  } | null>(null);
  const imageSrc =
    "https://newsimg.hankookilbo.com/2017/03/06/201703061667340308_1.jpg";

  const rotateImage = () => {
    setAngle((prevAngle) => (prevAngle + 90) % 360); // 90도 회전
  };

  const addValve = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setValvePosition({
      x_percent: (30 / canvas.width) * 100,
      y_percent: (30 / canvas.height) * 100,
    }); // 이미지 중앙에 밸브 추가
  };

  const handleMouseDown = () => {
    if (!valvePosition) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX =
        ((moveEvent.clientX - canvas.getBoundingClientRect().left) /
          canvas.width) *
        100;
      const newY =
        ((moveEvent.clientY - canvas.getBoundingClientRect().top) /
          canvas.height) *
        100;
      setValvePosition({ x_percent: newX, y_percent: newY });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const rotatePosition = (
    originalPosition: { x_percent: number; y_percent: number },
    angle: number
  ) => {
    const { x_percent, y_percent } = originalPosition;

    let newX;
    let newY;

    switch (angle) {
      case 90:
        newX = 100 - y_percent;
        newY = x_percent;
        break;
      case 180:
        newX = 100 - x_percent;
        newY = 100 - y_percent;
        break;
      case 270:
        newX = y_percent;
        newY = 100 - x_percent;
        break;
      default:
        newX = x_percent;
        newY = y_percent;
    }

    return { x_percent: newX, y_percent: newY };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      // 원래 이미지의 너비와 높이
      const originalWidth = image.width;
      const originalHeight = image.height;

      // 회전된 이미지의 크기 계산
      const radians = (angle * Math.PI) / 180;
      const rotatedWidth =
        Math.abs(originalWidth * Math.cos(radians)) +
        Math.abs(originalHeight * Math.sin(radians));
      const rotatedHeight =
        Math.abs(originalWidth * Math.sin(radians)) +
        Math.abs(originalHeight * Math.cos(radians));

      // 캔버스 크기 조정
      canvas.width = rotatedWidth;
      canvas.height = rotatedHeight;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // 캔버스를 지우고 이미지를 회전하여 그리기
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.translate(centerX, centerY);
      context.rotate(radians); // 각도를 라디안으로 변환
      context.drawImage(image, -originalWidth / 2, -originalHeight / 2);
      context.restore();

      // 밸브 버튼 그리기
      if (valvePosition) {
        const rotatedPosition = rotatePosition(valvePosition, angle);

        const rotatedValveX = (rotatedPosition.x_percent / 100) * canvas.width;
        const rotatedValveY = (rotatedPosition.y_percent / 100) * canvas.height;

        context.save();
        context.fillStyle = "red"; // 밸브 버튼 색상
        context.beginPath();
        context.arc(rotatedValveX, rotatedValveY, 10, 0, Math.PI * 2); // 회전된 위치에 밸브 버튼을 그리기
        context.fill();
        context.restore();
      }
    };
  }, [angle, imageSrc, valvePosition]);

  return (
    <div>
      <h3>이미지 회전 테스트</h3>
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid black" }}
        onMouseDown={handleMouseDown}
      />
      <div>
        <button onClick={rotateImage}>회전하기</button>
        <button onClick={addValve}>밸브 추가</button>
      </div>
    </div>
  );
}

export default App;
