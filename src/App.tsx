import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const imageSrc =
    "https://newsimg.hankookilbo.com/2017/03/06/201703061667340308_1.jpg";

  const rotateImage = () => {
    setAngle((prevAngle) => prevAngle + 90); // 90도 회전
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
    };
  }, [angle, imageSrc]);

  return (
    <div>
      <h3>이미지 회전 테스트</h3>
      <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
      <div>
        <button onClick={rotateImage}>회전하기</button>
      </div>
    </div>
  );
}

export default App;
