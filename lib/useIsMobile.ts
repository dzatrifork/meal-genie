import { useEffect, useState } from "react";

const useIsMobile = () => {
  const [width, setWidth] = useState(1000);
  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    if (window != null) {
      window.addEventListener("resize", handleWindowSizeChange);
      return () => {
        window.removeEventListener("resize", handleWindowSizeChange);
      };
    }
  }, []);

  return width <= 768;
};

export default useIsMobile;
