import { useState } from "react";
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
  const [capturingFrontSide, setCapturingFrontSide] = useState(true);
  const [isCapturingBackSide, setIsCapturingBackSide] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [cameraKey, setCameraKey] = useState<number>(0); // State variable to force re-render of DocumentCamera

  const handlePhotoTaken: DocumentCallback = async (imageData, content) => {
    const base64Image = await convertImageToBase64(imageData.image);

    if (base64Image) {
      try {
        const operationLocation = await analyzeDocument(base64Image, false);
        const analysisResult = await getAnalysisResult(operationLocation);

        const containsInsurerKey = analysisResult.some((doc: any) => doc.fields && "Insurer" in doc.fields);

        if (containsInsurerKey) {
          onPhotoTaken(imageData, content);
          setCapturingFrontSide(false);
          setIsCapturingBackSide(true);
          setWarningMessage(""); // Clear any previous warning messages
        } else {
          setWarningMessage("Please capture the front card of the Insurance Card.");
          setCameraKey(prevKey => prevKey + 1); // Force re-render of DocumentCamera
        }
      } catch (error) {
        console.error("Error analyzing document:", error);
        setWarningMessage("An error occurred while analyzing the document. Please try again.");
        setCameraKey(prevKey => prevKey + 1); // Force re-render of DocumentCamera
      }
    }
  };

  return (
    <>
      <h2>Document auto capture</h2>
      <div className={styles.container}>
        <DocumentCamera
          key={cameraKey} // Use the key prop to force re-render
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
      <div className={styles.buttonContainer}>
        <button
          className={buttonStyles.primary}
          onClick={onBackClick}
        >
          Back
        </button>
      </div>
    </>
  );
}

export default DocumentAutoCapture;
