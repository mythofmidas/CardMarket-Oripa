import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";

import { bgColorAtom } from "../../store/theme";

import PrizeCard from "../../components/Others/PrizeCard";

const ShowDrawedPrizes = () => {
  const { t } = useTranslation();
  const [bgColor] = useAtom(bgColorAtom);
  const location = useLocation();
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const { prizes } = location.state || {};

  const [index, setIndex] = useState(0);
  const [showPrizeFlag, setShowPrizeFlag] = useState(false);
  const [showNext, setShowNext] = useState(true);
  const [showVideoFlag, setShowFlagVideo] = useState(false);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset to the beginning and play
    // videoRef.current.currentTime = 0;
    // videoRef.current.play();

    if (index === prizes.length - 1) {
      setShowNext(false);
    }
    const video = videoRef.current;

    // Set attributes
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    // Prevent fullscreen on iOS
    const handleWebkitBeginFullscreen = (event) => {
      event.preventDefault();
    };

    // Handle click/tap events
    const handleClick = (event) => {
      event.preventDefault();
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    };

    // Handle orientation change
    const handleOrientationChange = () => {
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
    };

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };

    const handleWebkitFullscreenChange = () => {
      if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
      }
    };

    // Add event listeners
    video.addEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen);
    video.addEventListener('click', handleClick);
    window.addEventListener('orientationchange', handleOrientationChange);
    video.addEventListener('fullscreenchange', handleFullscreenChange);
    video.addEventListener('webkitfullscreenchange', handleWebkitFullscreenChange);

    // Cleanup
    return () => {
      video.removeEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen);
      video.removeEventListener('click', handleClick);
      window.removeEventListener('orientationchange', handleOrientationChange);
      video.removeEventListener('fullscreenchange', handleFullscreenChange);
      video.removeEventListener('webkitfullscreenchange', handleWebkitFullscreenChange);
    };


  }, [index, prizes.length]);

  // skip video
  // const skipVideo = () => {
  //   setShowFlagVideo(true);
  //   setShowPrizeFlag(true);
  // };

  // end video
  const endVideo = () => {
    setShowPrizeFlag(true);
  };

  // show next prize
  const nextPrize = () => {
    videoRef.current.pause();
    setIndex(index + 1);
    if (!showVideoFlag) setShowPrizeFlag(false);
  };

  // go to shipping page
  const finishPrize = () => {
    videoRef.current.pause();

    navigate("/user/decideShip", {
      state: { prizes: prizes },
    });
  };
  // Memoize the video source URL
  const videoSrc = useMemo(() => {
    return process.env.REACT_APP_SERVER_ADDRESS + prizes[index].video;
  }, [prizes, index]); // Recalculate only when prizes or index changes

  // Handle video end event
  const handleVideoEnd = useCallback(() => {
    if (videoRef.current) {
      endVideo();
    }
  }, [endVideo]);

  return (
    <>
      <div className={`${showPrizeFlag ? "hidden" : ""}`}>
        {/* {loading && <Spinner />} */}
        <video
          className="object-fill h-[100vh] w-full"
          id="myVideo"
          ref={videoRef}
          onEnded={handleVideoEnd}
          preload="metadata"
          src={videoSrc}
          playsInline
          webkit-playsinline
        />
        {/* <button
          className="fixed flex flex-wrap items-center bottom-4 left-4 border-1 cursor-pointer hover:opacity-50 opacity-80 text-white text-center text-lg rounded-md px-3 py-1"
          style={{ backgroundColor: bgColor }}
          onClick={() => skipVideo()}
        >
          {t("skipVideo")}
        </button> */}
      </div>
      <div className={`m-auto ${!showPrizeFlag ? "hidden" : ""}`}>
        <PrizeCard img_url={prizes[index].img_url} width={300} height={500} />
      </div>
      {(showNext && showPrizeFlag) ? (
        <button
          className="fixed flex flex-wrap items-center right-[4vh] bottom-14 border-1 cursor-pointer hover:opacity-50 opacity-80 text-white text-center text-lg rounded-md px-3 py-1"
          style={{ backgroundColor: bgColor }}
          onClick={() => nextPrize()}
        >
          {t("next")}
        </button>
      ) :
      <button
        className="fixed flex flex-wrap items-center bottom-14 right-[4vh] border-1 cursor-pointer hover:opacity-50 opacity-80 text-white text-center text-lg rounded-md px-3 py-1"
        style={{ backgroundColor: bgColor }}
        onClick={() => finishPrize()}
      >
        {(!showNext && showPrizeFlag) ? t("finish") : t("skipVideo")}
      </button>
      }
    </>
  );
};

export default ShowDrawedPrizes;
