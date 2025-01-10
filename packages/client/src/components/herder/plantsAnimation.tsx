import React, { useEffect, useState, useRef } from "react";

export default function LightAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // const particles: Particle[] = [];
        let particles: Particle[] = [];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let isGenerating = true;
        let animationFrameId: number;

        class Particle {
            x: number;
            y: number;
            radius: number;
            alpha: number;
            dx: number;
            dy: number;
            isExpanding: boolean;
            fillStyle: string;
            angle: number;
            distance: number;
            speed: number;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.radius = Math.random() * 4;
                this.alpha = 1;
                this.dx = (centerX - x) / 80 + Math.random() * 0.5 - 0.30;
                this.dy = (centerY - y) / 80 + Math.random() * 0.5 - 0.30;
                this.isExpanding = false;
                this.fillStyle = "#F7F7F7"
                this.angle = -10;
                this.distance = Math.random() * 50 + 20; // 环绕半径
                this.speed = Math.random() * 0.05 + 0.025;
            }

            update() {
                if (!this.isExpanding) {
                    this.x += this.dx;
                    this.y += this.dy;

                    if (Math.abs(this.x - centerX - Math.random() * 100) < 13 && Math.abs(this.y - centerY - Math.random() * 50) < 40) {
                        this.isExpanding = true;
                    }
                } else {
                    this.radius += 1;
                    this.alpha -= 0.1;
                }

                // if (!this.isExpanding) {
                //     // this.x += (centerX - this.x) / 20;
                //     // this.y += (centerY - this.y) / 20;
                //     this.x += this.dx;
                //     this.y += this.dy;

                //     if (Math.abs(this.x - centerX - Math.random() * 100) < 15 && Math.abs(this.y - centerY - Math.random() * 50) < 40) {
                //         this.isExpanding = true;
                //         this.alpha += 1
                //     }
                // } else {
                //     this.angle += this.speed;
                //     this.x = centerX + Math.cos(this.angle) * this.distance;
                //     this.y = centerY + Math.sin(this.angle) * this.distance;
                //     this.distance += 6; // 环绕半径增大
                //     this.radius += 0.02;
                //     this.alpha -= 0.015; // 渐渐消失
                // }

                if (this.alpha <= 0) {
                    const index = particles.indexOf(this);
                    if (index > -1) particles.splice(index, 1);
                }
            }

            draw() {
                ctx.save();
                ctx.shadowBlur = 10;
                ctx.shadowColor = "rgba(255, 223, 0, 0.8)";
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.fillStyle;
                ctx.fill();
                ctx.restore();
            }

        }

        function createParticles() {
            if (isGenerating && particles.length < 800) {
                for (let i = 0; i < 10; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    particles.push(new Particle(x, y));
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });
            createParticles();
            // requestAnimationFrame(animate);
            animationFrameId = requestAnimationFrame(animate);
        }

        function clearOffscreenParticles() {
            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];
                if (
                    particle.x < 0 ||
                    particle.x > canvas.width ||
                    particle.y < 0 ||
                    particle.y > canvas.height
                ) {
                    particles.splice(i, 1);
                }
            }
        }
        const clearIntervalId = setInterval(clearOffscreenParticles, 2000);

        animate();

        const generationTimeout = setTimeout(() => {
            isGenerating = false;
        }, 1500);

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resizeCanvas);

        return () => {
            clearTimeout(generationTimeout);
            clearInterval(clearIntervalId);
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resizeCanvas);
            particles = [];
        };
    }, []);

    return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0 }} />;
};

