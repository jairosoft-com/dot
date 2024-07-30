import styles from "../styles/index.module.css";
import PhotoIdFieldForm from "../components/PhotoId/PhotoIdFieldForm";
import InsuranceCardFieldForm from "../components/InsuranceCard/FieldForm";
import { 
  useRef, 
  useState, 
  useEffect } from "react";
import { 
  analyzeDocument, 
  convertImageToBase64, 
  getAnalysisResult } from "../utils/utils";
import Document from "../types/document";

interface Props {
  photoIdUrl?: string;
  insuranceFrontIdUrl?: string;
  insuranceBackIdUrl?: string;
  title?: string; // Add title prop
}

function PhotoResult({ photoIdUrl = "", insuranceFrontIdUrl = "", insuranceBackIdUrl = "", title = "" }: Props) { // Destructure title prop
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
          setAnalysisResultBackCard(documentsBackCard)
        }
      } catch (error) {
        console.error('Error analyzing document:', error);
      } finally {
        setLoading(false);
      }
    };

    // Convert image to Base64 when the image loads and then analyze it
    const imgElementPhotoId = photoIdImgRef.current; // For Photo Id
    const imgElementFrontCard = insuranceCardFrontImgRef.current; // For Insurance Card Front 
    const imgElementBackCard = insuranceCardBackImgRef.current; // For Insurance Card Front 
    if (imgElementPhotoId && imgElementFrontCard && imgElementBackCard) {
      imgElementPhotoId.onload = () => {
        const base64String = convertImageToBase64(imgElementPhotoId);
        if (base64String) {
          setBase64photoId(base64String);
        } else {
          console.error('Failed to convert image to Base64');
        }
      };

      imgElementFrontCard.onload = () => {
        const base64String = convertImageToBase64(imgElementFrontCard);
        if (base64String) {
          setBase64frontCard(base64String);
        } else {
          console.error('Failed to convert image to Base64');
        }
      };

      imgElementBackCard.onload = () => {
        const base64String = convertImageToBase64(imgElementBackCard);
        if (base64String) {
          setBase64backCard(base64String);
        } else {
          console.error('Failed to convert image to Base64');
        }
      };
    }

    // Watch for base64 change to trigger document analysis
    if (base64photoId && base64frontCard && base64backCard) {
      analyzeDocumentData();
    }

    // Cleanup function to remove the onload handler
    return () => {
      if (imgElementPhotoId && imgElementFrontCard && imgElementBackCard) {
        imgElementPhotoId.onload = null;
        imgElementFrontCard.onload = null;
        imgElementBackCard.onload = null;
      }
    };
  }, [photoIdUrl, 
    insuranceFrontIdUrl, 
    insuranceBackIdUrl, 
    base64photoId, 
    base64frontCard, 
    base64backCard]);

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