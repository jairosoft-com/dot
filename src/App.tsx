import { useState, useEffect, useCallback } from "react";
import ComponentSelect from "./components/ComponentSelect";
import DocumentAutoCapture from "./components/InsuranceCard/DocumentAutoCapture";
import DocumentAutoCaptureBack from "./components/InsuranceCard/DocumentAutoCaptureBack";
import PhotoResult from "./components/InsuranceCard/PhotoResult";
import PhotoResults from "./components/PhotoResults";
import styles from "./styles/index.module.css";
import { Step } from "./types";
import PhotoIdDocumentCapture from "./components/PhotoId/PhotoIdDocumentCapture";
import { CallbackImage, DocumentCallback } from "@innovatrics/dot-document-auto-capture/.";
import Document from "./types/document";

function App() {
  const [step, setStep] = useState<Step>(Step.SELECT_COMPONENT);
  const [photoIdUrl, setPhotoIdUrl] = useState<string | undefined>();
  const [insuranceCardUrl, setInsuranceCardUrl] = useState<string | undefined>();
  const [backSideUrl, setBackSideUrl] = useState<string | undefined>();
  const [isPhotoIdCaptured, setIsPhotoIdCaptured] = useState<boolean>(false);
  const [isInsuranceCardCaptured, setIsInsuranceCardCaptured] = useState<boolean>(false);
  const [capturedFrontSide, setCapturedFrontSide] = useState<boolean>(false);
  const [capturedBackSide, setCapturedBackSide] = useState<boolean>(false);
  const [showInsuranceCardCaptureFront, setShowInsuranceCardCaptureFront] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<Document[]>([]);

  const handlePhotoIdTaken = <T,>(
    imageData: CallbackImage<T>,
    content?: Uint8Array,
  ) => {
    const imageUrl = URL.createObjectURL(imageData.image);
    localStorage.setItem("photoId", imageUrl);
    setPhotoIdUrl(imageUrl);
    setIsPhotoIdCaptured(true);
    setStep(Step.INSURANCE_CARD_CAPTURE_FRONT);
  };

  const handleDocumentPhotoIdTaken: DocumentCallback = (imageData, content) => {
    handlePhotoIdTaken(imageData, content);
  };

  const handleDocumentPhotoTakenFront: DocumentCallback = (imageData, content) => {
    const imageUrl = URL.createObjectURL(imageData.image);

    // Handle front side
    setInsuranceCardUrl(imageUrl);
    setCapturedFrontSide(true);
    // setStep(Step.INSURANCE_CARD_CAPTURE_BACK);
  };

  const handleDocumentPhotoTakenBack: DocumentCallback = (imageData, content) => {
    const imageUrl = URL.createObjectURL(imageData.image);

    // Handle back side
    setBackSideUrl(imageUrl);
    setCapturedBackSide(true);
    setIsInsuranceCardCaptured(true);
    setStep(Step.RESULTS);
  };

  const handleError = useCallback((error: Error) => {
    alert(error);
  }, []);

  const handleBackClick = () => {
    setPhotoIdUrl(undefined);
    setInsuranceCardUrl(undefined);
    setBackSideUrl(undefined);
    setIsPhotoIdCaptured(false);
    setIsInsuranceCardCaptured(false);
    setCapturedFrontSide(false);
    setCapturedBackSide(false);
    setShowInsuranceCardCaptureFront(false);
    setStep(Step.SELECT_COMPONENT);
  };

  const handleContinueDetection = () => {
    setCapturedFrontSide(false);
    setStep(Step.INSURANCE_CARD_CAPTURE_BACK);
  };

  useEffect(() => {
    if (isPhotoIdCaptured && isInsuranceCardCaptured) {
      setStep(Step.RESULTS);
    }
  }, [isPhotoIdCaptured, isInsuranceCardCaptured]);

  useEffect(() => {
    if (step === Step.INSURANCE_CARD_CAPTURE_FRONT) {
      const timer = setTimeout(() => {
        setShowInsuranceCardCaptureFront(true);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer);
    }
  }, [step]);

  const renderStep = (currentStep: Step) => {
    switch (currentStep) {
      case Step.DOCUMENT_CAPTURE:
        return (
          <PhotoIdDocumentCapture
            onPhotoTaken={handleDocumentPhotoIdTaken}
            onError={handleError}
            onBackClick={handleBackClick}
          />
        );
      case Step.INSURANCE_CARD_CAPTURE_FRONT:
        return (
          <>
            {showInsuranceCardCaptureFront ? (
              capturedFrontSide ? 
                <PhotoResult 
                  photoUrl={insuranceCardUrl} 
                  onBackClick={handleBackClick}
                  onContinueDetection={handleContinueDetection}
                /> : 
                <DocumentAutoCapture
                  onPhotoTaken={handleDocumentPhotoTakenFront}
                  onError={handleError}
                  onBackClick={handleBackClick}
                />
            ) : (
              <div>Loading...</div> // Show a loading message or spinner
            )}
          </>
        );
      case Step.INSURANCE_CARD_CAPTURE_BACK:
        return (
          <DocumentAutoCaptureBack
            onPhotoTaken={handleDocumentPhotoTakenBack}
            onError={handleError}
            onBackClick={handleBackClick} 
          />
        );
      case Step.RESULTS:
        return (
          <PhotoResults
            photoIdUrl={photoIdUrl}
            insuranceFrontIdUrl={insuranceCardUrl}
            insuranceBackIdUrl={backSideUrl}
            analysisResult={analysisResult}
          />
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
