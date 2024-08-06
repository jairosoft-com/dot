import DocumentCamera from "./DocumentCamera";
import DocumentUi from "./DocumentUi";
import styles from "../../styles/index.module.css";
import {  DocumentCallback } from "@innovatrics/dot-document-auto-capture/.";

interface Props {
  onPhotoTaken: DocumentCallback;
  onError: (error: Error) => void;
  onBackClick: () => void;
}

function DocumentAutoCaptureBack({ onPhotoTaken, onError, onBackClick }: Props) {

  const handlePhotoTaken: DocumentCallback = async (imageData, content) => {
      onPhotoTaken(imageData, content);
  };

  return (
    <>
      <h2>Document auto capture</h2>
      <div className={styles.container}>
        <DocumentCamera
          cameraFacing="environment"
          onPhotoTaken={handlePhotoTaken}
          onError={onError}
        />
        <DocumentUi showCameraButtons />
      </div>
      <div className={styles.indicator}>
        <p>Capturing Back Side</p>
      </div>
    </>
  );
}

export default DocumentAutoCaptureBack;
