import { useRef, useEffect } from "react";
import { Paper, Text } from "@mantine/core";

export default function CanvasPreview({
    drawFrame,
    frame,
    uploadedImg,
    uploadedImgLoaded,
    frameLoaded,
    formData,
    canvasSize,
    title
}) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (frameLoaded && canvasRef.current) {
            drawFrame(canvasRef.current);
        }
    }, [frameLoaded, uploadedImgLoaded, formData, canvasSize, drawFrame]);

    return (
        <Paper p="md" style={{ width: "100%", overflow: "hidden" }}>
            {title && (
                <Text size="lg" weight={700} align="center" mb="md">
                    {title}
                </Text>
            )}
            <canvas
                ref={canvasRef}
                style={{
                    maxWidth: "100%",
                    height: "40vh",

                    display: "block",
                    margin: "0 auto",
                }}
            />
        </Paper>
    );
}
