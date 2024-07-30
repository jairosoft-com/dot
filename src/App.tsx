import { useState, useCallback, useEffect } from "react";
import ComponentSelect from "./components/ComponentSelect";
import DocumentAutoCapture from "./components/InsuranceCard/DocumentAutoCapture";
import FaceAutoCapture from "./components/FaceAutoCapture";
import MagnifEyeLiveness from "./components/MagnifEyeLiveness";
import PhotoResult from "./components/InsuranceCard/PhotoResult";
import PhotoResults from "./components/PhotoResults";
import SmileLiveness from "./components/SmileLiveness";
import styles from "./styles/index.module.css";
import { Step } from "./types";
import PhotoIdDocumentCapture from "./components/PhotoId/PhotoIdDocumentCapture";
import PhotoIdResult from "./components/PhotoId/PhotoIdResult";
import { CallbackImage, DocumentCallback } from "@innovatrics/dot-document-auto-capture/.";
import { dispatchControlEvent, DocumentCustomEvent, ControlEventInstruction } from "@innovatrics/dot-document-auto-capture/events";
import { FaceCallback } from "@innovatrics/dot-face-auto-capture/.";
import { MagnifEyeLivenessCallback } from "@innovatrics/dot-magnifeye-liveness";
import { SmileLivenessCallback } from "@innovatrics/dot-smile-liveness";

function App() {
  const [step, setStep] = useState<Step>(Step.SELECT_COMPONENT);
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [photoIdUrl, setPhotoIdUrl] = useState<string>();
  const [insuranceCardUrl, setInsuranceCardUrl] = useState<string>();
  const [backSideUrl, setBackSideUrl] = useState<string | undefined>();
  const [isPhotoIdCaptured, setIsPhotoIdCaptured] = useState<boolean>(false);
  const [isInsuranceCardCaptured, setIsInsuranceCardCaptured] = useState<boolean>(false);
  const [capturedFrontSide, setCapturedFrontSide] = useState<boolean>(false);
  const [capturedBackSide, setCapturedBackSide] = useState<boolean>(false);

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

    if (!capturedFrontSide) {
      // Handle front side
      localStorage.setItem("insuranceCard", imageUrl);
      setInsuranceCardUrl(imageUrl);
      setCapturedFrontSide(true);
      // Simulate delay before capturing back side
      setTimeout(() => {
        setCapturedBackSide(false); // Reset for back side capture
        // Trigger continuous detection for back side
        dispatchControlEvent(
          DocumentCustomEvent.CONTROL,
          ControlEventInstruction.CONTINUE_DETECTION,
        );
      }, 2000); // 2 seconds delay before continuing to back side capture
    } else {
      // Handle back side
      setBackSideUrl(imageUrl);
      setCapturedBackSide(true);
      setIsInsuranceCardCaptured(true);
    }
  };

  const handleFaceCapturePhotoTaken: FaceCallback = (imageData, content) => {
    handlePhotoTaken(imageData, content);
  };

  const handleMagnifEyeComplete: MagnifEyeLivenessCallback = (
    imageData,
    content,
  ) => {
    handlePhotoTaken(imageData, content);
  };

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
    setBackSideUrl(undefined); // Reset back side URL
    setIsPhotoIdCaptured(false);
    setIsInsuranceCardCaptured(false);
    setCapturedFrontSide(false);
    setCapturedBackSide(false);
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
            {photoUrl && <PhotoResult photoUrl={photoUrl} title="Face Photo" />}
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
            {photoUrl && <PhotoResult photoUrl={photoUrl} title="MagnifEye Liveness" />}
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
            {photoUrl && <PhotoResult photoUrl={photoUrl} title="Smile Liveness" />}
          </>
        );
      case Step.INSURANCE_CARD_CAPTURE:
        return (
          <>
            <DocumentAutoCapture
              onPhotoTaken={handleDocumentPhotoTaken}
              onError={handleError}
              onBackClick={handleBackClick}
            />
          </>
        );
      case Step.RESULTS:
        return (
          <>
            {/* <PhotoIdResult photoUrl={photoIdUrl} /> */}
            <PhotoResults photoIdUrl={photoIdUrl} insuranceFrontIdUrl={insuranceCardUrl} insuranceBackIdUrl={backSideUrl} />
            {/* <PhotoResult photoUrl={insuranceCardUrl} title="Insurance Card Front Side" />
            <PhotoResult photoUrl={backSideUrl} title="Insurance Card Back Side" /> */}
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
