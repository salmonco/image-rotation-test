import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const [valves, setValves] = useState<
    { id: number; x_percent: number; y_percent: number }[]
  >([]);
  const [draggingValveId, setDraggingValveId] = useState<number | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const MAX_WIDTH = 600;
  const MAX_HEIGHT = 300;

  const rotateImage = () => {
    setAngle((prevAngle) => (prevAngle + 90) % 360); // 90도 회전
  };

  const addValve = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setValves((prevValves) => [
      ...prevValves,
      {
        id: prevValves.length,
        x_percent: (30 / canvas.width) * 100,
        y_percent: (30 / canvas.height) * 100,
      },
    ]);
  };

  const handleMouseDown = (valveId: number) => {
    setDraggingValveId(valveId);
  };

  const handleMouseMove = (moveEvent: MouseEvent) => {
    if (draggingValveId === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((moveEvent.clientY - rect.top) / rect.height) * 100;

    const rotatedMousePosition = rotatePosition(
      { x_percent: mouseX, y_percent: mouseY },
      360 - angle
    );

    setValves((prevValves) =>
      prevValves.map((valve) =>
        valve.id === draggingValveId
          ? {
              ...valve,
              x_percent: rotatedMousePosition.x_percent,
              y_percent: rotatedMousePosition.y_percent,
            }
          : valve
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingValveId(null);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      // 원래 이미지의 너비와 높이
      let originalWidth = image.width;
      let originalHeight = image.height;

      // 이미지 크기가 최대 크기를 초과할 경우 크기 조정
      if (originalWidth > MAX_WIDTH || originalHeight > MAX_HEIGHT) {
        const aspectRatio = originalWidth / originalHeight;
        if (originalWidth > originalHeight) {
          originalWidth = MAX_WIDTH;
          originalHeight = MAX_WIDTH / aspectRatio;
        } else {
          originalHeight = MAX_HEIGHT;
          originalWidth = MAX_HEIGHT * aspectRatio;
        }
      }

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
      context.drawImage(
        image,
        -originalWidth / 2,
        -originalHeight / 2,
        originalWidth,
        originalHeight
      );
      context.restore();

      // 밸브 버튼 그리기
      valves.forEach((valve) => {
        const rotatedPosition = rotatePosition(valve, angle);

        const rotatedValveX = (rotatedPosition.x_percent / 100) * canvas.width;
        const rotatedValveY = (rotatedPosition.y_percent / 100) * canvas.height;

        context.save();
        context.fillStyle = "red"; // 밸브 버튼 색상
        context.beginPath();
        context.arc(rotatedValveX, rotatedValveY, 10, 0, Math.PI * 2); // 회전된 위치에 밸브 버튼을 그리기
        context.fill();
        context.restore();
      });
    };
  }, [angle, imageSrc, valves]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div>
      <h3>이미지 회전 테스트</h3>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid black" }}
        onMouseDown={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
          const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

          const rotatedMousePosition = rotatePosition(
            { x_percent: mouseX, y_percent: mouseY },
            360 - angle
          );

          const clickedValve = valves.find(
            (valve) =>
              Math.abs(valve.x_percent - rotatedMousePosition.x_percent) < 5 &&
              Math.abs(valve.y_percent - rotatedMousePosition.y_percent) < 5
          );
          if (clickedValve) {
            handleMouseDown(clickedValve.id);
          }
        }}
      />
      <div>
        <button onClick={rotateImage}>회전하기</button>
        <button onClick={addValve}>밸브 추가</button>
      </div>
    </div>
  );
}

export default App;
