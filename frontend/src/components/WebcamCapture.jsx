import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const WebcamCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [img, setImg] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImg(imageSrc);
    onCapture(imageSrc);
  };

  return (
    <div className="text-center space-y-3">
      {!img ? (
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="rounded-xl border border-slate-700"
        />
      ) : (
        <img
          src={img}
          alt="captured"
          className="rounded-xl border border-slate-700"
        />
      )}

      <button
        onClick={capture}
        className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-500"
      >
        Capture Face
      </button>
    </div>
  );
};

export default WebcamCapture;
