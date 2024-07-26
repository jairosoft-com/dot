import type {
  CallbackImage,
  DocumentCallback,
  DocumentComponentData,
} from "@innovatrics/dot-document-auto-capture";
import type {
  FaceCallback,
  FaceComponentData,
} from "@innovatrics/dot-face-auto-capture";
import type { MagnifEyeLivenessCallback } from "@innovatrics/dot-magnifeye-liveness";
import { SmileLivenessCallback } from "@innovatrics/dot-smile-liveness";
import { useCallback, useEffect, useState } from "react";
import ComponentSelect from "./components/ComponentSelect";
import DocumentAutoCapture from "./components/InsuranceCard/DocumentAutoCapture";
import FaceAutoCapture from "./components/FaceAutoCapture";
import MagnifEyeLiveness from "./components/MagnifEyeLiveness";
import PhotoResult from "./components/InsuranceCard/PhotoResult";
import SmileLiveness from "./components/SmileLiveness";
import styles from "./styles/index.module.css";
import { Step } from "./types";
// PhotoID
import PhotoIdDocumentCapture from "./components/PhotoId/PhotoIdDocumentCapture";
import PhotoIdResult from "./components/PhotoId/PhotoIdResult";

function App() {
  const [step, setStep] = useState<Step>(Step.SELECT_COMPONENT);
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [photoIdUrl, setPhotoIdUrl] = useState<string>();
  const [insuranceCardUrl, setInsuranceCardUrl] = useState<string>();
  const [isPhotoIdCaptured, setIsPhotoIdCaptured] = useState<boolean>(false);
  const [isInsuranceCardCaptured, setIsInsuranceCardCaptured] = useState<boolean>(false);

  const handlePhotoTaken = <T,>(
    imageData: CallbackImage<T>,
    content?: Uint8Array,
  ) => {
    const imageUrl = URL.createObjectURL(imageData.image);
    setPhotoUrl(imageUrl);
  };

  const handlePhotoIdTaken = <T,>(
    imageData: CallbackImage<T>,
    content?: Uint8Array,
  ) => {
    const imageUrl = URL.createObjectURL(imageData.image);
    localStorage.setItem("photoId", imageUrl);
    setPhotoIdUrl(imageUrl);
    setIsPhotoIdCaptured(true);
    setStep(Step.INSURANCE_CARD_CAPTURE);
  };

  // For PhotoId
  const handleDocumentPhotoIdTaken: DocumentCallback = (imageData, content) => {
    handlePhotoIdTaken(imageData, content);
  };

  // For insurance card
  const handleDocumentPhotoTaken: DocumentCallback = (imageData, content) => {
    const imageUrl = URL.createObjectURL(imageData.image);
    localStorage.setItem("insuranceCard", imageUrl);
    setInsuranceCardUrl(imageUrl);
    setIsInsuranceCardCaptured(true);
  };

  const handleFaceCapturePhotoTaken: FaceCallback = (imageData, content) => {
    handlePhotoTaken(imageData, content);
  };

  /**
   * At this point use @content property with Digital Identity Service in order to evaluate the MagnifEye liveness score.
   * See: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-dis/latest/documentation/#_magnifeye_liveness_check
   */
  const handleMagnifEyeComplete: MagnifEyeLivenessCallback = (
    imageData,
    content,
  ) => {
    handlePhotoTaken(imageData, content);
  };

  /**
   * At this point use @content property with Digital Identity Service in order to evaluate the Smile liveness score.
   */
  const handleSmileComplete: SmileLivenessCallback = (imageData, content) => {
    const [, smileImageData] = imageData;
    handlePhotoTaken(smileImageData, content);
  };

  const handleError = useCallback((error: Error) => {
    alert(error);
  }, []);

  const handleBackClick = () => {
    setPhotoIdUrl(undefined);
    setInsuranceCardUrl(undefined);
    setIsPhotoIdCaptured(false);
    setIsInsuranceCardCaptured(false);
    setStep(Step.SELECT_COMPONENT);
  };

  useEffect(() => {
    if (isPhotoIdCaptured && isInsuranceCardCaptured) {
      setStep(Step.RESULTS);
    }
  }, [isPhotoIdCaptured, isInsuranceCardCaptured]);

  const renderStep = (currentStep: Step) => {
    switch (currentStep) {
      case Step.DOCUMENT_CAPTURE:
        return (
          <>
            <PhotoIdDocumentCapture
              onPhotoTaken={handleDocumentPhotoIdTaken}
              onError={handleError}
              onBackClick={handleBackClick}
            />
          </>
        );
      case Step.FACE_CAPTURE:
        return (
          <>
            <FaceAutoCapture
              onPhotoTaken={handleFaceCapturePhotoTaken}
              onError={handleError}
              onBackClick={handleBackClick}
            />
            {photoUrl && <PhotoResult photoUrl={photoUrl} />}
          </>
        );
      case Step.MAGNIFEYE_LIVENESS:
        return (
          <>
            <MagnifEyeLiveness
              onComplete={handleMagnifEyeComplete}
              onError={handleError}
              onBackClick={handleBackClick}
            />
            {photoUrl && <PhotoResult photoUrl={photoUrl} />}
          </>
        );
      case Step.SMILE_LIVENESS:
        return (
          <>
            <SmileLiveness
              onComplete={handleSmileComplete}
              onError={handleError}
              onBackClick={handleBackClick}
            />
            {photoUrl && <PhotoResult photoUrl={photoUrl} />}
          </>
        );
      case Step.INSURANCE_CARD_CAPTURE:
        return (
          <DocumentAutoCapture
            onPhotoTaken={handleDocumentPhotoTaken}
            onError={handleError}
            onBackClick={handleBackClick}
          />
        );
      case Step.RESULTS:
        return (
          <>
            <PhotoIdResult photoUrl={photoIdUrl} />
            <PhotoResult photoUrl={insuranceCardUrl} />
          </>
        );
      default:
        return <ComponentSelect setStep={setStep} />;
    }
  };

  return (
    <div className={styles.app}>
      <h1>Jairosoft ImageCapture+OCR</h1>
      {renderStep(step)}
    </div>
  );
}

export default App;
