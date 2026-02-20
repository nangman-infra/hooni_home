"use client"

import { useEffect, useRef } from "react"

interface Point {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
}

export function BackgroundEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let animationFrameId: number
        let points: Point[] = []
        const connectionDistance = 150
        const mouseDistance = 200

        let prevWidth = 0

        const resize = () => {
            const currentWidth = window.innerWidth
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight

            // Only re-initialize points if width changes (e.g., rotation or desktop resize)
            // This prevents the animation from resetting (stuttering) when the mobile address bar hides/shows
            if (currentWidth !== prevWidth) {
                initPoints()
                prevWidth = currentWidth
            }
        }

        const initPoints = () => {
            points = []
            // Reduce density slightly for better mobile performance
            const density = window.innerWidth < 768 ? 20000 : 15000
            const numberOfPoints = Math.floor((canvas.width * canvas.height) / density)

            for (let i = 0; i < numberOfPoints; i++) {
                points.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5, // Slow velocity
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 1.5 + 0.5
                })
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Update and draw points
            points.forEach((point, i) => {
                // Move points
                point.x += point.vx
                point.y += point.vy

                // Bounce off walls
                if (point.x < 0 || point.x > canvas.width) point.vx *= -1
                if (point.y < 0 || point.y > canvas.height) point.vy *= -1

                // Mouse interaction
                const dx = mouseRef.current.x - point.x
                const dy = mouseRef.current.y - point.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < mouseDistance) {
                    // Gentle push away from mouse
                    const forceDirectionX = dx / distance
                    const forceDirectionY = dy / distance
                    const force = (mouseDistance - distance) / mouseDistance
                    const directionX = forceDirectionX * force * 0.5
                    const directionY = forceDirectionY * force * 0.5

                    point.x -= directionX
                    point.y -= directionY
                }

                // Draw point
                ctx.beginPath()
                ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
                ctx.fillStyle = "rgba(100, 100, 100, 0.5)" // Increased visibility (was 150, 0.2)
                ctx.fill()

                // Draw connections
                for (let j = i + 1; j < points.length; j++) {
                    const other = points[j]
                    const dx = point.x - other.x
                    const dy = point.y - other.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < connectionDistance) {
                        const opacity = 1 - (distance / connectionDistance)
                        ctx.beginPath()
                        ctx.moveTo(point.x, point.y)
                        ctx.lineTo(other.x, other.y)
                        ctx.strokeStyle = `rgba(100, 100, 100, ${opacity * 0.4})` // Increased line visibility (was 0.15)
                        ctx.lineWidth = 0.8
                        ctx.stroke()
                    }
                }
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            }
        }

        window.addEventListener("resize", resize)
        canvas.addEventListener("mousemove", handleMouseMove)

        resize()
        animate()

        return () => {
            window.removeEventListener("resize", resize)
            canvas.removeEventListener("mousemove", handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-auto"
            style={{ background: 'transparent' }}
        />
    )
}
