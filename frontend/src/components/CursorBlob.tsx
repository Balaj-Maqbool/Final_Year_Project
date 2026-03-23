import { useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import "./CursorBlob.css";

const CursorBlob = () => {
  // Spring physics for smooth buttery trailing effect
  const springX = useSpring(0, { stiffness: 50, damping: 20 });
  const springY = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      // 150 is exactly half the primary blob's 300px width/height to keep it perfectly centered
      springX.set(e.clientX - 150);
      springY.set(e.clientY - 150);
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, [springX, springY]);

  return (
    <>
      <motion.div
        className="cursor-blob primary-blob"
        style={{
          x: springX,
          y: springY,
        }}
      />
      <motion.div
        className="cursor-blob secondary-blob"
        style={{
          // Inherit the physics, but detune stiffness to let it lag/trail behind
          x: useSpring(springX, { stiffness: 30, damping: 25 }),
          y: useSpring(springY, { stiffness: 30, damping: 25 }),
        }}
      />
    </>
  );
};

export default CursorBlob;
