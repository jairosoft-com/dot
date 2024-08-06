import styles from "../../styles/index.module.css";
import { useRef, useState, useEffect } from "react";
import { analyzeDocument, convertImageToBase64, getAnalysisResult } from "../../utils/utils";
import Document from "../../types/document";
import buttonStyles from "../../styles/button.module.css";
import { dispatchControlEvent, DocumentCustomEvent, ControlEventInstruction } from "@innovatrics/dot-document-auto-capture/events";
import Lottie from "lottie-react";
import animationData from "../../resources/turn_card.json";

interface Props {
  photoUrl?: string;
  title?: string;
  onBackClick: () => void;
  onContinueDetection: () => void;
}

function PhotoResult({ photoUrl = "", title = "", onBackClick, onContinueDetection }: Props) {
  const [analysisResult, setAnalysisResult] = useState<Document[] | null>(null);
  const [base64, setBase64] = useState<string>('');
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const analyzeDocumentData = async () => {
      try {
        if (base64) {
          setLoading(true);
          const operationLocation = await analyzeDocument(base64, false);
          const documents = await getAnalysisResult(operationLocation);
          setAnalysisResult(documents);
        }
      } catch (error) {
        console.error('Error analyzing document:', error);
      } finally {
        setLoading(false);
      }
    };

    const imgElement = imageRef.current;
    if (imgElement) {
      imgElement.onload = async () => {
        try {
          const base64String = await convertImageToBase64(imageRef);
          if (base64String) {
            setBase64(base64String);
          } else {
            console.error('Failed to convert image to Base64');
          }
        } catch (error) {
          console.error('Error converting image to Base64:', error);
        }
      };
    }

    if (base64) {
      analyzeDocumentData();
    }

    return () => {
      if (imgElement) {
        imgElement.onload = null;
      }
    };
  }, [photoUrl, base64]);

  return (
    <div className={styles.container}>
      <div className={styles.photoResultContainer}>
        <div className={styles.photoResultButtons}>
          <button
            className={buttonStyles.primary}
            onClick={() => {
              dispatchControlEvent(DocumentCustomEvent.CONTROL, ControlEventInstruction.CONTINUE_DETECTION);
              onContinueDetection(); // Call the callback function when the button is clicked
            }}
          >
            Continue
          </button>
          <button className={buttonStyles.primary} onClick={onBackClick}>
            Back
          </button>
        </div>
        <div className={styles.photoResultGif}>
          <Lottie animationData={animationData} loop={true} autoplay={true} />
          <span className={styles.photoResultGifLabel}>Turn Card</span>
        </div>
        <div>
          <img className={ styles.photoResultImg } ref={imageRef} alt={title} src={photoUrl} />
        </div>
      </div>
    </div>
  );
}

export default PhotoResult;
