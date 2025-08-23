import { useRef, useEffect, useState, useCallback } from "react";
import { Paper, Text, Slider, Group, Stack } from "@mantine/core";

export default function CanvasPreview({
    drawFrame,
    frame,
    uploadedImg,
    uploadedImgLoaded,
    frameLoaded,
    formData,
    canvasSize,
    title,
    imageSettings,
    onImageSettingsChange
}) {
    const canvasRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialImagePos, setInitialImagePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (frameLoaded && canvasRef.current) {
            drawFrame(canvasRef.current);
        }
    }, [frameLoaded, uploadedImgLoaded, formData, canvasSize, drawFrame, imageSettings]);

    // Get mouse position relative to canvas
    const getMousePos = useCallback((canvas, e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }, []);

    // Check if mouse is over the image area
    const isMouseOverImage = useCallback((mousePos, canvas) => {
        if (!imageSettings || !frame) return false;

        const scale = canvas.width / frame.width;
        const imageX = imageSettings.x * scale;
        const imageY = imageSettings.y * scale;
        const imageSize = imageSettings.size * scale;

        // Check if mouse is within the circular image bounds
        const centerX = imageX + imageSize / 2;
        const centerY = imageY + imageSize / 2;
        const radius = imageSize / 2;
        const distance = Math.sqrt(
            Math.pow(mousePos.x - centerX, 2) + Math.pow(mousePos.y - centerY, 2)
        );

        return distance <= radius;
    }, [imageSettings, frame]);

    // Mouse event handlers
    const handleMouseDown = useCallback((e) => {
        if (!uploadedImgLoaded || !canvasRef.current || !onImageSettingsChange) return;

        const mousePos = getMousePos(canvasRef.current, e);

        if (isMouseOverImage(mousePos, canvasRef.current)) {
            setIsDragging(true);
            setDragStart(mousePos);
            setInitialImagePos({ x: imageSettings.x, y: imageSettings.y });
            canvasRef.current.style.cursor = 'grabbing';
        }
    }, [uploadedImgLoaded, getMousePos, isMouseOverImage, imageSettings, onImageSettingsChange]);

    const handleMouseMove = useCallback((e) => {
        if (!canvasRef.current) return;

        const mousePos = getMousePos(canvasRef.current, e);

        if (isDragging && onImageSettingsChange) {
            const scale = canvasRef.current.width / frame.width;
            const deltaX = (mousePos.x - dragStart.x) / scale;
            const deltaY = (mousePos.y - dragStart.y) / scale;

            // Calculate new position with constraints to keep image within reasonable bounds
            const newX = Math.max(-imageSettings.size * 0.5,
                Math.min(frame.width - imageSettings.size * 0.5,
                    initialImagePos.x + deltaX));
            const newY = Math.max(-imageSettings.size * 0.5,
                Math.min(frame.height - imageSettings.size * 0.5,
                    initialImagePos.y + deltaY));

            onImageSettingsChange({
                ...imageSettings,
                x: newX,
                y: newY
            });
        } else if (uploadedImgLoaded && isMouseOverImage(mousePos, canvasRef.current)) {
            canvasRef.current.style.cursor = 'grab';
        } else {
            canvasRef.current.style.cursor = 'default';
        }
    }, [isDragging, dragStart, initialImagePos, imageSettings, frame, getMousePos, isMouseOverImage, uploadedImgLoaded, onImageSettingsChange]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'default';
        }
    }, []);

    // Add event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
        };
    }, [handleMouseDown, handleMouseMove, handleMouseUp]);

    // Handle zoom changes
    const handleZoomChange = useCallback((value) => {
        if (onImageSettingsChange && imageSettings) {
            onImageSettingsChange({
                ...imageSettings,
                size: value
            });
        }
    }, [onImageSettingsChange, imageSettings]);

    return (
        <Paper p="md" style={{ width: "100%", overflow: "hidden" }}>
            {title && (
                <Text size="lg" weight={700} align="center" mb="md">
                    {title}
                </Text>
            )}
            <Stack spacing="md">
                <canvas
                    ref={canvasRef}
                    style={{
                        maxWidth: "100%",
                        height: "40vh",
                        display: "block",
                        margin: "0 auto",
                        cursor: "default",
                        userSelect: "none"
                    }}
                />

                {/* Zoom Controls */}
                {uploadedImgLoaded && onImageSettingsChange && (
                    <Group grow p={"xl"}>
                        <div>
                            <Text size="sm" mb={5} align="center" weight={500}>
                                Phóng to
                            </Text>
                            <Slider
                                value={imageSettings?.size || 1500}
                                onChange={handleZoomChange}
                                min={800}
                                max={2200}
                                step={50}
                                marks={[
                                    { value: 800, label: 'Nhỏ nhất' },
                                    { value: 1500, label: 'Mặc định' },
                                    { value: 2200, label: 'Lớn nhất' }
                                ]}
                                size="md"
                                color="blue"
                            />
                        </div>
                    </Group>
                )}
            </Stack>
        </Paper>
    );
}
