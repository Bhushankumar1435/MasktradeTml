import React, { useEffect } from "react";

const Loader = () => {
   useEffect(() => {
    const timer = setTimeout(() => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.10/dist/dotlottie-wc.js";
        script.type = "module";
        document.body.appendChild(script);
    }, 1000);

    return () => clearTimeout(timer); // cleanup
}, []);

    return (
        <div style={styles.container}>
            <dotlottie-wc
                src="https://lottie.host/40cbd728-b4ed-4f5a-82df-b58b408036e6/L78vF2u5K9.lottie"
                style={{
                    width: "150px",
                    height: "150px",
                    filter: "sepia(1) saturate(5) hue-rotate(10deg) brightness(1.05)"
                }}
                autoplay
                loop
            ></dotlottie-wc>
        </div>
    );
};

export default Loader;

const styles = {
    container: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
    }
};
