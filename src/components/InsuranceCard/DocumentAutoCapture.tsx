import { useState } from "react";
import { dispatchControlEvent, DocumentCustomEvent, ControlEventInstruction } from "@innovatrics/dot-document-auto-capture/events";
import DocumentCamera from "./DocumentCamera";
import DocumentUi from "./DocumentUi";
import styles from "../../styles/index.module.css";
import buttonStyles from "../../styles/button.module.css";
import { DocumentCallback } from "@innovatrics/dot-document-auto-capture/.";
import { analyzeDocument, convertImageToBase64, getAnalysisResult } from "../../utils/utils";

interface Props {
  onPhotoTaken: DocumentCallback;
  onError: (error: Error) => void;
  onBackClick: () => void;
}

function DocumentAutoCapture({ onPhotoTaken, onError, onBackClick }: Props) {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [capturingFrontSide, setCapturingFrontSide] = useState(true);
  const [isCapturingBackSide, setIsCapturingBackSide] = useState(false);
  const [frontSideAnalysis, setFrontSideAnalysis] = useState<any | null>(null);
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [attempts, setAttempts] = useState<number>(0);

  const handlePhotoTaken: DocumentCallback = async (imageData, content) => {
    const base64Image = await convertImageToBase64(imageData.image);
  
    if (isCapturingBackSide) {
      onPhotoTaken(imageData, content);
      setIsCapturingBackSide(false);
      setCapturingFrontSide(true);
      setWarningMessage(""); // Clear any previous warning messages
    } else {
      if (base64Image) {
        const operationLocation = await analyzeDocument(base64Image, false);
        const analysisResult = await getAnalysisResult(operationLocation);
        setFrontSideAnalysis(analysisResult);
  
        const containsInsurerKey = analysisResult.some((doc: any) => doc.fields && "Insurer" in doc.fields);
  
        if (containsInsurerKey) {
          onPhotoTaken(imageData, content);
          setIsButtonDisabled(true);
          setCapturingFrontSide(false);
          setIsCapturingBackSide(true);
          setWarningMessage(""); // Clear any previous warning messages
  
          setTimeout(() => {
            dispatchControlEvent(
              DocumentCustomEvent.CONTROL,
              ControlEventInstruction.CONTINUE_DETECTION
            );
            setIsButtonDisabled(false);
          }, 2000);
        } else {
          setWarningMessage("Please capture the front card of the Insurance Card.");
          setAttempts(attempts + 1); // Increment attempts to force re-render
        }
      } else {
        console.error("Image conversion to base64 failed. Image may be null or undefined.");
      }
    }
  };

  return (
    <>
      <h2>Document auto capture</h2>
      <div>
        <button
          className={buttonStyles.primary}
          onClick={() => dispatchControlEvent(DocumentCustomEvent.CONTROL, ControlEventInstruction.CONTINUE_DETECTION)}
          disabled={isButtonDisabled}
        >
          Continue Detection
        </button>

        <button className={buttonStyles.primary} onClick={onBackClick}>
          Back
        </button>
      </div>
      <div className={styles.container}>
        <DocumentCamera
          key={attempts} // Add key to force re-render
          cameraFacing="environment"
          onPhotoTaken={handlePhotoTaken}
          onError={onError}
        />
        <DocumentUi showCameraButtons />
      </div>
      <div className={styles.indicator}>
        {capturingFrontSide && !isCapturingBackSide && <p>Capturing Front Side</p>}
        {!capturingFrontSide && isCapturingBackSide && <p>Capturing Back Side</p>}
      </div>
      {warningMessage && <div className={styles.warning}>{warningMessage}</div>}
    </>
  );
}

export default DocumentAutoCapture;
