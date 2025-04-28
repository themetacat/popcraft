import React, { useEffect, useRef, useState, useReducer } from "react";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "../../MUDContext";
import { useAccount } from "wagmi";
import { addressToEntityID } from "../Utils/toEntityId"
import { imageIconData } from "../imageIconData";


const CanvasPopStarGrid: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const {
        components: {
            GameMode,
            ScoreChal,
            TCMPopStar
        },
    } = useMUD();
    const { address } = useAccount();
    const safeAddressEntityID = addressToEntityID(address ?? "0x0000000000000000000000000000000000000000");
    const gameModeData = useComponentValue(GameMode, safeAddressEntityID);
    const scoreChalData = useComponentValue(ScoreChal, safeAddressEntityID);
    const popStarData = useComponentValue(TCMPopStar, safeAddressEntityID);
    const rows = 5;
    const cols = 6;
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [dragging, setDragging] = useState(false);
    const offset = useRef({ x: 0, y: 0 });
    const previousImagesRef = useRef<Record<string, number>>({});

    const [canvasSize, setCanvasSize] = useState({
        width: 300,
        height: 250,
        cellSize: 40,
        padding: 0,
    });

    useEffect(() => {
        previousImagesRef.current = {};
    }, [popStarData?.tokenAddressArr, canvasSize])

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const tokenAddrList = popStarData?.tokenAddressArr as string[] | undefined;
        if (!tokenAddrList || tokenAddrList.length === 0) return;

        const newMatrixArray = scoreChalData?.newMatrixArray as bigint[] | undefined;
        if (!newMatrixArray || newMatrixArray.length === 0) return;

        const { width, height, cellSize, padding } = canvasSize;
        const canvasWidth = width + 40;
        const canvasHeight = height + 40;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;

        ctx.clearRect(0, 0, width, height);
        const offsetX = (canvasWidth - width) / 2;
        const offsetY = (canvasHeight - height) / 2;

        // 外边框
        ctx.strokeStyle = "#ffc974";
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, offsetX - 13, offsetY - 13, width + 26, height + 26, 14);
        ctx.stroke();

        // BG Color
        ctx.fillStyle = "#fff9c9";
        drawRoundedRect(ctx, offsetX - 12, offsetY - 12, width + 24, height + 24, 14);
        ctx.fill();

        // ================================
        // 内边框
        ctx.fillStyle = "#ffc974";
        drawRoundedRect(ctx, offsetX - 3, offsetY - 3, width + 6, height + 6, 8);
        ctx.fill();

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * (cellSize + padding) + offsetX;
                const y = r * (cellSize + padding) + offsetY;

                const tokenAddrIndex = Number(newMatrixArray[r * cols + c] as bigint);
                const gridKey = `${r}_${c}`;

                const img = new Image();
                img.src = imageIconData[tokenAddrList[tokenAddrIndex - 1]]?.src;

                const color = (r + c) % 2 === 0 ? "#fddca1" : "#fdf2d1";
                ctx.fillStyle = color;
                ctx.fillRect(x, y, cellSize, cellSize);
                if (previousImagesRef.current[gridKey] != 0 && tokenAddrIndex == 0) {
                    const lastImg = new Image();
                    lastImg.src = imageIconData[tokenAddrList[previousImagesRef.current[gridKey] - 1]]?.src;
                    lastImg.onload = () => {
                        animateImagePopOut(ctx, lastImg, x, y, cellSize, color, 250, () => {
                            ctx.clearRect(x, y, cellSize, cellSize);
                            ctx.fillStyle = color;
                            ctx.fillRect(x, y, cellSize, cellSize);
                        });
                    };
                }
      
                if (previousImagesRef.current[gridKey] == tokenAddrIndex && tokenAddrIndex != 0) {
                    img.onload = () => {
                        const imgSize = cellSize * 0.8;
                        const offset = (cellSize - imgSize) / 2;
                        ctx.drawImage(img, x + offset, y + offset, imgSize, imgSize);
                    };
                }
                
                if (previousImagesRef.current[gridKey] != tokenAddrIndex && tokenAddrIndex != 0) {
                    img.onload = () => {
                        animateImagePopIn(ctx, img, x, y, cellSize, color);
                    };
                }

                previousImagesRef.current[gridKey] = tokenAddrIndex;
            }
        }
    }, [scoreChalData, popStarData?.tokenAddressArr, canvasSize]);


    useEffect(() => {
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    

    const resizeCanvas = () => {
        const screenWidth = window.innerWidth;
        const totalWidth = Math.min(screenWidth * 0.15, 400);

        const cellSize = totalWidth / cols - 6;
        const padding = 0;
        const width = cols * (cellSize + padding);
        const height = rows * (cellSize + padding);

        setCanvasSize({ width, height, cellSize, padding });
    };

    function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // 拖动事件逻辑
    useEffect(() => {
        // const container = containerRef.current;
        // if (!container) return;

        const onMouseDown = (e: MouseEvent) => {
            setDragging(true);
            offset.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            };
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!dragging) return;
            setPosition({
                x: e.clientX - offset.current.x,
                y: e.clientY - offset.current.y,
            });
        };

        const onMouseUp = () => {
            setDragging(false);
        };

        // container.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            // container.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [dragging, position]);

    if (gameModeData && gameModeData.mode == 1n) {
        return (
            <div
            // ref={containerRef}
            >
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={250}
                    style={{
                        position: 'absolute',
                        bottom: '25rem',
                        right: '40rem',
                        // bottom: position.x,
                        // right: position.y,
                        cursor: dragging ? "grabbing" : "grab",
                        userSelect: "none",
                    }}
                />
            </div>
        );
    }

};

export default CanvasPopStarGrid;

export const animateImagePopIn = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    size: number,
    color: "#fddca1" | "#fdf2d1" = "#fddca1", 
    duration = 350,
) => {
    const startTime = performance.now();
    const draw = (now: number) => {
 
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const scale = easeInBack(progress);

        const imgSize = size * scale;
        const offset = (size - imgSize) / 2;

        ctx.clearRect(x, y, size, size);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
        ctx.drawImage(img, x + offset, y + offset, imgSize, imgSize);

        if (progress < 1) {
            requestAnimationFrame(draw);
        }
    };

    requestAnimationFrame(draw);
};
function easeInBack(x: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 0.8 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export const animateImagePopOut = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    size: number,
    color: "#fddca1" | "#fdf2d1" = "#fddca1",
    duration = 300,
    onComplete?: () => void
) => {
    const startTime = performance.now();

    const draw = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const scale = easeOutBack(1 - progress);
        const imgSize = size * scale;
        const offset = (size - imgSize) / 2;
        ctx.clearRect(x, y, size, size);
        if (scale > 0) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, size, size);
            ctx.drawImage(img, x + offset, y + offset, imgSize, imgSize);
            requestAnimationFrame(draw);
        } else {
            if (onComplete) onComplete();
        }
    };

    requestAnimationFrame(draw);
};

function easeOutBack(x: number): number {
    const c1 = 1.7158;
    const c3 = c1 + 1;
    return 0.8 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
