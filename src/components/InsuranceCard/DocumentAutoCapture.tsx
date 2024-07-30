import { useState } from "react";
import { dispatchControlEvent, DocumentCustomEvent, ControlEventInstruction } from "@innovatrics/dot-document-auto-capture/events";
import DocumentCamera from "./DocumentCamera";
import DocumentUi from "./DocumentUi";
import styles from "../../styles/index.module.css";
import buttonStyles from "../../styles/button.module.css";
import { DocumentCallback } from "@innovatrics/dot-document-auto-capture/.";

interface Props {
  onPhotoTaken: DocumentCallback;
  onError: (error: Error) => void;
  onBackClick: () => void;
}

function DocumentAutoCapture({ onPhotoTaken, onError, onBackClick }: Props) {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [capturingFrontSide, setCapturingFrontSide] = useState(true);
  const [isCapturingBackSide, setIsCapturingBackSide] = useState(false);

  const handlePhotoTaken: DocumentCallback = (imageData, content) => {
    if (isCapturingBackSide) {
      // Handle the back side capture
      onPhotoTaken(imageData, content);
      // Optionally, handle completion of the back side capture
      setIsCapturingBackSide(false); // Reset state
      setCapturingFrontSide(true); // Reset to front side capture
    } else {
      // Handle the front side capture
      onPhotoTaken(imageData, content);
      
      // Simulate delay before starting back side capture
      setIsButtonDisabled(true); // Disable the button while waiting
      setCapturingFrontSide(false); // Indicate we are moving to back side capture
      setIsCapturingBackSide(true); // Indicate we are capturing the back side

      setTimeout(() => {
        // Trigger the continuous detection for the back side
        dispatchControlEvent(
          DocumentCustomEvent.CONTROL,
          ControlEventInstruction.CONTINUE_DETECTION
        );
        
        setIsButtonDisabled(false); // Re-enable the button after delay
      }, 2000); // Adjust the delay as needed
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
      {/* parent container must have position: relative */}
      <div className={styles.container}>
        <DocumentCamera
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
    </>
  );
}

export default DocumentAutoCapture;
