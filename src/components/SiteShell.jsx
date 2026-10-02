import MotionBackground from "./MotionBackground";
import ScrollProgress from "./ScrollProgress";
import Navbar from "./Navbar";

export default function SiteShell({ children }) {
  return (
    <>
      <ScrollProgress />
      <MotionBackground />
      <Navbar />
      {children}
    </>
  );
}