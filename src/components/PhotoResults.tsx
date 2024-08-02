import React, { useRef, useState, useEffect } from "react";
import styles from "../styles/index.module.css";
import PhotoIdFieldForm from "../components/PhotoId/PhotoIdFieldForm";
import InsuranceCardFieldForm from "../components/InsuranceCard/FieldForm";
import { analyzeDocument, convertImageToBase64, getAnalysisResult } from "../utils/utils";
import Document from "../types/document";

interface Props {
  photoIdUrl?: string;
  insuranceFrontIdUrl?: string;
  insuranceBackIdUrl?: string;
  title?: string; // Add title prop
  analysisResult?: Document[]; // Add analysisResult prop
}

function PhotoResult({ photoIdUrl = "", insuranceFrontIdUrl = "", insuranceBackIdUrl = "", title = "", analysisResult }: Props) { // Destructure title and analysisResult props
  const [analysisResultPhotoId, setAnalysisResultPhotoId] = useState<Document[] | null>(null);
  const [analysisResultFrontCard, setAnalysisResultFrontCard] = useState<Document[] | null>(null);
  const [analysisResultBackCard, setAnalysisResultBackCard] = useState<Document[] | null>(null);
  const [base64photoId, setBase64photoId] = useState<string>('');
  const [base64frontCard, setBase64frontCard] = useState<string>('');
  const [base64backCard, setBase64backCard] = useState<string>('');
  const photoIdImgRef = useRef<HTMLImageElement | null>(null);
  const insuranceCardFrontImgRef = useRef<HTMLImageElement | null>(null);
  const insuranceCardBackImgRef = useRef<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const analyzeDocumentData = async () => {
      try {
        if (base64photoId && base64frontCard && base64backCard) {
          setLoading(true);
          // parameter true if photoId
          const operationLocationPhotoId = await analyzeDocument(base64photoId, true);
          const documentsPhotoId = await getAnalysisResult(operationLocationPhotoId);

          const operationLocationFrontCard = await analyzeDocument(base64frontCard, false);
          const documentsFrontCard = await getAnalysisResult(operationLocationFrontCard);

          const operationLocationBackCard = await analyzeDocument(base64backCard, false);
          const documentsBackCard = await getAnalysisResult(operationLocationBackCard);

          setAnalysisResultPhotoId(documentsPhotoId);
          setAnalysisResultFrontCard(documentsFrontCard);
          setAnalysisResultBackCard(documentsBackCard);
        }
      } catch (error) {
        console.error('Error analyzing document:', error);
      } finally {
        setLoading(false);
      }
    };

    const convertAndAnalyzeImage = async (imgRef: React.RefObject<HTMLImageElement>, setBase64: React.Dispatch<React.SetStateAction<string>>) => {
      if (imgRef.current) {
        const base64String = await convertImageToBase64(imgRef);
        if (base64String) {
          const base64WithoutPrefix = base64String.replace(/^data:image\/png;base64,/, '');
          setBase64(base64WithoutPrefix);
        } else {
          console.error('Failed to convert image to Base64');
        }
      }
    };

    if (photoIdImgRef.current && insuranceCardFrontImgRef.current && insuranceCardBackImgRef.current) {
      convertAndAnalyzeImage(photoIdImgRef, setBase64photoId);
      convertAndAnalyzeImage(insuranceCardFrontImgRef, setBase64frontCard);
      convertAndAnalyzeImage(insuranceCardBackImgRef, setBase64backCard);
    }

    if (base64photoId && base64frontCard && base64backCard) {
      analyzeDocumentData();
    }
  }, [
    photoIdUrl,
    insuranceFrontIdUrl,
    insuranceBackIdUrl,
    base64photoId,
    base64frontCard,
    base64backCard,
  ]);

  return (
    <div>
      <div className={styles.photoContainer}>
        <div>
          <h2>Photo ID</h2>
          <img ref={photoIdImgRef} alt="photo id image" src={photoIdUrl} />
        </div>
        <div>
          <h2>Insurance Card (Front)</h2>
          <img ref={insuranceCardFrontImgRef} alt="insurance card front image" src={insuranceFrontIdUrl} />
        </div>
        <div>
          <h2>Insurance Card (Back)</h2>
          <img ref={insuranceCardBackImgRef} alt="insurance card back image" src={insuranceBackIdUrl} />
        </div>
      </div>

      <div className={styles.resultContainer}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {analysisResultPhotoId && (
              <div>
                <h4>General Information</h4>
                {analysisResultPhotoId.length > 0 ? (
                  <PhotoIdFieldForm fields={analysisResultPhotoId[0].fields} />
                ) : (
                  <p>No result available.</p>
                )}
              </div>
            )}
            {analysisResultFrontCard && (
              <div>
                <h4>Insurance Card Information</h4>
                {analysisResultFrontCard.length > 0 ? (
                  <InsuranceCardFieldForm fields={analysisResultFrontCard[0].fields} />
                ) : (
                  <p>No result available.</p>
                )}
              </div>
            )}
            {analysisResultBackCard && (
              <div>
                {analysisResultBackCard.length > 0 ? (
                  <InsuranceCardFieldForm fields={analysisResultBackCard[0].fields} />
                ) : (
                  <p>No result available.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PhotoResult;
